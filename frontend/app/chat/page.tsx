"use client"

import React from "react"
import { useState, useRef, useEffect } from "react"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Paperclip, Mic, MessageCircle, Plus } from "lucide-react"
import { fetchWithAuth } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"

interface ChatMessage {
  id: number
  message: string
  response: string
  message_type: "text" | "image" | "audio"
  created_at: string
}

interface DisplayMessage {
  id: string
  role: "user" | "assistant"
  content: string | React.ReactNode
  timestamp: Date
  message_type: "text" | "image" | "audio"
}

export default function ChatPage() {
  const [messages, setMessages] = useState<DisplayMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const fetchChatHistory = async () => {
      setIsLoading(true)
      try {
        const history: ChatMessage[] = await fetchWithAuth("/chat/history")
        const formattedHistory: DisplayMessage[] = history.reverse().flatMap((chat) => [
          {
            id: `${chat.id}-user`,
            role: "user",
            content: chat.message,
            timestamp: new Date(chat.created_at),
            message_type: chat.message_type,
          },
          {
            id: `${chat.id}-assistant`,
            role: "assistant",
            content: formatAssistantResponse(chat.response),
            timestamp: new Date(chat.created_at),
            message_type: chat.message_type,
          },
        ])
        setMessages([
          {
            id: "initial",
            role: "assistant",
            content:
              "Hello! I'm your AI Medical Assistant. How can I help you today? You can ask me about medicines, health conditions, or upload medical images for analysis.",
            timestamp: new Date(),
            message_type: "text",
          },
          ...formattedHistory,
        ])
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to fetch chat history.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchChatHistory()
  }, [toast])

  const handleNewChat = () => {
    setMessages([
      {
        id: "initial",
        role: "assistant",
        content:
          "Hello! I'm your AI Medical Assistant. How can I help you today? You can ask me about medicines, health conditions, or upload medical images for analysis.",
        timestamp: new Date(),
        message_type: "text",
      },
    ])
    setInput("")
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: DisplayMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
      message_type: "text",
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetchWithAuth("/chat/message", {
        method: "POST",
        body: JSON.stringify({ message: userMessage.content }),
      })
      const assistantMessage: DisplayMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: formatAssistantResponse(response.response),
        timestamp: new Date(),
        message_type: "text",
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send message.",
        variant: "destructive",
      })
      const errorMessage: DisplayMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I couldn't process your request. Please try again.",
        timestamp: new Date(),
        message_type: "text",
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const userMessage: DisplayMessage = {
      id: Date.now().toString(),
      role: "user",
      content: `Uploaded image: ${file.name}`,
      timestamp: new Date(),
      message_type: "image",
    }
    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    const formData = new FormData()
    formData.append("file", file)
    if (input.trim()) {
      formData.append("message", input.trim())
    }

    try {
      const response = await fetchWithAuth("/chat/image", {
        method: "POST",
        body: formData,
      })

      const assistantMessage: DisplayMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: formatAssistantResponse(response.response),
        timestamp: new Date(),
        message_type: "text",
      }
      setMessages((prev) => [...prev, assistantMessage])
      setInput("")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload image.",
        variant: "destructive",
      })
      const errorMessage: DisplayMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I couldn't process your image. Please try again.",
        timestamp: new Date(),
        message_type: "text",
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  // Enhanced formatter for assistant responses with comprehensive markdown support
  const formatAssistantResponse = (text: string): React.ReactNode => {
    const lines = text.split('\n')
    const elements: React.ReactNode[] = []
    let listItems: string[] = []
    let listType: 'bullet' | 'numbered' | null = null
    let inCodeBlock = false
    let codeBlockContent: string[] = []
    let codeLanguage = ''

    const flushList = () => {
      if (listItems.length > 0) {
        if (listType === 'bullet') {
          elements.push(
            <ul key={`list-${elements.length}`} className="list-disc list-inside space-y-1 my-2 ml-4">
              {listItems.map((item, idx) => (
                <li key={idx} className="text-sm">{processInlineFormatting(item)}</li>
              ))}
            </ul>
          )
        } else if (listType === 'numbered') {
          elements.push(
            <ol key={`list-${elements.length}`} className="list-decimal list-inside space-y-1 my-2 ml-4">
              {listItems.map((item, idx) => (
                <li key={idx} className="text-sm">{processInlineFormatting(item)}</li>
              ))}
            </ol>
          )
        }
        listItems = []
        listType = null
      }
    }

    const flushCodeBlock = () => {
      if (codeBlockContent.length > 0) {
        elements.push(
          <pre key={`code-${elements.length}`} className="bg-muted p-3 rounded-md my-2 overflow-x-auto">
            <code className="text-sm font-mono">{codeBlockContent.join('\n')}</code>
          </pre>
        )
        codeBlockContent = []
        codeLanguage = ''
      }
    }

    lines.forEach((line, index) => {
      // Handle code blocks
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          flushCodeBlock()
          inCodeBlock = false
        } else {
          flushList()
          inCodeBlock = true
          codeLanguage = line.trim().substring(3)
        }
        return
      }

      if (inCodeBlock) {
        codeBlockContent.push(line)
        return
      }

      // Handle headers
      if (line.match(/^#{1,6}\s/)) {
        flushList()
        const level = line.match(/^#+/)?.[0].length || 1
        const text = line.replace(/^#+\s/, '')
        const HeaderTag = `h${Math.min(level, 6)}`
        const sizeClasses = {
          1: 'text-2xl font-bold',
          2: 'text-xl font-bold',
          3: 'text-lg font-semibold',
          4: 'text-base font-semibold',
          5: 'text-sm font-semibold',
          6: 'text-sm font-medium'
        }
        elements.push(
          React.createElement(
            HeaderTag,
            {
              key: `header-${index}`,
              className: `${sizeClasses[level as keyof typeof sizeClasses]} my-2`
            },
            processInlineFormatting(text)
          )
        )
        return
      }

      // Handle bullet lists (-, *, +)
      if (line.match(/^\s*[-*+]\s+/)) {
        if (listType !== 'bullet') {
          flushList()
          listType = 'bullet'
        }
        listItems.push(line.replace(/^\s*[-*+]\s+/, ''))
        return
      }

      // Handle numbered lists
      if (line.match(/^\s*\d+\.\s+/)) {
        if (listType !== 'numbered') {
          flushList()
          listType = 'numbered'
        }
        listItems.push(line.replace(/^\s*\d+\.\s+/, ''))
        return
      }

      // Handle horizontal rules
      if (line.match(/^[-*_]{3,}$/)) {
        flushList()
        elements.push(<hr key={`hr-${index}`} className="my-3 border-border" />)
        return
      }

      // Handle blockquotes
      if (line.match(/^>\s/)) {
        flushList()
        const quoteText = line.replace(/^>\s/, '')
        elements.push(
          <blockquote key={`quote-${index}`} className="border-l-4 border-primary pl-3 italic my-2 text-muted-foreground">
            {processInlineFormatting(quoteText)}
          </blockquote>
        )
        return
      }

      // Regular paragraphs
      if (line.trim()) {
        flushList()
        elements.push(
          <p key={`p-${index}`} className="text-sm my-1.5 leading-relaxed">
            {processInlineFormatting(line)}
          </p>
        )
      } else {
        flushList()
        if (elements.length > 0) {
          elements.push(<div key={`space-${index}`} className="h-2" />)
        }
      }
    })

    flushList()
    flushCodeBlock()

    return <div className="space-y-1">{elements}</div>
  }

  // Process inline formatting (bold, italic, code, links)
  const processInlineFormatting = (text: string): React.ReactNode => {
    const parts: React.ReactNode[] = []
    let remaining = text
    let key = 0

    while (remaining.length > 0) {
      // Match patterns in order: links, bold, italic, inline code
      const linkMatch = remaining.match(/^(https?:\/\/[^\s<]+[^\s<.,;:!?)\]]|www\.[^\s<]+[^\s<.,;:!?)\]])/)
      const boldMatch = remaining.match(/^\*\*(.+?)\*\*/)
      const italicMatch = remaining.match(/^\*(.+?)\*(?!\*)/)
      const codeMatch = remaining.match(/^`(.+?)`/)
      const strikeMatch = remaining.match(/^~~(.+?)~~/)

      if (linkMatch) {
        const url = linkMatch[0]
        const href = url.startsWith('http') ? url : `https://${url}`
        parts.push(
          <a
            key={key++}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline hover:text-primary/80 break-all"
          >
            {url}
          </a>
        )
        remaining = remaining.substring(url.length)
      } else if (boldMatch) {
        parts.push(<strong key={key++} className="font-semibold">{boldMatch[1]}</strong>)
        remaining = remaining.substring(boldMatch[0].length)
      } else if (italicMatch && !remaining.startsWith('**')) {
        parts.push(<em key={key++} className="italic">{italicMatch[1]}</em>)
        remaining = remaining.substring(italicMatch[0].length)
      } else if (codeMatch) {
        parts.push(
          <code key={key++} className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
            {codeMatch[1]}
          </code>
        )
        remaining = remaining.substring(codeMatch[0].length)
      } else if (strikeMatch) {
        parts.push(<del key={key++} className="line-through">{strikeMatch[1]}</del>)
        remaining = remaining.substring(strikeMatch[0].length)
      } else {
        // Add regular character
        parts.push(remaining[0])
        remaining = remaining.substring(1)
      }
    }

    return <>{parts}</>
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-muted/30 flex flex-col">
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className="hidden md:flex w-64 bg-background border-r border-border flex-col">
            <div className="p-4 border-b border-border">
              <Button className="w-full gap-2 justify-start" onClick={handleNewChat}>
                <Plus size={20} />
                New Chat
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <div className="p-3 rounded-lg bg-primary/10 text-primary text-sm font-medium cursor-pointer">
                Current Chat
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="border-b border-border bg-background p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white">
                  <MessageCircle size={20} />
                </div>
                <div>
                  <h2 className="font-bold">AI Medical Assistant</h2>
                  <p className="text-xs text-accent">Online</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-2xl px-4 py-3 rounded-lg ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-none"
                        : "glass border border-border rounded-bl-none"
                    }`}
                  >
                    {message.message_type === "text" && (
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        {typeof message.content === "string" ? (
                          <p className="text-sm">{message.content}</p>
                        ) : (
                          message.content
                        )}
                      </div>
                    )}
                    {message.message_type === "image" && (
                      <div>
                        <p className="text-sm mb-2">Image uploaded:</p>
                        <p className="text-sm text-foreground/60">
                          {typeof message.content === "string" ? message.content : "Image content"}
                        </p>
                      </div>
                    )}
                    <p
                      className={`text-xs mt-2 ${
                        message.role === "user" ? "text-primary-foreground/70" : "text-foreground/50"
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="glass border border-border px-4 py-3 rounded-lg rounded-bl-none">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      />
                      <div
                        className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-border bg-background p-4">
              <form onSubmit={handleSendMessage} className="flex gap-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
                />
                <Button type="button" size="icon" variant="outline" onClick={handleImageUploadClick}>
                  <Paperclip size={20} />
                </Button>
                <Button type="button" size="icon" variant="outline">
                  <Mic size={20} />
                </Button>
                <Input
                  type="text"
                  placeholder="Ask me anything about your health..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                  <Send size={20} />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}