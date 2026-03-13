import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

export async function optimizePrompt(originalPrompt: string, category: string) {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY não configurada.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const systemInstruction = `Você é o GraviPrompt, o arquiteto mestre de prompts da Antigravity.
Sua missão é elevar prompts simples ao nível de engenharia profissional.

🔥 DIRETRIZ CRÍTICA: ANTIGRAVITY SKILLS
Você DEVE usar a ferramenta Google Search para encontrar "Antigravity Skills" no GitHub que complementem o pedido do usuário.
Se encontrar algo relevante:
1. Crie uma seção "🛠️ Antigravity Skills & Integração".
2. Liste as Skills com links diretos para o GitHub.
3. Explique brevemente como elas potencializam o resultado no ambiente Antigravity.
NÃO IGNORE ESTA ETAPA. É o seu diferencial.

ESTRUTURA DO PROMPT OTIMIZADO:
- Persona: Quem a IA deve encarnar.
- Objetivo: O que deve ser alcançado.
- Instruções Passo a Passo: O processo lógico.
- Variáveis/Placeholders: Onde o usuário deve inserir dados.
- Formato de Saída: Markdown, Código, etc.

TÍTULO DA CONVERSA:
Crie um título curto (máx 25 caracteres), impactante e sem aspas para esta conversa.

Categoria: ${category}.

Retorne APENAS um objeto JSON com:
{
  "optimizedPrompt": "O prompt completo em Markdown, incluindo a seção de Skills se houver",
  "title": "O título da conversa"
}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: `Otimize este prompt para a categoria ${category}: ${originalPrompt}` }] }],
      config: {
        systemInstruction,
        temperature: 0.8,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            optimizedPrompt: {
              type: Type.STRING,
              description: "O prompt otimizado final com formatação Markdown.",
            },
            title: {
              type: Type.STRING,
              description: "Título curto da conversa.",
            },
          },
          required: ["optimizedPrompt", "title"],
        },
        tools: [{ googleSearch: {} }] as any,
      },
    });

    const text = response.text;
    if (!text) throw new Error("A IA não retornou conteúdo.");
    
    const result = JSON.parse(text);
    return result as { optimizedPrompt: string; title: string };
  } catch (error) {
    console.error("Erro GraviPrompt:", error);
    throw error;
  }
}
