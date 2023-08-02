import { AgentProfile } from "@/agent/type";

// ********************************************************************************
export type CreateAgentRequest = Omit<AgentProfile, "id">;