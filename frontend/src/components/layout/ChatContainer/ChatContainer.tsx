import ChatContainerStyles from './ChatContainerStyles';
import { Message } from '../../../models/Message';
import UserMessageItem from '../../common/Messages/UserMessageItem/UserMessageItem';
import SearchMessageItem from '../../common/Messages/SearchMessageItem/SearchMessageItem';
import ChatGPTMessageItem from '../../common/Messages/ChatGPTMessageItem/ChatGPTMessageItem';
import { useEffect, useRef } from 'react';

interface ChatContainerProps {
  messages: Message[];
  onSendToChatGPT: () => void;
  isLoading?: boolean;
}

const ChatContainer = ({
  messages,
  onSendToChatGPT,
  isLoading = false
}: ChatContainerProps) => {
  const styles = ChatContainerStyles();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const renderMessageItem = (message: Message, index: number) => {
    switch (message.role) {
      case 'system':
        return (
          <SearchMessageItem
            key={`${message.id}-${index}`}
            message={message}
            onSendToChatGPT={onSendToChatGPT}
            isLoading={isLoading}
            onSaveMessage={() => {}}
          />
        );
      case 'assistant':
        return (
          <ChatGPTMessageItem
            key={`${message.id}-${index}`}
            message={message}
            isLoading={isLoading}
          />
        );
      default:
        return (
          <UserMessageItem key={`${message.id}-${index}`} message={message} />
        );
    }
  };
  return (
    <div className={styles.container}>
      {messages.map((message, index) => renderMessageItem(message, index))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatContainer;
