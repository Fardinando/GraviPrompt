import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

export async function optimizePrompt(originalPrompt: string, category: string) {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY não configurada.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const systemInstruction = `Você é o GraviPrompt, um especialista sênior em engenharia de prompts e consultor técnico para a Antigravity.
Sua tarefa é transformar prompts básicos em prompts de alta performance, estruturados e detalhados.

IMPORTANTE: Você deve pesquisar por "Antigravity Skills" no GitHub e utilizá-las se forem relevantes para o prompt do usuário.
Se encontrar Skills relevantes:
1. Cite a Skill com um link clicável para o repositório no GitHub.
2. Forneça um passo a passo conciso de como instalar essa Skill no ambiente Antigravity.
3. Coloque essas informações em uma seção reservada chamada "🛠️ Antigravity Skills & Integração".

Estrutura esperada para o prompt otimizado:
1. Contexto/Papel: Defina quem a IA deve ser.
2. Tarefa: O que exatamente deve ser feito.
3. Restrições/Diretrizes: O que evitar ou seguir rigorosamente.
4. Formato de Saída: Como o resultado deve ser apresentado.

Categoria atual: ${category}.

Se a categoria for 'Web Sites' ou 'UI Design', inclua sugestões de acessibilidade e design responsivo.
Se for 'Game Dev', foque em lógica, mecânicas e narrativa.
Se for 'Data Science', foque em precisão estatística e eficiência algorítmica.

Retorne o prompt otimizado final em formato Markdown.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", // Use 3.0 Flash for tool support
      contents: [{ parts: [{ text: originalPrompt }] }],
      config: {
        systemInstruction,
        temperature: 0.7,
        tools: [{ googleSearch: {} }] as any, // Enable Google Search for finding skills
      },
    });

    return response.text || "Não foi possível otimizar o prompt.";
  } catch (error) {
    console.error("Erro ao otimizar prompt:", error);
    throw error;
  }
}
