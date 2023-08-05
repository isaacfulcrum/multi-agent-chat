import { Stack } from "@chakra-ui/react"

import { chatModeList } from "@/chat/type"

import { ChatModeCard } from "./Card"

// ******************************************************************************

/** Selector to choose the chat mode: it can be one of the following: {@link ChatMode} 
 * NOTE: Using Component suffix to avoid name collision with the ChatMode type. */
export const ChatModeComponent = () => {
  return (
    <Stack px="0.5em" spacing={4}>
      {chatModeList.map((mode, index) => (
        <ChatModeCard key={index} {...mode} />
      ))}
    </Stack>
  )
}