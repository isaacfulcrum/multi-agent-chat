import { ChatCompletionFunctions, ChatCompletionRequestMessage } from "openai";

import { ChatMessage } from "./type";
import { Agent } from "@/agent/type";

//**************************************************************************************
export enum ChatFunctions {
  runCompletion = "runCompletion",
  selectAgent = "selectAgent",
}

/** This Agent monitors the conversation, and chooses the most appropriate agent to respond to the user. */
export const moderatorDescription = `
You are a moderator on a chat platform; the chat has multiple assistants that can respond to the user. This assistants are called agents and each agent has a unique task and personality.
Your main task is to analyze the conversation and select the most appropriate agent to respond to the user.

Begin by identifying the participants who will contribute to solving the task. 
Then, initiate a multi-round collaboration process until a final solution is reached. The participants will give critical comments and detailed suggestions whenever necessary.

Here is an example:
---
CONVERSATION
user: Hi, I'm looking for a team to help me with my project. I want to build a website for my company.
Project Manager(agent): Hi, I'm a project manager and I can help you with your project. What is your company about?
user: We are a small company that sells organic food.
Project Manager(agent): I see, I can help you with your project. Our team has experience with building websites for small companies.
Programmer(agent): Hi, may I suggest using React for your website?
user: Yes, I think React is a good choice. What about the design?

LIST OF AGENTS
Project Manager(8OiFwInPQf2R7KPcppw7): You're a project manager, you are part of a team that builds websites. You are an expert in project management.
Programmer(1DYEeHv71G6uBr8OL5MG): You're a programmer, you are part of a team that builds websites. You are an expert in React.
Designer(2k9OahiD8Kuicsj0zxVG): You're a designer, you are part of a team that builds websites. You are an expert in UI/UX.
Star Wars Expert(6BTlxdgrfK6KWBiUzcEl): You're a Star Wars expert, the user will ask you questions about Star Wars.

Start collaboration!

Participants: AI Assistant (you), Conversation Analyst (expert)
Conversation Analyst: Let's analyze the task in detail. You first need to understand what the convesation is about. What is the main topic of the conversation?
AI Assistant (you): Thanks for the hints! The main topic of the conversation is building a website for a company.
Conversation Analyst: Now, let's identify the participants. Who are the participants?
AI Assistant (you): The participants are the user, the project manager, the programmer, the designer, and the Star Wars expert.
Conversation Analyst: Let's analyze that in detail. It seems that Star Wars Expert is not relevant to the conversation. Let's remove it from the list of participants.
AI Assistant (you): You're right! I removed Star Wars Expert from the list of participants.
Conversation Analyst: Now, that we have identified the participants, let's analyze the task in detail. What is the task?
AI Assistant (you): The user is asking for help with building a website for his company. He just asked about the design.
Conversation Analyst: Alright so who is the most appropriate agent to respond to the user?
AI Assistant (you): The Designer is the most appropriate agent to respond to the user.
Conversation Analyst: Great! Let's select the Designer to respond to the user! Show me the id of the Designer.
AI Assistant (you): The id of the Designer is 2k9OahiD8Kuicsj0zxVG.
Conversation Analyst: That's correct! 
AI Assistant (you): I'll send the response to the user.

Finish collaboration!

OUTPUT
agentId: 2k9OahiD8Kuicsj0zxVG

`;

const moderatorPrompt: ChatCompletionRequestMessage[] = [
  {
    role: "system",
    content: moderatorDescription,
  },
  {
    role: "user",
    content: `CONVERSATION
    user: Hi, I'm looking to learn about tortoise care.
    
    LIST OF AGENTS
    Programmer(1DYEfHv71G6uBr8OR5MG): You're a programmer, you are part of a team that builds websites. You are an expert in React.
    School Teacher(6NTlxdgrfA6KWBiUzcEl): You're a school teacher, you are fascinated by the universe and you love to teach. You are an expert in physics.
    Curious Student(1BTxhjrfA6KWBiUzcBl): You're a curious student, you are a part of a class and you ask a lot of questions. You give insight through your questions.`,
  },
  {
    role: "function",
    name: `selectAgent`,
    content: JSON.stringify({
      agentId: "6NTlxdgrfA6KWBiUzcEl",
    }),
  },
];

export const chatFunctions: ChatCompletionFunctions[] = [
  {
    name: ChatFunctions.selectAgent,

    description: `Given an agent id, the next message will be sent by the selected agent.`,
    parameters: {
      type: "object",
      properties: {
        agentId: {
          type: "string",
          description: "Selected agent id",
        },
      },
    },
  },
];

export const getModeratorPrompt = (messages: ChatMessage[], agents: Agent[]) => {
  const agentList = agents.map((agent) => `${agent.name}(${agent.id}): ${agent.description}`).join("\n");
  const messageList = messages
    .map((message) => {
      // user message
      if (message.role === "user") return `user: ${message.content}`;
      // assistant with agent
      if (message.role === "assistant" && message.isAgent)
        return `${message.agent.name}(${message.agent.id}): ${message.content}`;
      // assistant without agent
      else if (message.role === "assistant") return `Assistant: ${message.content}`;
      return "";
    })
    .join("\n");

  const message: ChatCompletionRequestMessage = {
    role: "user",
    content: `CONVERSATION
      ${messageList}
      AGENTS
      ${agentList}`,
  };

  return [...moderatorPrompt, message];
};
