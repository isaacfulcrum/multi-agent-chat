import { useState, useEffect, PropsWithChildren } from 'react'

import { useIsMounted } from '@/shared/hook/useIsMounted';
import { Loading } from '@/shared/component/Loading';

import { IChatService } from '../type';
import { ChatProvider } from './ChatProvider';

// **********************************************************************************
type Props = PropsWithChildren<{ chat: IChatService }>;

/** Given a Chat Service, this component initializes it and provides it to its children.
 * NOTE: Using Component suffix to avoid name collision with ChatProvider. */
export const ChatProviderComponent: React.FC<Props> = ({ chat, children }) => {
  const isMounted = useIsMounted();

  // == State =====================================================================
  const [chatService, setChatService] = useState<IChatService | null>(null/*no Chat Service by default*/);
  const [status, setStatus] = useState<'idle' | 'loading' | 'complete' | 'error'>("idle");

  // == Effect ====================================================================
  /*creates a new Chat Service on mount*/
  useEffect(() => {
    if (status !== 'idle'/*don't initialize twice*/ || chatService !== null) return/*nothing to do*/;

    const initializeService = async () => {
      setStatus('loading');
      let service: IChatService | null = null;
      try {
        service = chat;
        await service.initialize();
      } catch (error) {
        // TODO: show error message
        console.error(error);
        if (!isMounted()) return/*component is unmounted, prevent unwanted state updates*/;
        setStatus('error');
        return/*something went wrong* and can't continue*/;
      }

      if (!isMounted()) return/*component is unmounted, prevent unwanted state updates*/;
      setChatService(service);
      setStatus('complete');
    };
    initializeService();
    // NOTE: see effect below to shutdown the Chat Service
  }, [chat, chatService, isMounted, status]);

  // ...............................................................................
  // remove Chat Service on unmount
  useEffect(() => {
    if (chatService === null) return/*nothing to do*/;
    return () => {
      // reset the state
      setStatus('idle');
      setChatService(null);

      if (chatService.isInitialized()) chatService.shutdown();
    };
  }, [chatService, isMounted, setStatus]);

  
  if (status === 'complete' && chatService) {
    return (
      <ChatProvider chat={chatService}>
        {children}
      </ChatProvider>
    );
  }
  
  return <Loading />
}