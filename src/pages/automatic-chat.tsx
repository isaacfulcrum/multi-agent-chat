import Head from "next/head";
import { Inter } from "@next/font/google";

import { Chat } from "@/chat/component";
import { MainWrapper } from "@/util/layout/component/MainWrapper";
import { ChatProvider } from "@/chat/context/ChatProvider";
import { AutomaticAgentChat } from "@/chat/service";
import ChatServiceProvider from "@/chat/context/ChatServiceProvider";

const chat = new AutomaticAgentChat();

//**********************************************************************************
export default function AutomaticChatPage() {
  return (
    <>
      <Head>
        <title>Automatic Response Chat</title>
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
