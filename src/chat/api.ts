// NOTE: This shouldn't be used in the client, only in the server
// For demo purposes, we're using it in the client
import {
  ChatCompletionRequestMessage,
  Configuration,
  OpenAIApi,
} from "openai";

const configuration = new Configuration({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// This function sends the messages to OpenAI and returns the response as a string
export const getChatCompletion = async (messages: ChatCompletionRequestMessage[]): Promise<string> => {
  const { data } = await openai.createChatCompletion({
    model: "gpt-4",
    messages,
    max_tokens: 1000,
    temperature: 0.7,
  });
  const message = data.choices[0].message?.content;
  if(!message) throw new Error('No message returned from OpenAI')
  return message;
};
