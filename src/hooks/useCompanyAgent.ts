import { useAgent } from '@blinkdotnew/react'
import { AGENT_CONFIGS, type AgentRole } from '../agents/config'
import { blink } from '../blink/client'
import { useMemo } from 'react'

export function useCompanyAgent(role: AgentRole) {
  const agent = useMemo(() => {
    return blink.ai.createAgent(AGENT_CONFIGS[role])
  }, [role])

  const agentState = useAgent({
    agent,
    stream: true,
  })

  return agentState
}
