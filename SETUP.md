# AI Chemistry Tutor Setup Guide

This guide will help you set up the AI-powered chemistry tutor that provides molecule suggestions, validation, and educational content using ChatGroq's fast inference API.

## Prerequisites

- Node.js 18+ and npm/pnpm
- ChatGroq account and API key

## Quick Setup

### 1. Get ChatGroq API Key

1. Visit [ChatGroq Console](https://console.chatgroq.com/)
2. Sign up for a free account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the API key (starts with `gsk_`)

### 2. Configure Environment Variables

Create a `.env.local` file in your project root:

```bash
# Copy the example file
cp env.example .env.local

# Edit .env.local and add your API key
CHATGROQ_API_KEY=gsk_your_actual_api_key_here
```

### 3. Test the API Key

```bash
# Test if your API key works
curl -X POST https://api.chatgroq.com/openai/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama-3.1-8b-instant",
    "messages": [{"role": "user", "content": "What is a covalent bond?"}],
    "max_tokens": 100
  }'
```

## Project Setup

### 1. Install Dependencies

```bash
npm install
# or
pnpm install
```

### 2. Start the Development Server

```bash
npm run dev
# or
pnpm dev
```

### 3. Test the AI Tutor

1. Open your browser to `http://localhost:3000`
2. Build a molecule or ask a chemistry question
3. Use the AI Tutor panel on the right side
4. Select a mode and ask for help!

## AI Tutor Features

### Modes Available

1. **Suggestion Mode**: Get AI suggestions for building molecules
2. **Validation Mode**: Validate your molecule structure and get feedback
3. **Education Mode**: Ask general chemistry questions
4. **Hint Mode**: Get helpful hints without spoilers

### Example Questions

- "What is a covalent bond?"
- "How do molecules form?"
- "Tell me about carbon's bonding properties"
- "What molecule am I building?"
- "Is my structure correct?"

## ChatGroq Models

### Recommended Models for Chemistry

- **`llama-3.1-8b-instant`** (Default): Fast, good chemistry knowledge
- **`llama-3.1-70b-version`**: Higher quality, slower responses
- **`mixtral-8x7b-32768`**: Excellent chemistry knowledge, medium speed
- **`gemma-2-9b-it`**: Fast, good for simple explanations

### Change the Model

Edit `app/api/ai-tutor/route.ts` and change the default model:

```typescript
async function queryChatGroq(prompt: string, model: string = "mixtral-8x7b-32768"): Promise<string> {
  // ... rest of the function
}
```

## Troubleshooting

### Common Issues

1. **"API key not configured" error**
   - Make sure `.env.local` exists and contains `CHATGROQ_API_KEY`
   - Restart your development server after adding the environment variable

2. **"Unauthorized" error**
   - Check if your API key is correct
   - Ensure the API key starts with `gsk_`
   - Verify your ChatGroq account is active

3. **"Rate limit exceeded" error**
   - Free tier has rate limits
   - Upgrade to paid plan for higher limits
   - Wait a few minutes before retrying

4. **Slow responses**
   - Try a faster model like `llama-3.1-8b-instant`
   - Check your internet connection
   - Use smaller `max_tokens` values

### Performance Tips

- **Free Tier Limits**: 100 requests per day
- **Paid Plans**: Higher limits and faster models
- **Model Selection**: Balance between speed and quality
- **Response Length**: Adjust `max_tokens` based on needs

## Customization

### Adjust AI Parameters

Modify the generation parameters in `app/api/ai-tutor/route.ts`:

```typescript
{
  temperature: 0.7,    // Lower = more focused, Higher = more creative
  max_tokens: 1000,    // Maximum response length
  top_p: 0.9,         // Nucleus sampling parameter
}
```

### Add Custom Prompts

Extend the `SYSTEM_PROMPT` to include specific chemistry rules or examples.

## Alternative AI Providers

If ChatGroq doesn't work for you, you can integrate with other providers:

- **OpenAI**: Replace with OpenAI API
- **Anthropic**: Use Claude API
- **Local Models**: Integrate with Ollama or other local solutions

## Support

- **ChatGroq Documentation**: https://console.chatgroq.com/docs
- **API Reference**: https://console.chatgroq.com/docs/api
- **Model Library**: https://console.chatgroq.com/docs/models
- **Community**: https://discord.gg/chatgroq

## Pricing

- **Free Tier**: 100 requests/day, basic models
- **Pro Plan**: $20/month, 10,000 requests, all models
- **Enterprise**: Custom pricing for high-volume usage

## License

This AI Tutor uses ChatGroq's API. Please check ChatGroq's terms of service and the specific model licenses.
