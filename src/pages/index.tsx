import Head from "next/head";
import { Inter } from "@next/font/google";

import { Chat } from "@/chat/component";
import { MainWrapper } from "@/utils/layout/component/MainWrapper";

const inter = Inter({ subsets: ["latin"] });

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
          <Chat />
      </MainWrapper>
    </>
  );
}
