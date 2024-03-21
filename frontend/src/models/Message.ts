import { Room } from './Room';
import { User } from './User';

export type Message = {
  id?: string;
  user: User;
  room: Room;
  role: string;
  content: string | Result[];
  created_at: string;
};

export type Result = {
  fileName: string;
  accuracy: number;
  content: string;
  contextBefore?: string;
  contextAfter?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  entities?: any[];
  original_entities?: any[];
};
