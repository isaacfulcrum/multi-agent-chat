import { ConversationalAgentSpecs } from "@/agent/type";

// ********************************************************************************
export type CreateAgentRequest = Omit<ConversationalAgentSpecs, "id" | "hasMemory">;