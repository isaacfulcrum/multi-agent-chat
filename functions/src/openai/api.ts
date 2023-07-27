import { Configuration, OpenAIApi } from "openai";
import { MAX_RESPONSE_TOKENS, OpenAIChatCompletionRequest } from "./type";

// ********************************************************************************
// == API Key =====================================================================
/** Returns the stored OpenAI API key or throws an error if it's missing */
export const getApiKey = (): string => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Missing OpenAI API key");
  return apiKey;
};

// == Client ======================================================================
/** Returns an OpenAI client needed to make requests to the API */
const openAIClient = () => {
  const apiKey = getApiKey(); /*handles missing API key*/
  const configuration = new Configuration({ apiKey });
  return new OpenAIApi(configuration);
};

// == Chat Completion =============================================================
const chatCompletionModel = "gpt-3.5-turbo";
const chatCompletionMaxTokens = MAX_RESPONSE_TOKENS;

/* Returns a response from the OpenAI API, which is a single message */
export const openAIChatCompletion = async ({ messages, ...options }: OpenAIChatCompletionRequest) => {
  const openai = openAIClient();
  return openai.createChatCompletion({
    messages,
    model: chatCompletionModel,
    max_tokens: chatCompletionMaxTokens,
    ...options,
  });
};
