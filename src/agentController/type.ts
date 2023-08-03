import { AgentSpecs } from "@/agent/type";

// ********************************************************************************
export type CreateAgentRequest = Omit<AgentSpecs, "id">;