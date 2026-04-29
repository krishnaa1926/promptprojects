const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const OpenAI = require('openai');

dotenv.config();

const app = express();
const distDir = path.join(__dirname, 'dist');
const port = Number(process.env.PORT) || 3000;
const model = process.env.OPENAI_MODEL || 'gpt-5.4-mini';
const apiKey = process.env.OPENAI_API_KEY;

const client = apiKey ? new OpenAI({ apiKey }) : null;

const samples = [
  {
    label: 'JavaScript hello',
    code: "const name = 'Sam';\nconsole.log(`Hello, ${name}!`);",
  },
  {
    label: 'Python loop',
    code: "numbers = [1, 2, 3]\nfor number in numbers:\n    print(number * 2)",
  },
  {
    label: 'HTML button',
    code: "<button onclick=\"alert('Hi!')\">Click me</button>",
  },
];

function detectLanguage(code) {
  const text = code.trim();

  if (!text) return 'Unknown';
  if (/<html|<div|<span|<button|<!DOCTYPE html>|<\w+/.test(text)) return 'HTML';
  if (/^\s*#include\s+</m.test(text)) return 'C/C++';
  if (/\bconsole\.log\b|\bconst\b|\blet\b|\b=>\b|\bfunction\b/.test(text)) return 'JavaScript';
  if (/\bdef\b|\bprint\(|\bimport\b|\belif\b|:\s*$/m.test(text)) return 'Python';
  if (/\bpublic class\b|\bSystem\.out\.println\b/.test(text)) return 'Java';
  if (/\bSELECT\b|\bFROM\b|\bWHERE\b/i.test(text)) return 'SQL';
  if (/\bfunc\b|\bfmt\./.test(text)) return 'Go';
  if (/\busing\s+System\b|\bConsole\.WriteLine\b/.test(text)) return 'C#';
  return 'Code';
}

function toneInstructions(tone) {
  if (tone === 'friendly_step_by_step') {
    return 'Explain the code in a friendly step-by-step way for a beginner. Use short paragraphs and simple words.';
  }

  if (tone === 'beginner_with_more_detail') {
    return 'Explain the code for a beginner with a bit more detail. Keep it clear, warm, and easy to follow.';
  }

  return 'Explain the code like you are teaching a child who is just starting programming. Use very simple words and short sentences.';
}

app.use(express.json({ limit: '1mb' }));
app.use(express.static(distDir));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/config', (_req, res) => {
  res.json({
    apiConfigured: Boolean(apiKey),
    model,
  });
});

app.get('/api/samples', (_req, res) => {
  res.json({ samples });
});

app.post('/api/explain', async (req, res) => {
  const code = typeof req.body?.code === 'string' ? req.body.code.trim() : '';
  const tone = typeof req.body?.tone === 'string' ? req.body.tone : 'super_simple';

  if (!code) {
    return res.status(400).json({ error: 'Please paste some code first.' });
  }

  if (!client) {
    return res.status(500).json({ error: 'OPENAI_API_KEY is missing in .env.' });
  }

  const language = detectLanguage(code);

  try {
    const response = await client.responses.create({
      model,
      instructions: [
        toneInstructions(tone),
        'Mention the language name near the beginning.',
        'If helpful, explain what the code does first, then walk through the important parts.',
        'Do not use heavy jargon.',
      ].join(' '),
      input: `Language guess: ${language}\n\nCode:\n${code}`,
    });

    res.json({
      explanation: response.output_text || 'I understood the code, but I could not format the explanation.',
      language,
      model,
    });
  } catch (error) {
    const message = error && typeof error.message === 'string'
      ? error.message
      : 'Could not explain the code right now.';

    res.status(500).json({ error: message });
  }
});

app.get('/{*path}', (_req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

app.listen(port, () => {
  console.log(`Code Buddy is running on http://localhost:${port}`);
});
