import { createContext } from 'react';
import { IChatService } from '../type';

// ********************************************************************************
export type ChatContextState = Readonly<{
    chat: IChatService;
}> | null/*not initialized*/;

export const ChatContext = createContext<ChatContextState>(null/*not initialized by default*/);
ChatContext.displayName = 'ChatContext';