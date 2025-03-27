curl -X POST http://localhost:3000/inference \
  -H "Authorization: Bearer testkey1" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "What is the capital of France?", "model": "gpt-3.5-turbo"}'
