import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { OpenRouter } from "@openrouter/sdk";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

async function startServer() {
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

    const { messages } = req.body;
    // Force openrouter/free as requested
    const model = "openrouter/free";

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
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Erro retornado pelo OpenRouter:", data);
        return res.status(response.status).json(data);
      }

      res.json(data);
    } catch (error: any) {
      console.error("Erro na chamada ao OpenRouter:", error);
      res.status(500).json({ 
        error: "Erro ao processar a requisição na IA.",
        details: error.message 
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Only listen if not on Vercel (Vercel handles the listen part)
  if (process.env.NODE_ENV !== "production" || process.env.PORT || process.env.K_SERVICE) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

startServer();

export default app;
