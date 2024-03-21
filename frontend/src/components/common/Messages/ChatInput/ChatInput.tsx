import React, { useState } from 'react';
import { Button, Textarea } from '@fluentui/react-components';
import ChatInputStyles from './ChatInputStyles';
import { Send24Filled } from '@fluentui/react-icons';

interface ChatInputProps {
  onSendMessage: (value: string) => void;
  demo?: boolean;
}

const ChatInput = ({ onSendMessage, demo = false }: ChatInputProps) => {
  const [input, setInput] = useState('');
  const styles = ChatInputStyles();

  const handleSubmit = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    if (input.trim() !== '') {
      onSendMessage(input);
      setInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSubmit(e);
    }
  };

  return (
    <div className={demo ? styles.demoContainer : styles.container}>
      <div className={styles.inputContainer}>
        <Textarea
          appearance="outline"
          className={styles.textArea}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Schreibe eine Nachricht..."
          onKeyDown={handleKeyPress}
        />
        <Button
          appearance="subtle"
          icon={<Send24Filled />}
          className={styles.sendButton}
          onClick={() => handleSubmit}
        />
      </div>
    </div>
  );
};

export default ChatInput;
