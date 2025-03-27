import fetch from 'node-fetch';

export async function runLocalInference(prompt, model = 'llama3') {
  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      prompt,
      stream: false
    })
  });

  if (!response.ok) {
    throw new Error('Local inference failed');
  }

  const data = await response.json();
  return data.response;
}
