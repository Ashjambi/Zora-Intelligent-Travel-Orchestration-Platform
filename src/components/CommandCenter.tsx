import React from 'react'
import { Page, PageHeader, PageTitle, PageDescription, PageBody, Tabs, TabsList, TabsTrigger, TabsContent, StatGroup, Stat } from '@blinkdotnew/ui'
import { AgentPanel } from './AgentPanel'
import { Bot, Briefcase, Megaphone, Landmark, Settings2, ShieldCheck } from 'lucide-react'

export function CommandCenter() {
  return (
    <Page>
      <PageHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary rounded-lg text-primary-foreground">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <PageTitle>Zora Agentic Command Center</PageTitle>
            <PageDescription>Orchestrate your travel business departments via specialized AI Agents.</PageDescription>
          </div>
        </div>
      </PageHeader>
      
      <PageBody>
        <StatGroup className="mb-8">
          <Stat 
            label="Active Agents" 
            value="4" 
            icon={<Bot className="text-accent" />}
            description="All departments online"
          />
          <Stat 
            label="Autonomous Tasks" 
            value="156" 
            trend={12.5}
            trendLabel="vs yesterday"
          />
          <Stat 
            label="Conversion Rate" 
            value="24.8%" 
            trend={4.2}
            trendLabel="AI Optimized"
          />
          <Stat 
            label="Finance Health" 
            value="Optimal" 
            description="Verified by Finance Agent"
          />
        </StatGroup>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-muted p-1 rounded-xl">
            <TabsTrigger value="overview" className="gap-2">
              <Settings2 className="w-4 h-4" /> Overview
            </TabsTrigger>
            <TabsTrigger value="sales" className="gap-2">
              <Briefcase className="w-4 h-4" /> Sales Agent
            </TabsTrigger>
            <TabsTrigger value="marketing" className="gap-2">
              <Megaphone className="w-4 h-4" /> Marketing Agent
            </TabsTrigger>
            <TabsTrigger value="finance" className="gap-2">
              <Landmark className="w-4 h-4" /> Finance Agent
            </TabsTrigger>
            <TabsTrigger value="operations" className="gap-2">
              <Bot className="w-4 h-4" /> Operations Agent
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {['Sales', 'Marketing', 'Finance', 'Operations'].map((dept) => (
                <div key={dept} className="p-4 rounded-xl border bg-card hover:shadow-md transition-all group">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-sm">{dept} Agent</h3>
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary group-hover:bg-accent transition-all" style={{ width: '75%' }} />
                    </div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Workload: Normal</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-8 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center text-center gap-4 bg-muted/20">
              <div className="p-4 bg-background rounded-full shadow-lg">
                <ShieldCheck className="w-12 h-12 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Orchestrator Active</h2>
                <p className="text-muted-foreground max-w-md mx-auto mt-2">
                  The central brain is currently managing cross-department communication and ensuring all travel requests are handled within SLAs.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sales">
            <AgentPanel 
              role="sales"
              title="Sales & CRM Agent"
              description="Managing travel leads, booking requests, and client relationships. Focuses on lead scoring and closing."
            />
          </TabsContent>

          <TabsContent value="marketing">
            <AgentPanel 
              role="marketing"
              title="Marketing & Content Agent"
              description="Generating destination content, managing social campaigns, and analyzing travel trends."
            />
          </TabsContent>

          <TabsContent value="finance">
            <AgentPanel 
              role="finance"
              title="Finance & Billing Agent"
              description="Automating invoices, tracking expenses, and providing real-time financial health reports."
            />
          </TabsContent>

          <TabsContent value="operations">
            <AgentPanel 
              role="operations" 
              title="Operations & Orchestration Agent"
              description="Managing travel partner bidding, itinerary orchestration, and real-time logistics."
            />
          </TabsContent>
        </Tabs>
      </PageBody>
    </Page>
  )
}