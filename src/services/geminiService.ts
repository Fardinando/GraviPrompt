import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

export async function optimizePrompt(originalPrompt: string, category: string) {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY não configurada.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const systemInstruction = `Você é o GraviPrompt, um especialista sênior em engenharia de prompts.
Sua tarefa é transformar prompts básicos em prompts de alta performance, estruturados e detalhados.
Categoria atual: ${category}.

Estrutura esperada para o prompt otimizado:
1. Contexto/Papel: Defina quem a IA deve ser.
2. Tarefa: O que exatamente deve ser feito.
3. Restrições/Diretrizes: O que evitar ou seguir rigorosamente.
4. Formato de Saída: Como o resultado deve ser apresentado.

Se a categoria for 'Web Sites' ou 'UI Design', inclua sugestões de acessibilidade e design responsivo.
Se for 'Game Dev', foque em lógica, mecânicas e narrativa.
Se for 'Data Science', foque em precisão estatística e eficiência algorítmica.

Retorne APENAS o prompt otimizado final em formato Markdown.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [{ parts: [{ text: originalPrompt }] }],
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return response.text || "Não foi possível otimizar o prompt.";
  } catch (error) {
    console.error("Erro ao otimizar prompt:", error);
    throw error;
  }
}
