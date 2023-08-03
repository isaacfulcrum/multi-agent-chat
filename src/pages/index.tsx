import Head from "next/head";

import { Chat } from "@/chat/component";
import { MainWrapper } from "@/util/layout/component/MainWrapper";
import ChatServiceProvider from "@/chat/context/ChatServiceProvider";

;

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
        <ChatServiceProvider>
          <Chat />
        </ChatServiceProvider>
      </MainWrapper>
    </>
  );
}
