import Head from "next/head";

import { GenericAgent } from "@/agent/service";
import { OpenAIService } from "@/openai/service";

import { Chat } from "@/chat/component";
import { ChatMode, chatModeSpecsDefinition } from "@/chat/type";
import { ChatProviderComponent } from "@/chat/context/ChatProviderComponent";
import { SingleAgentChat } from "@/chat/service";


const defaultAgent = new GenericAgent(new OpenAIService());
const chat = new SingleAgentChat(defaultAgent);
const modeSpecs = chatModeSpecsDefinition[ChatMode.Single];

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
      <ChatProviderComponent chat={chat}>
        <Chat modeSpecs={modeSpecs} />
      </ChatProviderComponent>

    </>
  );
}
