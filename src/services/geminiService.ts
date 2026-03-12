import { GoogleGenAI, Type } from "@google/genai";

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

Além do prompt otimizado, você deve criar um título curto e criativo (máximo 30 caracteres) para esta conversa.

Categoria atual: ${category}.

Se a categoria for 'Web Sites' ou 'UI Design', inclua sugestões de acessibilidade e design responsivo.
Se for 'Game Dev', foque em lógica, mecânicas e narrativa.
Se for 'Data Science', foque em precisão estatística e eficiência algorítmica.

Retorne o resultado no formato JSON com as chaves "optimizedPrompt" e "title".`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: originalPrompt }] }],
      config: {
        systemInstruction,
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            optimizedPrompt: {
              type: Type.STRING,
              description: "O prompt otimizado final em formato Markdown.",
            },
            title: {
              type: Type.STRING,
              description: "Um título curto e criativo para a conversa.",
            },
          },
          required: ["optimizedPrompt", "title"],
        },
        tools: [{ googleSearch: {} }] as any,
      },
    });

    const text = response.text;
    if (!text) throw new Error("Resposta vazia da IA.");
    
    const result = JSON.parse(text);
    return result as { optimizedPrompt: string; title: string };
  } catch (error) {
    console.error("Erro ao otimizar prompt:", error);
    throw error;
  }
}
