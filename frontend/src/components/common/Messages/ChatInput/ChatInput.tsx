import React, { useState, useEffect } from 'react';
import { Button, Textarea } from '@fluentui/react-components';
import ChatInputStyles from './ChatInputStyles';
import { Send24Filled, DocumentSearchRegular, GlobeFilled, DocumentOnePageSparkleRegular } from '@fluentui/react-icons';
import { useTranslation } from 'react-i18next';
import { FileExplorer } from '../../FileExplorer/FileExplorer';
import {File} from "../../../../models/File.ts";
import {SendMessage} from "../../../../models/SendMessage.ts";

interface ChatInputProps {
  onSendMessage: (value: SendMessage) => void;
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
  const [isExplorerOpen, setIsExplorerOpen] = useState(false);
  const [summaryMode, setSummaryMode] = useState(false);
  const [oldButtonState, setOldButtonState] = useState<string>(selectedMessageType);

  useEffect(() => {
    setSelectedButton(selectedMessageType);
  }, [selectedMessageType]);



  const handleSubmit = (e: React.KeyboardEvent<HTMLTextAreaElement> | React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (input.trim() !== '') {
      onSendMessage({
        content: input
      });
      setInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSubmit(e);
    }
  };



  const handleButtonClick = (type: string) => {
    setOldButtonState(selectedButton);
    setSelectedButton(type);
    onChangeMessageType?.(type);
    // If the user wants a document summary, open the FileExplorer
    if (type === 'summary') {
      setSummaryMode(true);
      setIsExplorerOpen(true);
    } else {
      setSummaryMode(false);
    }
  };

    // Wrap onFilesSelected to optionally send an extra prompt for summaries
  const handleFilesSelected = (files: File[]) => {
    if (summaryMode) {
      if (files.length === 0) {
        return;
      }
      const file = files[0];
      onSendMessage({
        content: `${t('summarizeTemplate')} ${file.filename}`,
        file
      });
      setInput('');
      setSummaryMode(false);
      setSelectedButton(oldButtonState);
      onChangeMessageType?.(oldButtonState);
      // Put the document, which is summarizing, in roomFiles if it's not already there'
      // if (!roomFiles.some(item => item.id === file.id)) {
      //   roomFiles.push(file);
      //   onFilesSelected(roomFiles);
      // }
      return;
    }

    onFilesSelected(files);
  };

  const onFileExplorerClose = () => {
    if (summaryMode) {
      setSummaryMode(false);
      setSelectedButton(oldButtonState);
      onChangeMessageType?.(oldButtonState);
    }
  }

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
                  onFilesSelected={handleFilesSelected}
                  open={isExplorerOpen}
                  onOpenChange={setIsExplorerOpen}
                  activeButton={selectedButton}
                  onClose={onFileExplorerClose}
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
                {t('WebSearchButton')}
              </Button>
              <Button
                appearance={selectedButton === 'summary' ? 'primary' : 'subtle'}
                icon={<DocumentOnePageSparkleRegular />}
                className={styles.pillButton}
                onClick={() => handleButtonClick('summary')}
              >
                {t('DocumentSummaryButton')}
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
