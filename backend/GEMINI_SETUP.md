# Gemini API Setup Guide

This backend uses Google Gemini API for GenAI-powered explanations.

## Getting Your API Key

1. Visit: https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

## Configuration

Add your API key to the `.env` file:

```bash
GEMINI_API_KEY=your-api-key-here
```

## Model Used

- **Model**: `gemini-1.5-flash`
- **Temperature**: 0.7
- **Max Output Tokens**: 800
- **Response Format**: JSON

## Fallback Behavior

If `GEMINI_API_KEY` is not set, the system automatically uses deterministic explanations (no API calls needed).

## Testing

Test without API key (uses fallback):
```bash
# Don't set GEMINI_API_KEY
npm run dev
```

Test with API key:
```bash
export GEMINI_API_KEY=your-api-key
npm run dev
```

## Cost

Gemini 1.5 Flash is cost-effective and provides fast responses. Check current pricing at: https://ai.google.dev/pricing

