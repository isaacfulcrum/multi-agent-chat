import { useContext } from 'react';
import { ChatContext } from '../context/ChatContext';

// ********************************************************************************
export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) throw new Error(`useChat hook must be used within a ${ChatContext.displayName} context or the context was not initialized.`);

    return context;
};