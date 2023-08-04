import Head from "next/head";

import { Chat } from "@/chat/component";
import { IterativeAgentChat } from "@/chat/service/iterative";
import { MainWrapper } from "@/util/layout/component/MainWrapper";
import ChatServiceProvider from "@/chat/context/ChatServiceProvider";


const chat = new IterativeAgentChat();

//**********************************************************************************
export default function AutomaticChatPage() {
  return (
    <>
      <Head>
        <title>Iterative Response Chat</title>
        <meta name="description" content="Chat with multiple AI agents!" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <MainWrapper>
        <ChatServiceProvider chat={chat}>
          <Chat />
        </ChatServiceProvider>
      </MainWrapper >
    </>
  );
}
