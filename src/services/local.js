import fetch from 'node-fetch';

export async function runLocalInference(prompt, model = 'llama3', options = {}) {
  const { temperature, max_tokens } = options;
  const ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

  try {
    const requestBody = {
      model,
      prompt,
      stream: false
    };

    if (temperature !== undefined) {
      requestBody.options = { temperature };
    }

    if (max_tokens !== undefined) {
      requestBody.options = { ...requestBody.options, num_predict: max_tokens };
    }

    const response = await fetch(`${ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ollama API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Ollama service not running. Please start Ollama first.');
    }
    throw new Error(`Local inference failed: ${error.message}`);
  }
}
