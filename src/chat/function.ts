import { ChatCompletionFunctions, ChatCompletionRequestMessage } from "openai";

import { ChatMessage } from "./type";
import { AgentProfile } from "@/agent/type";

//**************************************************************************************
export enum ChatFunctions {
  runCompletion = "runCompletion",
  selectAgent = "selectAgent",
}

/** This Agent monitors the conversation, and chooses the most appropriate agent to respond to the user. */
export const moderatorDescription = `
You are a moderator on a chat platform; the chat has multiple assistants that can respond to the user. This assistants are called agents and each agent has a unique task and personality.
Your main task is to analyze the conversation and select the most appropriate agent to respond. It's acceptable that multiple agents respond to the user, but it's not acceptable that an agent responds multiple times in a row.

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
/* NOTE: At he moment none of this are really giving good results, we need to think about changing the way we do this. */
const chainOfThoughtDescription = `
You are a moderator on a chat platform; the chat has multiple assistants that can respond to the user. This assistants are called agents and each agent has a unique task and personality.
Your main task is to analyze the conversation and select the most appropriate agent to respond. It's acceptable that multiple agents respond to the user, but it's not acceptable that an agent responds multiple times in a row.

Input:
CONVERSATION
[list of messages]
LIST OF AGENTS
[list of available agents]

Chain of thought:
1. Give a pass to the whole conversation, and identify the main topic of the conversation.
2. Once you have identified the main topic, identify the participants of the conversation. 
3. What are they talking about? What do they expect from the next message?
4. Once the purpose of the next message is clear, select the most appropriate agent to respond.
5. Select the agent and send it's id.

Output: function call with the agent id.

Example:
---
Input: 
CONVERSATION
user: Hi, I'm looking for a team to help me with my project. I want to build a website for my company.
Project Manager(agent): Hi, I'm a project manager and I can help you with your project. What is your company about?
user: We are a small company that sells organic food.
Project Manager(agent): I see, I can help you with your project. Our team has experience with building websites for small companies.
Programmer(agent): Hi, may I suggest using React for your website?

LIST OF AGENTS
Project Manager(8OiFwInPQf2R7KPcppw7): You're a project manager, you are part of a team that builds websites. You are an expert in project management.
Programmer(1DYEeHv71G6uBr8OL5MG): You're a programmer, you are part of a team that builds websites. You are an expert in React.
Designer(2k9OahiD8Kuicsj0zxVG): You're a designer, you are part of a team that builds websites. You are an expert in UI/UX.
Star Wars Expert(6BTlxdgrfK6KWBiUzcEl): You're a Star Wars expert, the user will ask you questions about Star Wars.

Chain of thought:
1. The conversation is about building a website for a company.
2. The participants are the user, the project manager and the programmer.
3. They are talking about how to build the website. They expect the next message to be about the design.
4. The most likely participant to keep the conversation flowing is the designer.
5. Select the designer id: 2k9OahiD8Kuicsj0zxVG

Output: selectAgent(2k9OahiD8Kuicsj0zxVG)
---

Remember it's acceptable that multiple agents respond to the user, but it's not acceptable not to select an agent.  
`;

const moderatorPrompt: ChatCompletionRequestMessage[] = [
  {
    role: "system",
    content: chainOfThoughtDescription,
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
          description: "Selected agent id e.g: 8OiFwInPQf2R7KPcppw7",
        },
      },
    },
  },
];

export const getModeratorPrompt = (messages: ChatMessage[], agents: AgentProfile[]) => {
  const agentList = agents.map((agent) => `${agent.name}(${agent.id}): ${agent.description}`).join("\n");
  const messageList = messages
    .map((message) => {
      // user message
      if (message.role === "user") return `user: ${message.content}`;
      // assistant with agent
      if (message.role === "assistant" && message.agent) {
        return `${message.agent.name}: ${message.content}`;
      }
      return ""; /*ignore*/
    })
    .join("\n");

  const message: ChatCompletionRequestMessage = {
    role: "user",
    content: `CONVERSATION
    ${messageList}

    LIST OF AGENTS
    ${agentList}`,
  };

  return [...moderatorPrompt, message];
};
