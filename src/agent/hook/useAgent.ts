import React from "react";
import { ChatMessage } from "@/chat/type";
import { AgentType } from "../type";
import { nanoid } from "nanoid";
import { ChatCompletionRequestMessageRoleEnum } from "openai";

type Props = {
  selectedAgent: AgentType;
  messages: ChatMessage[];
  pushMessage: (message: ChatMessage) => void;
};

export const useAgent = ({ selectedAgent, messages, pushMessage }: Props) => {
  // When messages are updated, check if the last message was sent by an agent
  // If not, request a message from the agent
  React.useEffect(() => {
    // If there are no messages, don't do anything
    if (messages.length === 0) return;

    // If there's no selected agent, don't do anything
    if (!selectedAgent) return;

    // If the last message was sent by an agent, don't do anything
    if (selectedAgent.isLastMessageSentByAgent(messages)) return;

    // Otherwise, request a message from the agent
    const getMessage = async () => {
      try {
        // Get the message from the agent
        const agentMessage = await selectedAgent.getResponseMessage(messages);
        if (!agentMessage) return;
        // Once it arrives push it to the chat history
        pushMessage({
          id: nanoid(),
          content: agentMessage,
          agent: selectedAgent,
          role: ChatCompletionRequestMessageRoleEnum.Assistant,
        });
      } catch (e) {
        // TODO: Handle error with an alert
        console.log(e);
      }
    };
    getMessage();
  }, [messages, selectedAgent, pushMessage]);
};
