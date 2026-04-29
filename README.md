# Code Buddy

A small Express app that serves a chatbot UI for explaining code in simple language.

## What it does

- Lets the user paste code into a chat-style React interface
- Automatically guesses the programming language
- Sends the code to OpenAI
- Returns a friendly explanation written like a tiny teacher is talking

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file from `.env.example`

3. Add your OpenAI API key:

```env
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-5.4-mini
PORT=3000
```

4. Start the app:

```bash
npm run dev
```

5. Open `http://localhost:3000`

## Important files

- `server.js` runs the backend API and serves the built frontend
- `dist/` contains the built chatbot frontend
- `.env.example` shows the required environment variables
- `render.yaml` lets you deploy this to Render as a web service

## API endpoints

- `GET /api/health` checks whether the backend is alive
- `GET /api/config` returns app readiness and model info
- `GET /api/samples` returns example code snippets for the UI
- `POST /api/explain` explains code using OpenAI

## Request example

```json
{
  "code": "const name = 'Sam'; console.log(name);",
  "tone": "super_simple"
}
```

## Deploy to Render

1. Push this repo to GitHub
2. In Render, create a new Blueprint or Web Service
3. Set the environment variable `OPENAI_API_KEY`
4. Deploy and use the public URL Render gives you

## Notes

- The backend uses `gpt-5.4-mini` for a good speed and cost balance.
- Language detection is a best-guess helper, not a strict parser.
- The app will not generate explanations until `OPENAI_API_KEY` is set.
