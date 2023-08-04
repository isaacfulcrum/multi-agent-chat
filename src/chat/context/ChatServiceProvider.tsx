import { useIsMounted } from '@/shared/hook/useIsMounted';
import { useToast } from '@chakra-ui/react';
import { useState, useEffect, PropsWithChildren } from 'react'
import { IChatService } from '../type';

import { SingleAgentChat } from '../service';
import { ConversationalAgent } from '@/agent/service';
import { OpenAIService } from '@/openai/service';
import { ChatProvider } from './ChatProvider';
// **********************************************************************************

type Props = PropsWithChildren<{ chat: IChatService }>;

const ChatServiceProvider: React.FC<Props> = ({ chat, children }) => {

  const isMounted = useIsMounted();

  // == State =====================================================================
  const [application, setApplication] = useState<IChatService | null>(null/*no Application by default*/);
  const [status, setStatus] = useState<'idle' | 'loading' | 'complete' | 'error'>("idle");

  // == Effect ====================================================================
  // creates a new Editor Application
  useEffect(() => {
    if (status !== 'idle'/*don't initialize twice*/ || application !== null) return/*nothing to do*/;

    const initializeService = async () => {
      setStatus('loading');
      let application;
      try {
        application = chat;
        await application.initialize();
      } catch (error) {
        console.error(error);
        if (!isMounted()) return/*component is unmounted, prevent unwanted state updates*/;
        setStatus('error');
        return/*something went wrong* and can't continue*/;
      }

      if (!isMounted()) return/*component is unmounted, prevent unwanted state updates*/;

      setApplication(application);
      setStatus('complete');
    };
    initializeService();

    // NOTE: see effect below to shutdown the Service
  }, [application, isMounted, status, chat]);

  // ...............................................................................
  // remove Application on unmount
  useEffect(() => {
    if (application === null) return/*nothing to do*/;
    // Component unmounts or RichtextId changes, either way the application must
    // be shutdown.
    return () => {
      // reset the state
      setStatus('idle');
      setApplication(null);

      if (application.isInitialized()) application.shutdown();
    };
  }, [application, isMounted, setStatus]);


  if (status === 'complete' && application) {
    return (
      <ChatProvider chat={application}>
        {children}
      </ChatProvider>
    );
  }
  return null;
}

export default ChatServiceProvider;