import { Chat } from "@/chat/component";
import { IterativeAgentChat } from "@/chat/service/iterative";
import { ChatProviderComponent } from "@/chat/context/ChatProviderComponent";

const chat = new IterativeAgentChat();

//**********************************************************************************
export default function IterativeChatPage() {
  return (
    <ChatProviderComponent chat={chat}>
      <Chat />
    </ChatProviderComponent>
  );
}