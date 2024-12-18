import Request from './Request';

interface CategorizedHeading {
  line: number;
  heading: string;
}

export async function categorizeText(text: string): Promise<CategorizedHeading[]> {
  return Request<CategorizedHeading[]>({
    url: '/api/categorize',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    data: JSON.stringify({
      text: text
    })
  });
}
