import { GoogleGenAI, Type } from "@google/genai";
import { ChatMessage } from "../types";

const apiKey = process.env.GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;

export async function optimizePrompt(
  originalPrompt: string, 
  category: string, 
  target: string = 'ChatGPT',
  history: ChatMessage[] = [],
  researchParams?: {
    time: number;
    level: string;
    sources: number;
    showSources: boolean;
  }
) {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY não configurada.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const isAntigravity = target === 'Antigravity';
  const isProblemSolving = target === 'Solução de Problemas';
  const isResearchMode = category === 'Pesquisa Profunda';

  let systemInstruction = `Você é o GraviPrompt, o arquiteto mestre de prompts da Antigravity.
Sua missão é elevar prompts simples ao nível de engenharia profissional.`;

  if (isResearchMode) {
    systemInstruction = `Você é o GraviPrompt, um Especialista em Pesquisa Profunda e Analista de Dados.
🎯 MODO: Pesquisa Profunda

Sua tarefa é realizar uma investigação exaustiva sobre o tópico fornecido pelo usuário.
Você deve usar a ferramenta Google Search para encontrar informações precisas, atuais e de fontes confiáveis.

DIRETRIZES DE PESQUISA:
- Nível de Pesquisa: ${researchParams?.level}.
- Tempo Simulado de Processamento: ${researchParams?.time} segundos.
- Quantidade de Fontes: ${researchParams?.sources}.
- Mostrar Fontes: ${researchParams?.showSources ? 'Sim' : 'Não'}.

ESTRUTURA DA RESPOSTA:
1. 📊 Sumário Executivo: Um resumo rápido do que foi encontrado.
2. 🔍 Descobertas Detalhadas: O corpo principal da pesquisa, organizado por subtópicos.
3. 💡 Insights & Conclusões: O que essas informações significam na prática.
4. 📚 Fontes Utilizadas: ${researchParams?.showSources ? 'Liste os links das fontes encontradas.' : 'Não liste os links, apenas mencione a qualidade das fontes.'}

Se o nível for "Challenger Deep", seja extremamente técnico, detalhado e use o máximo de dados possível.

TÍTULO DA CONVERSA:
Crie um título curto (máx 25 caracteres), impactante e sem aspas para esta conversa.`;
  } else if (isProblemSolving) {
    systemInstruction = `Você é o GraviPrompt, um especialista em resolução de problemas complexos e um colaborador humano.
🎯 MODO: Solução de Problemas

🎯 ANÁLISE DE INTENÇÃO:
Sempre responda de forma direta e humana neste modo. Não crie prompts otimizados aqui, a menos que explicitamente solicitado.

DIRETRIZ DE PERSONA:
- Fale como um humano ajudando outro humano. Use um tom amigável, profissional e empático.
- Evite falar "consigo mesmo" ou gerar relatórios frios. Diga coisas como "Entendi o seu ponto", "Acho que podemos tentar isso", "O que você acha dessa abordagem?".
- Transforme a interação em uma conversa comum entre dois colegas de trabalho.

ESTRUTURA DA RESPOSTA (Mantenha natural):
- Reconheça o problema e mostre empatia.
- Proponha caminhos claros.
- Se houver código ou passos técnicos, explique-os como se estivesse ensinando um amigo.
- Peça feedback ou pergunte se a solução faz sentido.

TÍTULO DA CONVERSA:
Crie um título curto (máx 25 caracteres), impactante e sem aspas para esta conversa.`;
  } else {
    // Default Optimization Mode
    systemInstruction += `
🎯 DECISÃO DE FLUXO (OBRIGATÓRIO):
Você deve classificar a entrada do usuário em uma destas duas categorias ANTES de responder:

1. RESPOSTA DIRETA (CONVERSA/INFORMAÇÃO):
   - Use quando o usuário faz perguntas sobre conceitos, definições, explicações ou curiosidades.
   - AÇÃO: Responda diretamente como um assistente especializado.

2. OTIMIZAÇÃO DE PROMPT (ENGENHARIA):
   - Use quando o usuário fornece uma tarefa ou instrução.
   - AÇÃO: Aplique o framework de engenharia de prompt para o alvo ${target}.

🎯 ALVO DE OTIMIZAÇÃO: ${target}

ESTRUTURA DO PROMPT OTIMIZADO:
- Persona: Quem a IA deve encarnar.
- Objetivo: O que deve ser alcançado.
- Instruções Passo a Passo: O processo lógico.
- Variáveis/Placeholders: Onde o usuário deve inserir dados.
- Formato de Saída: Markdown, Código, etc.

TÍTULO DA CONVERSA:
Crie um título curto (máx 25 caracteres), impactante e sem aspas para esta conversa.`;

    if (isAntigravity) {
      systemInstruction += `
🔥 DIRETRIZ CRÍTICA: ANTIGRAVITY SKILLS
Como o alvo é "Antigravity", você DEVE usar a ferramenta Google Search para encontrar "Antigravity Skills" no GitHub.
1. Crie uma seção "🛠️ Antigravity Skills & Integração".
2. Liste as Skills com links diretos para o GitHub.`;
    }
  }

  systemInstruction += `\n\nCategoria: ${category}.\n\nRetorne APENAS um objeto JSON com:
{
  "optimizedPrompt": "O conteúdo principal em Markdown",
  "skillsMarkdown": "APENAS para o modo Antigravity: Uma seção formatada em Markdown com os links das Skills. Caso contrário, string vazia.",
  "title": "O título da conversa"
}`;

  try {
    const config: any = {
      systemInstruction,
      temperature: 0.8,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          optimizedPrompt: {
            type: Type.STRING,
            description: "O conteúdo principal com formatação Markdown.",
          },
          skillsMarkdown: {
            type: Type.STRING,
            description: "Links das Antigravity Skills em Markdown (opcional).",
          },
          title: {
            type: Type.STRING,
            description: "Título curto da conversa.",
          },
        },
        required: ["optimizedPrompt", "title"],
      },
    };

    const tools: any[] = [];
    if (isAntigravity || isResearchMode) {
      tools.push({ googleSearch: {} });
    }
    // Adiciona urlContext para análise de links
    tools.push({ urlContext: {} });
    config.tools = tools;

    // Convert history to Gemini format
    const contents = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: Array.isArray(msg.content) ? msg.content[msg.currentVersion || 0] : msg.content }]
    }));

    // Add current message
    contents.push({
      role: 'user',
      parts: [{ text: isResearchMode 
        ? `Realize uma pesquisa profunda sobre o tópico: ${originalPrompt}`
        : isProblemSolving 
        ? `Resolva este problema ou continue a conversa: ${originalPrompt}` 
        : `Otimize este prompt ou refine a otimização anterior para ${target} na categoria ${category}: ${originalPrompt}` }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents,
      config,
    });

    const text = response.text;
    if (!text) throw new Error("A IA não retornou conteúdo.");
    
    const result = JSON.parse(text);
    return result as { optimizedPrompt: string; title: string; skillsMarkdown?: string };
  } catch (error) {
    console.error("Erro GraviPrompt:", error);
    throw error;
  }
}
