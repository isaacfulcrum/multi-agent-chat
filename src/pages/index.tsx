import Head from "next/head";

import { Chat } from "@/chat/component";
import { MainWrapper } from "@/util/layout/component/MainWrapper";
import ChatServiceProvider from "@/chat/context/ChatServiceProvider";
import { SingleAgentChat } from "@/chat/service";
import { GenericAgent } from "@/agent/service";
import { OpenAIService } from "@/openai/service";

const defaultAgent = new GenericAgent(new OpenAIService());
const chat = new SingleAgentChat(defaultAgent);

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
        <ChatServiceProvider chat={chat} >
          <Chat />
        </ChatServiceProvider>
      </MainWrapper>
    </>
  );
}
