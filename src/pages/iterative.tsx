import { OpenAIService } from "@/openai/service";
import { IterativeAgentChat } from "@/chat/service/iterative";

import { Chat } from "@/chat/component";
import { ChatProviderComponent } from "@/chat/context/ChatProviderComponent";

//**********************************************************************************
const openai = new OpenAIService()
const chat = new IterativeAgentChat(openai);

export default function IterativeChatPage() {
  return (
    <ChatProviderComponent chat={chat}>
      <Chat />
    </ChatProviderComponent>
  );
}
