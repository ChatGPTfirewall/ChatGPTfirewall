import { File } from './File.ts';

export type SendMessage = {
  content: string
  file?: File
}