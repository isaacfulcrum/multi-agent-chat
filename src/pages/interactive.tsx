import { OpenAIService } from "@/openai/service";
import { InteractiveAgentChat } from "@/chat/service";

import { Chat } from "@/chat/component";
import { ChatProviderComponent } from "@/chat/context/ChatProviderComponent";

//**********************************************************************************
const openai = new OpenAIService()
const chat = new InteractiveAgentChat(openai);

export default function InteractiveChatPage() {
  return (
    <ChatProviderComponent chat={chat}>
      <Chat />
    </ChatProviderComponent>
  );
}
