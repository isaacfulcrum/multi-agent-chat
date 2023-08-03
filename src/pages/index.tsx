import Head from "next/head";

import { Chat } from "@/chat/component";
import { MainWrapper } from "@/util/layout/component/MainWrapper";
import { ChatProvider } from "@/chat/context/ChatProvider";
import { SingleAgentChat } from "@/chat/service";
import { ConversationalAgent } from "@/agent/service";
import { OpenAIService } from "@/openai/service";


const chat = new SingleAgentChat(new ConversationalAgent("1", OpenAIService.getInstance()));

// ********************************************************************************
export default function Home() {
  return (
    <>
      <Head>
        <title>Multi-Agent Chat</title>
        <meta name="description" content="Chat with multiple AI agents!" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <MainWrapper>
        <ChatProvider chat={chat}>
          <Chat />
        </ChatProvider>
      </MainWrapper>
    </>
  );
}
