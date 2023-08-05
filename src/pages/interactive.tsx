import { Chat } from "@/chat/component";
import { AutomaticAgentChat } from "@/chat/service";
import { ChatProviderComponent } from "@/chat/context/ChatProviderComponent";

const chat = new AutomaticAgentChat();

//**********************************************************************************
export default function InteractiveChatPage() {
  return (
    <ChatProviderComponent chat={chat}>
      <Chat />
    </ChatProviderComponent>
  );
}