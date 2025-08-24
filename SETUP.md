# ChemVR Setup Guide

## Quick Start

1. **Clone and install**
```bash
git clone <repository-url>
cd mufg
pnpm install
```

2. **Environment setup**
```bash
cp .env.example .env.local
# Edit .env.local with your API keys
```

3. **Start development**
```bash
pnpm dev
```

## Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Groq API Key
GROQ_API_KEY=your_groq_api_key
```

## API Setup

### Groq API Key

1. **Get your API key**
   - Visit [Groq Console](https://console.groq.com/)
   - Sign up or log in
   - Navigate to API Keys section
   - Create a new API key

2. **Add to environment**
   - Copy your API key
   - Add `GROQ_API_KEY=your_key_here` to `.env.local`

3. **Test the API**
```bash
npm run test:ai
```

### Available AI Features

The AI tutor can help with:
- **Suggestions**: "What molecule am I building?"
- **Validation**: "Is my structure correct?"
- **Education**: "Tell me about carbon's bonding properties"
- **Hints**: Context-aware guidance during molecule building

## Groq Models

### Recommended Models for Chemistry

- **`llama-3.1-8b-instant`** (Default): Fast, excellent chemistry knowledge
- **`llama-3.1-70b-version`**: Higher quality, more detailed responses
- **`mixtral-8x7b-32768`**: Good balance of speed and quality
- **`gemma-7b-it`**: Fast and efficient for simple queries

### Change the Model

Edit `app/api/ai-tutor/route.ts` and change the default model:

```typescript
async function queryGroq(prompt: string, model: string = "llama-3.1-70b-version"): Promise<string> {
  // ... rest of the function
}
```

## Troubleshooting

### Common Issues

1. **"API key not configured" error**
   - Make sure `.env.local` exists and contains `GROQ_API_KEY`
   - Restart your development server after adding the environment variable

2. **"Unauthorized" error**
   - Check if your API key is correct
   - Get your API key from [Groq Console](https://console.groq.com/)
   - Verify your Groq account is active

3. **"Rate limit exceeded" error**
   - Free tier has rate limits
   - Upgrade to paid plan for higher limits
   - Wait a few minutes before retrying

4. **Slow responses**
   - Try a faster model like `llama-3.1-8b-instant`
   - Check your internet connection
   - Use smaller `max_tokens` values

### Performance Tips

- **Free Tier Limits**: Varies by model and plan
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

If Groq doesn't work for you, you can integrate with other providers:

### OpenAI
```typescript
// Replace the queryGroq function
async function queryOpenAI(prompt: string): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    }),
  })
  // ... rest of implementation
}
```

### Anthropic Claude
```typescript
// Replace the queryGroq function
async function queryClaude(prompt: string): Promise<string> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-3-sonnet-20240229",
      max_tokens: 1000,
      messages: [
        { role: "user", content: `${SYSTEM_PROMPT}\n\n${prompt}` }
      ],
    }),
  })
  // ... rest of implementation
}
```

## Development Commands

```bash
# Check environment variables
npm run check:env

# Test AI API
npm run test:ai

# Setup reminders
npm run setup:firebase
npm run setup:env
```
