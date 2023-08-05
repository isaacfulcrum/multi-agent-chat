import { Chat } from "@/chat/component";
import { InteractiveAgentChat } from "@/chat/service";
import { ChatProviderComponent } from "@/chat/context/ChatProviderComponent";

const chat = new InteractiveAgentChat();

//**********************************************************************************
export default function InteractiveChatPage() {
  return (
    <ChatProviderComponent chat={chat}>
      <Chat />
    </ChatProviderComponent>
  );
}
