import React, { createContext, useContext, useState, ReactNode } from 'react';
import { OpenAIModel } from '../models/Message';

interface AIModelContextType {
  selectedModel: OpenAIModel;
  setSelectedModel: (model: OpenAIModel) => void;
}

const AIModelContext = createContext<AIModelContextType | undefined>(undefined);

export const useAIModel = () => {
  const context = useContext(AIModelContext);
  if (context === undefined) {
    throw new Error('useAIModel must be used within an AIModelProvider');
  }
  return context;
};

interface AIModelProviderProps {
  children: ReactNode;
}

export const AIModelProvider: React.FC<AIModelProviderProps> = ({ children }) => {
  const [selectedModel, setSelectedModel] = useState<OpenAIModel>(OpenAIModel.GPT_4O_MINI);

  const value = {
    selectedModel,
    setSelectedModel,
  };

  return (
    <AIModelContext.Provider value={value}>
      {children}
    </AIModelContext.Provider>
  );
}; 