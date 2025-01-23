import Request from './Request';

export interface SummarizeTextResponse {
  summary: string;
}

export async function summarizeText(text: string): Promise<SummarizeTextResponse> {
  return Request<SummarizeTextResponse>({
    url: '/api/summarize',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: JSON.stringify({ text }),
  });
}
