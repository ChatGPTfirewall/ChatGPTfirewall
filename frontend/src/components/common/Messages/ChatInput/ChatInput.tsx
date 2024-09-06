// ChatInput.tsx
import React, { useState } from 'react';
import { Button, Textarea } from '@fluentui/react-components';
import ChatInputStyles from './ChatInputStyles';
import { Send24Filled, Settings24Filled } from '@fluentui/react-icons';
import SettingsDialog from './SettingsDialog'; // Import the new component

interface ChatInputProps {
  onSendMessage: (value: string) => void;
  demo?: boolean;
}

const ChatInput = ({ onSendMessage, demo = false }: ChatInputProps) => {
  const [input, setInput] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
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

  const handleSettingsClick = () => {
    setIsSettingsOpen(true);
  };

  const handleSettingsClose = () => {
    setIsSettingsOpen(false);
  };

  const handleSettingsApply = (settings: Record<string, boolean>) => {
    console.log('Applied settings:', settings);
    // Handle the applied settings as needed
  };

  return (
    <div className={demo ? styles.demoContainer : styles.container}>
      <div className={styles.inputContainer}>
        <Textarea
          appearance="outline"
          className={styles.textArea}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Write a Message..."
          onKeyDown={handleKeyPress}
        />
        <Button
          appearance="subtle"
          icon={<Send24Filled />}
          className={styles.sendButton}
          onClick={() => handleSubmit}
        />
        <Button
          appearance="subtle"
          icon={<Settings24Filled />}
          className={styles.settingsButton}
          onClick={handleSettingsClick}
        />
      </div>

      <SettingsDialog
        isOpen={isSettingsOpen}
        onClose={handleSettingsClose}
        onApply={handleSettingsApply}
      />
    </div>
  );
};

export default ChatInput;
