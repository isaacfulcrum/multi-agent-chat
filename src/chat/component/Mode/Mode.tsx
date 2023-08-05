import { Icon, Stack } from "@chakra-ui/react"
import { MdOutlineGroups, MdOutlinePersonOutline, MdOutlineRocketLaunch } from "react-icons/md"

import { ChatLink, ChatMode, ChatModeSpecs } from "@/chat/type"
import { ChatModeCard } from "./Card"

// ******************************************************************************
const chatModes: ChatModeSpecs[] = [
  {
    name: ChatMode.Single,
    link: ChatLink.Single,
    icon: <Icon as={MdOutlinePersonOutline} />,
    description: "Have a one-on-one conversation with an AI-powered agent specialized in a specific field. Get personalized responses and expert insights tailored to your questions."
  },
  {
    name: ChatMode.Interactive,
    link: ChatLink.Interactive,
    icon: <Icon as={MdOutlineRocketLaunch} />,
    description: "Experience dynamic and engaging conversations as the system intelligently selects the best-suited AI agent to chat with you based on your queries. Enjoy a variety of perspectives and expertise."
  },
  {
    name: ChatMode.Iterative,
    link: ChatLink.Iterative,
    icon: <Icon as={MdOutlineGroups} />,
    description: "Immerse yourself in a multi-agent chat session where different AI agents take turns interacting with you. Each agent brings their unique knowledge and strengths, making for a well-rounded and informative exchange."
  },

]

/** Selector to choose the chat mode: it can be one of the following: {@link ChatMode} 
 * NOTE: Using Component suffix to avoid name collision with the ChatMode type. */
export const ChatModeComponent = () => {
  return (
    <Stack px="0.5em" spacing={4}>
      {chatModes.map((mode, index) => (
        <ChatModeCard key={index} {...mode} />
      ))}
    </Stack>
  )
}