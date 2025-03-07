import Request from './Request';
import { File } from '../models/File';

export async function getFiles(auth0_id: string): Promise<File[]> {
  return Request<File[]>({
    url: '/api/documents',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    data: JSON.stringify({
      auth0_id: auth0_id
    })
  });
}

export async function getFileDetails(documentID: string): Promise<File> {
  return Request<File>({
    url: `/api/documents/${documentID}`,
    method: 'GET'
  });
}

export async function createFiles(data: FormData): Promise<File[]> {
  return Request<File[]>({
    url: '/api/documents/upload',
    method: 'POST',
    data: data
  });
}

export function deleteFiles(fileIds: string[]): Promise<void> {
  return Request<void>({
    url: '/api/documents',
    method: 'DELETE',
    data: fileIds
  });
}

export async function updateFileHeadings(documentID: string, headings: { line: number; heading: string; summary?: string }[]): Promise<void> {
  return Request<void>({
    url: '/api/documents',
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    data: JSON.stringify({
      document_id: documentID,
      headings: headings
    })
  });
}
