import React, { useState, useEffect } from 'react';
import { Button, Textarea, Dropdown, Option, OptionOnSelectData } from '@fluentui/react-components';
import ChatInputStyles from './ChatInputStyles';
import { Send24Filled, DocumentSearchRegular, GlobeFilled, ChatFilled } from '@fluentui/react-icons';
import { useTranslation } from 'react-i18next';
import { OpenAIModel } from '../../../../models/Message';

interface ChatInputProps {
  onSendMessage: (value: string) => void;
  onModelChange?: (value: OpenAIModel) => void;
  onChangeMessageType?: (value: string) => void;
  demo?: boolean;
  selectedModel: OpenAIModel;
  selectedMessageType: string;
}


const ChatInput = ({ onSendMessage, onModelChange, onChangeMessageType, demo = false, selectedModel, selectedMessageType }: ChatInputProps) => {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [internalModel, setInternalModel] = useState<string>(selectedModel);
  const [selectedButton, setSelectedButton] = useState<string>(selectedMessageType);
  const styles = ChatInputStyles();

  useEffect(() => {
    setInternalModel(selectedModel);
  }, [selectedModel]);

  useEffect(() => {
    setSelectedButton(selectedMessageType);
  }, [selectedMessageType]);

  const availableModels = [
    { key: 'gpt-4o', label: 'GPT-4o', description: t('gpt4o_description') },
    { key: 'gpt-4o-mini', label: 'GPT-4o Mini', description: t('gpt4o_mini_description') },
    { key: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', description: t('gpt35turbo_description') }
  ];

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

  const handleModelChange = (_event: React.SyntheticEvent, data: OptionOnSelectData) => {
    if (data.optionValue) {
      setInternalModel(data.optionValue);
      onModelChange?.(data.optionValue as OpenAIModel);
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
          <div className={styles.buttonGroup}>
            <Button 
              appearance={selectedButton === 'document' ? 'primary' : 'subtle'}
              icon={<DocumentSearchRegular />} 
              className={styles.pillButton}
              onClick={() => handleButtonClick('document')}
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
            <Button 
              appearance={selectedButton === 'gpt' ? 'primary' : 'subtle'}
              icon={<ChatFilled />} 
              className={styles.pillButton}
              onClick={() => handleButtonClick('gpt')}
            >
              {t('DirectGPTButton')}
            </Button>
          </div>
          <label style={{ fontWeight: 'bold', alignContent: 'center', }}>
            {t('aiModelLabel')}:
          </label>
            <Dropdown value={internalModel} onOptionSelect={handleModelChange} aria-label="Select AI Model" style={{ width: 'auto', minWidth: '130px', maxWidth: '225px', marginLeft: '8px', marginRight: '56px', flexShrink: 1, flexGrow: 1 }}
            >
            {availableModels.map((model) => (
              <Option key={model.key} value={model.key} text={model.label}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center'}}>
                  <strong>{model.label}</strong>
                  <span style={{ opacity: 0.7 }}>{model.description}</span>
                </div>
              </Option>
            ))}
          </Dropdown>
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
