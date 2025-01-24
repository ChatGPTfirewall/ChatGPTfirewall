import Request from './Request';

interface CategorizeTextResponse {
  headings: { line: number; heading: string }[];
}

export async function categorizeText(text: string): Promise<CategorizeTextResponse> {
  return Request<CategorizeTextResponse>({
    url: '/api/categorize',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: JSON.stringify({ text }),
  });
}
