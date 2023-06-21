// NOTE: This shouldn't be used in the client, only in the server
// For demo purposes, we're using it in the client
import { ChatMessage } from "@/chat/type";
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
// This structure is required by OpenAI
// see: https://beta.openai.com/docs/api-reference/completions/create
const formatMessagesforOpenAI = (messages: ChatMessage[]) => {
  return messages.map((message) => {
    // If the message has a role defined, use it
    // Otherwise use the assistant role
    return {
      role: message.role ?? ChatCompletionRequestMessageRoleEnum.Assistant,
      content: message.content,
    };
  });
};

// This function sends the messages to OpenAI and returns the response as a string
export const getChatCompletion = async (messages: ChatMessage[]) => {
  const { data } = await openai.createChatCompletion({
    model: "gpt-4",
    messages: formatMessagesforOpenAI(messages),
    max_tokens: 1000,
    temperature: 0.7,
  });
  return data.choices[0].message?.content;
};
