import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { fileName, bucket, difficulty = 'medium', studyMode = 'quiz', fileSize, text } = await req.json()
    const authHeader = req.headers.get('Authorization')!
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user } } = await supabaseClient.auth.getUser(authHeader.replace('Bearer ', ''))

    if (!user) {
      throw new Error('Unauthorized')
    }

    const userId = user.id

    // Fetch user plan from profiles
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('plan')
      .eq('id', userId)
      .single()

    if (profileError) {
      throw new Error('Failed to fetch user profile')
    }

    const userPlan = profile?.plan || 'starter'

    // Check flashcard limits
    let { data: flashUsage } = await supabaseClient
      .from('user_flashcard_usage')
      .select('*')
      .eq('user_id', userId)
      .single()

    const now = new Date()
    const currentMonth = now.toISOString().slice(0, 7) // YYYY-MM
    const flashLastReset = flashUsage?.last_reset_date ? new Date(flashUsage.last_reset_date).toISOString().slice(0, 7) : null

    if (!flashUsage || flashLastReset !== currentMonth) {
      const flashLimits = { starter: 500, pro: 1250, premium: 2500 }
      await supabaseClient
        .from('user_flashcard_usage')
        .upsert({ 
          user_id: userId, 
          plan: userPlan, 
          flashcards_used_this_month: 0, 
          last_reset_date: now.toISOString().slice(0, 10) 
        })
      flashUsage = { plan: userPlan, flashcards_used_this_month: 0 }
    }

    const flashLimits = { starter: 500, pro: 1250, premium: 2500 }
    const flashRemaining = flashLimits[flashUsage.plan] - flashUsage.flashcards_used_this_month
    if (flashRemaining < 25) {
      throw new Error(`Insufficient flashcard quota. You have ${flashRemaining} left this month.`)
    }

    // Check token limits for upload
    let { data: tokenUsage } = await supabaseClient
      .from('user_tokens_usage')
      .select('*')
      .eq('user_id', userId)
      .single()

    const tokenLastReset = tokenUsage?.last_reset_date ? new Date(tokenUsage.last_reset_date).toISOString().slice(0, 7) : null

    if (!tokenUsage || tokenLastReset !== currentMonth) {
      const tokenLimits = { starter: 20, pro: 50, premium: Infinity }
      await supabaseClient
        .from('user_tokens_usage')
        .upsert({ 
          user_id: userId, 
          plan: userPlan, 
          tokens_used_this_month: 0, 
          last_reset_date: now.toISOString().slice(0, 10) 
        })
      tokenUsage = { plan: userPlan, tokens_used_this_month: 0 }
    }

    let contentText = '';

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    if (text) {
      // Direct text input
      contentText = text;
      // Skip upload token check for text
    } else if (fileName && bucket) {
      // Existing file logic
      if (fileSize) {
        // Keep token check for file
        const MB_IN_BYTES = 1024 * 1024;
        const tokensNeeded = Math.ceil(fileSize / (10 * MB_IN_BYTES));
        const tokenLimits = { starter: 20, pro: 50, premium: Infinity }
        const tokenRemaining = tokenLimits[tokenUsage.plan] - tokenUsage.tokens_used_this_month;

        if (userPlan !== 'premium' && tokenRemaining < tokensNeeded) {
          throw new Error(`Insufficient tokens for upload. File requires ${tokensNeeded} tokens, you have ${tokenRemaining} remaining.`)
        }

        // Download and process file as before
        const { data: fileData, error: downloadError } = await supabaseClient.storage
          .from(bucket)
          .download(fileName)

        if (downloadError || !fileData) {
          throw new Error('Failed to download file')
        }

        const fileBuffer = await fileData.arrayBuffer()
        const mimeType = fileData.headers.get('Content-Type') || ''
        let contentText = ''

        if (mimeType.startsWith('text/') || mimeType === 'application/pdf') {
          // For text or PDF, base64 for vision if PDF/image, else text
          if (mimeType === 'application/pdf' || mimeType.startsWith('image/')) {
            const base64 = btoa(String.fromCharCode(...new Uint8Array(fileBuffer)))
            // Use vision API with gpt-4o
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${openaiApiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: 'gpt-4o',  // Changed from gpt-4o-mini for vision support
                messages: [
                  {
                    role: 'user',
                    content: [
                      { type: 'text', text: 'Extract and summarize the key content from this document/image for flashcard generation.' },
                      { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64}` } }
                    ]
                  }
                ],
                max_tokens: 2000
              })
            })
            const data = await response.json()
            contentText = data.choices[0].message.content
          } else {
            // Text file
            contentText = new TextDecoder().decode(fileBuffer)
          }
        } else if (mimeType.startsWith('video/') || mimeType.startsWith('audio/')) {
          // Transcribe with Whisper
          const formData = new FormData()
          formData.append('file', new Blob([fileBuffer]), fileName)
          formData.append('model', 'whisper-1')

          const transcriptionResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${openaiApiKey}` },
            body: formData
          })
          const transcriptionData = await transcriptionResponse.json()
          contentText = transcriptionData.text
        } else {
          throw new Error('Unsupported file type')
        }
      }
    } else {
      throw new Error('Either file or text must be provided')
    }

    if (!contentText || contentText.length < 10) {
      throw new Error('Could not extract meaningful content')
    }

    // Generate flashcards
    const prompt = `Generate exactly 25 flashcards from the following content. Difficulty: ${difficulty}. Study mode: ${studyMode}. 
    Output as JSON array of objects: [{question: "Q", answer: "A", difficulty: "${difficulty}", tags: ["tag1"]}, ...]
    Focus on key concepts, definitions, facts. For ${studyMode}, optimize questions accordingly.`

    const genResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that generates educational flashcards.' },
          { role: 'user', content: `${prompt}\n\nContent:\n${contentText}` }
        ],
        temperature: 0.7,
        max_tokens: 3000
      })
    })

    const genData = await genResponse.json()
    const flashcardsJson = genData.choices[0].message.content
    let flashcards = JSON.parse(flashcardsJson)

    // Create set
    const { data: set } = await supabaseClient
      .from('flashcard_sets')
      .insert({
        user_id: userId,
        name: `Flashcards from ${fileName}`,
        difficulty,
        study_mode: studyMode,
        content: contentText
      })
      .select()
      .single()

    if (!set) {
      throw new Error('Failed to create flashcard set')
    }

    // Insert flashcards
    const formattedFlashcards = flashcards.map((card: any) => ({
      set_id: set.id,
      question: card.question,
      answer: card.answer,
      difficulty: card.difficulty || difficulty,
      tags: card.tags || []
    }))

    const { error: insertError } = await supabaseClient
      .from('flashcards')
      .insert(formattedFlashcards)

    if (insertError) {
      throw new Error('Failed to save flashcards')
    }

    // Update flashcard usage
    await supabaseClient
      .from('user_flashcard_usage')
      .update({ flashcards_used_this_month: flashUsage.flashcards_used_this_month + 25 })
      .eq('user_id', userId)

    // For tokens update, only if file
    if (fileSize && userPlan !== 'premium') {
      const MB_IN_BYTES = 1024 * 1024;
      const tokensUsed = Math.ceil(fileSize / (10 * MB_IN_BYTES));
      await supabaseClient
        .from('user_tokens_usage')
        .update({ tokens_used_this_month: tokenUsage.tokens_used_this_month + tokensUsed })
        .eq('user_id', userId)
    }

    return new Response(
      JSON.stringify({ success: true, setId: set.id, count: 25 }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})