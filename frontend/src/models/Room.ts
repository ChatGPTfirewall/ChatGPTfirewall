import { AnonymizationMapping } from './AnonymizationMapping';
import { File } from './File';
import { Message } from './Message';
import { User } from './User';

export type Room = {
  id: string;
  user: User;
  name: string;
  anonymizeCompleteContext: boolean;
  settings: RoomSettings;
  files: File[];
  messages: Message[];
  anonymizationMappings: AnonymizationMapping[];
  created_at: Date;
};

export type RoomSettings = {
  templates: {
    de: string;
    en: string;
  };
  prompt_template: string;
  pre_phrase_count: number;
  post_phrase_count: number;
  active_anonymization_types: string[]; // New field
};

// Example default value if needed
export const defaultAnonymizationTypes = [
  'CARDINAL', 'DATE', 'EVENT', 'FAC', 'GPE', 'LANGUAGE', 'LAW', 'LOC',
  'MONEY', 'NORP', 'ORDINAL', 'ORG', 'PERCENT', 'PERSON', 'PRODUCT',
  'QUANTITY', 'TIME', 'WORK_OF_ART', 'PER', 'MISC'
];