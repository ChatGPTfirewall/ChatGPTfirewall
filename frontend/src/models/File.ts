import { User } from './User';

export type File = {
  id?: string;
  filename: string;
  text?: string;
  user?: User;
  lang?: string;
  fileSize: number;
  uploadedAt?: Date;
  isUploading?: boolean;
  headings?: { line: number; heading: string; summary?: string }[];
};

export type FileResponse = {
  error?: string;
  files: File[];
};
