import { Room } from './Room';
import { User } from './User';

export enum OpenAIModel {
  GPT_3_5_TURBO = 'gpt-3.5-turbo',
  GPT_4O = 'gpt-4o',
  GPT_4O_MINI = 'gpt-4o-mini'
}

export type Message = {
  id?: string;
  user: User;
  room: Room;
  role: string;
  content: string | Result[];
  created_at: string;
  model?: OpenAIModel;
};

export type Result = {
  fileName: string;
  accuracy: number;
  content: string;
  context_before: string;
  context_after: string;
  entities?: any[];
  original_entities?: any[];
};
