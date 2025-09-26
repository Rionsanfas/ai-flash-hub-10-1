import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { supabase } from '@/integrations/supabase/client'

const AiChat = () => {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [usage, setUsage] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    const fetchUsage = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        navigate('/login')
        return
      }
      const { data, error } = await supabase
        .from('user_chat_usage')
        .select('*')
        .eq('user_id', session.user.id)
        .single()
      if (error && error.code !== 'PGRST116') { // No row
        console.error('Error fetching usage:', error)
      } else {
        setUsage(data)
      }
    }
    fetchUsage()
  }, [navigate])

  useEffect(scrollToBottom, [messages])

  const sendMessage = async () => {
    if (!input.trim() || loading) return
    const userMessage = { role: 'user' as const, content: input }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      toast.error('Authentication failed')
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: { messages: newMessages },
        headers: { Authorization: `Bearer ${session.access_token}` }
      })

      if (error) {
        throw new Error(error.message || 'Failed to get response')
      }

      const assistantMessage = { role: 'assistant' as const, content: data.message }
      setMessages(prev => [...prev, assistantMessage])

      // Refresh usage
      const { data: updatedUsage } = await supabase
        .from('user_chat_usage')
        .select('*')
        .eq('user_id', session.user.id)
        .single()
      setUsage(updatedUsage)
    } catch (err: any) {
      toast.error(err.message)
      // Optionally add error message to chat
      setMessages(prev => [...prev, { role: 'assistant' as const, content: 'Sorry, something went wrong. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const limits = { starter: 50000, pro: 200000, premium: 1000000 } as const

  if (!usage) return <div className="container mx-auto p-4">Loading...</div>

  const remaining = limits[usage.plan as keyof typeof limits] - usage.tokens_used_this_month
  const lowQuota = remaining < 10000

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
      <header className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">AI Study Chat</h1>
        <Card className="p-2">
          <CardContent className="p-2 text-sm">
            Tokens: {usage.tokens_used_this_month} / {limits[usage.plan as keyof typeof limits]}
            {lowQuota && <span className="text-red-500 ml-1">⚠️ Low quota</span>}
          </CardContent>
        </Card>
      </header>

      <div className="flex-1 overflow-hidden border rounded-lg bg-background">
        <div className="h-full overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              Ask questions about your study materials and flashcards!
            </div>
          )}
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p>{message.content}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-muted px-4 py-2 rounded-lg">Typing...</div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t p-4 mt-4">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1"
            disabled={loading}
          />
          <Button onClick={sendMessage} disabled={loading || !input.trim()}>
            {loading ? 'Sending...' : 'Send'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default AiChat