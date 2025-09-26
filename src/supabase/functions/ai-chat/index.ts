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
    const { messages } = await req.json()
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

    // Check token usage limits from shared table
    let { data: tokenUsage } = await supabaseClient
      .from('user_tokens_usage')
      .select('*')
      .eq('user_id', userId)
      .single()

    const now = new Date()
    const currentMonth = now.toISOString().slice(0, 7) // YYYY-MM
    const lastReset = tokenUsage?.last_reset_date ? new Date(tokenUsage.last_reset_date).toISOString().slice(0, 7) : null

    if (!tokenUsage || lastReset !== currentMonth) {
      // Reset usage for new month
      const limits = { starter: 20, pro: 50, premium: Infinity }
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

    const tokenLimits = { starter: 20, pro: 50, premium: Infinity }

    // Choose model and max_tokens based on plan
    const isPremium = userPlan === 'premium'
    const model = isPremium ? 'gpt-4o' : 'gpt-4o-mini'
    const maxTokens = isPremium ? 4000 : 1000

    // Estimate custom tokens needed (before call)
    const outputCostPerToken = isPremium ? 0.00001 : 0.0000006  // GPT-4o $10/1M, GPT-4o-mini $0.60/1M
    const estimatedCost = maxTokens * outputCostPerToken
    const estimatedCustomTokens = Math.ceil(estimatedCost / 0.20)

    // For premium, unlimited - skip check
    if (!isPremium) {
      const remaining = tokenLimits[tokenUsage.plan] - tokenUsage.tokens_used_this_month
      if (remaining < estimatedCustomTokens) {
        throw new Error(`Insufficient tokens for chat. Estimated ${estimatedCustomTokens} needed, you have ${remaining} remaining. Upgrade your plan.`)
      }
    }

    // Fetch user's flashcard sets with content and flashcards
    const { data: sets, error: setsError } = await supabaseClient
      .from('flashcard_sets')
      .select(`
        id, name, content,
        flashcards (
          question, answer, tags
        )
      `)
      .eq('user_id', userId)

    if (setsError) {
      throw new Error('Failed to fetch study materials')
    }

    // Build context string
    let context = "You are a study assistant. Use the following user's uploaded materials and flashcards to provide personalized, educational responses. Focus on explaining concepts, answering questions about the content, and helping with review.\n\n"
    sets.forEach(set => {
      context += `\n--- Flashcard Set: ${set.name} ---\n`
      if (set.content) {
        context += `Material Content:\n${set.content.substring(0, 2000)}...\n` // Truncate long content
      }
      set.flashcards.forEach((card: any) => {
        context += `Q: ${card.question}\nA: ${card.answer}\nTags: ${card.tags.join(', ')}\n\n`
      })
    })

    // Prepare chat messages with system prompt
    const systemMessage = {
      role: 'system',
      content: context
    }

    const chatMessages = [systemMessage, ...messages]

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: chatMessages,
        max_tokens: maxTokens,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error?.message || 'OpenAI API error')
    }

    const data = await response.json()
    const assistantMessage = data.choices[0].message.content
    const outputTokens = data.usage?.completion_tokens || 0

    // Calculate actual custom tokens used
    let actualCustomTokens = 0
    if (!isPremium) {
      const actualCost = outputTokens * outputCostPerToken
      actualCustomTokens = Math.ceil(actualCost / 0.20)
      
      // Update token usage
      await supabaseClient
        .from('user_tokens_usage')
        .update({ tokens_used_this_month: tokenUsage.tokens_used_this_month + actualCustomTokens })
        .eq('user_id', userId)
    }

    return new Response(
      JSON.stringify({ success: true, message: assistantMessage, tokensUsed: isPremium ? 0 : actualCustomTokens }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})