// NOTE: This shouldn't be used in the client, only in the server

import { ChatMessage } from "./type";

// For demo purposes, we're using it in the client
import {
  ChatCompletionRequestMessageRoleEnum,
  Configuration,
  OpenAIApi,
} from "openai";

const configuration = new Configuration({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// This function formats the messages to be sent to OpenAI
const formatMessagesforOpenAI = (messages: ChatMessage[]) => {
  return messages.map((message) => {
    return {
      role: message.agent
        ? ChatCompletionRequestMessageRoleEnum.Assistant
        : ChatCompletionRequestMessageRoleEnum.User,
      content: message.content,
    };
  });
};

// This function sends the messages to OpenAI and returns the response
export const getChatCompletion = async (messages: ChatMessage[]) => {
  try {
    const response = await openai.createChatCompletion({
      model: "gpt-4",
      messages: formatMessagesforOpenAI(messages),
      max_tokens: 1000,
      temperature: 0.7,
    });
    return response.data.choices[0].message;
  } catch (error) {
    console.log(error);
  }
};
