import React, { useState, useEffect } from 'react';
import { Button, Textarea } from '@fluentui/react-components';
import ChatInputStyles from './ChatInputStyles';
import { Send24Filled, DocumentSearchRegular, GlobeFilled, ChatFilled } from '@fluentui/react-icons';
import { useTranslation } from 'react-i18next';
import { FileExplorer } from '../../FileExplorer/FileExplorer';
import {File} from "../../../../models/File.ts";

interface ChatInputProps {
  onSendMessage: (value: string) => void;
  onChangeMessageType?: (value: string) => void;
  roomFiles: File[];
  onFilesSelected: (files: File[]) => void;
  demo?: boolean;
  selectedMessageType: string;
}


const ChatInput = ({ onSendMessage, onChangeMessageType, roomFiles, onFilesSelected, demo = false, selectedMessageType }: ChatInputProps) => {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [selectedButton, setSelectedButton] = useState<string>(selectedMessageType);
  const styles = ChatInputStyles();

  useEffect(() => {
    setSelectedButton(selectedMessageType);
  }, [selectedMessageType]);



  const handleSubmit = (e: React.KeyboardEvent<HTMLTextAreaElement> | React.MouseEvent<HTMLButtonElement>) => {
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



  const handleButtonClick = (type: string) => {
    setSelectedButton(type);
    onChangeMessageType?.(type);
  };

  return (
    <div className={demo ? styles.demoContainer : styles.container}>
      <div className={styles.inputContainer}>
        <Textarea
          appearance="filled-lighter"
          className={styles.textArea}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('MessagePlaceholder')}
          onKeyDown={handleKeyPress}
        />
        <div className={styles.bottomContainer}>
            {!demo && (
            <>
              <div className={styles.buttonGroup}>
              <FileExplorer
                  roomFileIds={roomFiles?.map(file => file.id!) ?? []}
                  onFilesSelected={onFilesSelected}
              />
              <Button 
                appearance={selectedButton === 'document' ? 'primary' : 'subtle'}
                icon={<DocumentSearchRegular />} 
                className={styles.pillButton}
                onClick={() => handleButtonClick('document')}
                disabled={roomFiles.length === 0}
              >
                {t('DocumentSearchButton')}
              </Button>
              <Button 
                appearance={selectedButton === 'web' ? 'primary' : 'subtle'}
                icon={<GlobeFilled />} 
                className={styles.pillButton}
                onClick={() => handleButtonClick('web')}
              >
                {t('WebSeachButton')}
              </Button>
              </div>
            </>
            )}
          <Button
          appearance="subtle"
          icon={<Send24Filled />}
          className={styles.sendButton}
          onClick={handleSubmit}
        />
        </div>
      </div>
    </div>
    
  );
};

export default ChatInput;
