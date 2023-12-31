import Head from "next/head";

import { OpenAIService } from "@/openai/service";
import { SingleAgentChat } from "@/chat/service";

import { Chat } from "@/chat/component";
import { ChatProviderComponent } from "@/chat/context/ChatProviderComponent";

// ********************************************************************************
const openai = new OpenAIService()
const chat = new SingleAgentChat(openai);

export default function Home() {
  return (
    <>
      <Head>
        <title>Multi-Agent Chat</title>
        <meta name="description" content="Chat with multiple AI agents!" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ChatProviderComponent chat={chat}>
        <Chat />
      </ChatProviderComponent>
    </>
  );
}
