import React, { useState } from 'react'
import { useCompanyAgent } from '../hooks/useCompanyAgent'
import { type AgentRole } from '../agents/config'
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  Button, 
  Input, 
  Badge, 
  ScrollArea,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from '@blinkdotnew/ui'
import { Send, Bot, Terminal, Activity, CheckCircle2, AlertCircle } from 'lucide-react'

interface AgentPanelProps {
  role: AgentRole
  title: string
  description: string
}

export function AgentPanel({ role, title, description }: AgentPanelProps) {
  const { messages, isLoading, sendMessage } = useCompanyAgent(role)
  const [input, setInput] = useState('')

  const handleSend = () => {
    if (!input.trim()) return
    sendMessage(input)
    setInput('')
  }

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bot className="w-5 h-5 text-accent" />
                {title}
              </CardTitle>
              <Badge variant={isLoading ? 'secondary' : 'outline'} className="animate-pulse">
                {isLoading ? 'Agent Working...' : 'Standby'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{description}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Agent Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>Tasks Completed</span>
              <span className="font-mono">12</span>
            </div>
            <div className="flex justify-between text-xs">
              <span>Success Rate</span>
              <span className="font-mono text-green-500">98%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <CardHeader className="border-b py-3 shrink-0">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Terminal className="w-4 h-4" />
            Agent Logs & Communication
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                <Bot className="w-12 h-12 opacity-20" />
                <p className="text-sm italic">Assign a task to the {title}...</p>
              </div>
            ) : (
              messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                    m.role === 'user' 
                      ? 'bg-primary text-primary-foreground ml-4' 
                      : 'bg-muted border border-border mr-4'
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="p-4 border-t bg-muted/30 shrink-0">
            <div className="flex gap-2">
              <Input 
                placeholder={`Instruct ${title}...`} 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <Button size="icon" onClick={handleSend} disabled={isLoading}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
