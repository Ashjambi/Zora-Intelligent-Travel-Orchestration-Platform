import { Routes, Route, Navigate } from 'react-router-dom'
import { Page, PageBody, PageHeader, PageTitle } from '@blinkdotnew/ui'
import { SharedAppLayout } from './layouts/shared-app-layout'
import { CommandCenter } from './components/CommandCenter'
import { AgentPanel } from './components/AgentPanel'
import { useAuth } from './hooks/useAuth'
import { Bot } from 'lucide-react'

export default function App() {
  const { isLoading, isAuthenticated, login } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center gap-6">
        <div className="p-4 bg-primary/10 rounded-full">
          <Bot className="w-16 h-16 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Zora Agentic Platform</h1>
          <p className="text-muted-foreground mt-2 max-w-sm">
            Sign in to access your autonomous travel orchestration company.
          </p>
        </div>
        <button 
          onClick={login}
          className="px-8 py-3 bg-primary text-primary-foreground rounded-full font-bold hover:opacity-90 transition-all shadow-lg"
        >
          Access Command Center
        </button>
      </div>
    )
  }

  return (
    <SharedAppLayout appName="Zora Agentic">
      <Routes>
        <Route path="/" element={<CommandCenter />} />
        <Route path="/sales" element={
          <Page>
            <PageHeader>
              <PageTitle>Sales Department</PageTitle>
            </PageHeader>
            <PageBody>
              <AgentPanel 
                role="sales" 
                title="Sales Agent" 
                description="Managing travel leads and conversion optimization." 
              />
            </PageBody>
          </Page>
        } />
        <Route path="/marketing" element={
          <Page>
            <PageHeader>
              <PageTitle>Marketing Department</PageTitle>
            </PageHeader>
            <PageBody>
              <AgentPanel 
                role="marketing" 
                title="Marketing Agent" 
                description="Creating content and analyzing travel trends." 
              />
            </PageBody>
          </Page>
        } />
        <Route path="/finance" element={
          <Page>
            <PageHeader>
              <PageTitle>Finance Department</PageTitle>
            </PageHeader>
            <PageBody>
              <AgentPanel 
                role="finance" 
                title="Finance Agent" 
                description="Automating billing and tracking business health." 
              />
            </PageBody>
          </Page>
        } />
        <Route path="/operations" element={
          <Page>
            <PageHeader>
              <PageTitle>Operations Department</PageTitle>
            </PageHeader>
            <PageBody>
              <AgentPanel 
                role="operations" 
                title="Operations Agent" 
                description="Orchestrating travel requests and partner bidding." 
              />
            </PageBody>
          </Page>
        } />
        <Route path="/settings" element={
          <Page>
            <PageHeader>
              <PageTitle>Settings</PageTitle>
            </PageHeader>
            <PageBody>
              <p className="text-muted-foreground">Configure your agent company parameters here.</p>
            </PageBody>
          </Page>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </SharedAppLayout>
  )
}