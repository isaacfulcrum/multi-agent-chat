import { ReactNode } from 'react';

import { IChatService } from '../type';
import { ChatContext } from './ChatContext';


// ********************************************************************************
// == Interface ===================================================================
interface Props {
    chat: IChatService;
    children: ReactNode;
}

// == Component ===================================================================
export const ChatProvider: React.FC<Props> = ({ chat, children }) =>
    <ChatContext.Provider value={{ chat }}>
        {children}
    </ChatContext.Provider>;