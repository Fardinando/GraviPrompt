import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// API routes go here
app.get("/api/ai/config", (req, res) => {
  res.json({ 
    hasApiKey: !!process.env.OPENROUTER_API_KEY,
    appUrl: process.env.APP_URL || "http://localhost:3000"
  });
});

// Proxy endpoint for OpenRouter using direct fetch for maximum compatibility
app.post("/api/ai/generate", async (req, res) => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "OPENROUTER_API_KEY não configurada no servidor." });
  }

  const { messages, model: requestedModel } = req.body;
  const model = requestedModel || "openrouter/free";

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.APP_URL || "http://localhost:3000",
        "X-Title": "GraviPrompt",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages,
        stream: false
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const data = await response.json();

    if (!response.ok) {
      console.error("Erro retornado pelo OpenRouter:", data);
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      console.error("AI response timed out");
      return res.status(504).json({ error: "AI response timed out" });
    }
    console.error("Erro na chamada ao OpenRouter:", error);
    res.status(500).json({ 
      error: "Erro ao processar a requisição na IA.",
      details: error.message 
    });
  }
});

// Logic for local development vs production
async function startServer() {
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    // Dynamic import to avoid bundling Vite in production
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

startServer();

export default app;
