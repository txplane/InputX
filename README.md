# InputX

**InputX** is a high-speed API gateway for AI inference, enabling seamless, low-latency access to large language models through a simple and scalable interface.

## 🚀 Features
- 🔐 API key-based authentication
- ⚡ Fast and lightweight Node.js backend using Fastify
- 🧠 OpenAI integration (with more models coming soon)
- 📊 Usage logging for metering and billing
- 🧱 Ready for deployment on Vercel, AWS Lambda, or Fly.io

## 📦 Getting Started

```bash
git clone https://github.com/yourusername/inputx.git
cd inputx
npm install
cp .env.example .env
# Add your OpenAI API key to .env
npm start
```

## 🔑 API Usage

### Endpoint
`POST /inference`

### Headers
```
Authorization: Bearer <your-api-key>
```

### Body
```json
{
  "prompt": "What is the capital of France?",
  "model": "gpt-3.5-turbo"
}
```

## 🧱 Roadmap
- [ ] Add support for Ollama / local models
- [ ] Token-based usage tracking and billing
- [ ] Web3 wallet-based access and payments
- [ ] Caching layer for repeated queries

## 📄 License
MIT - see [LICENSE](./LICENSE)

---

*InputX: Serve AI like infrastructure.*
