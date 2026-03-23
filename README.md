GraviPrompt ✨

Otimizador de prompts para a Antigravity — transforme ideias brutas em prompts poderosos com o auxílio da IA do Google Gemini.

🔗 Demo ao vivo: graviprompt.vercel.app
🧪 AI Studio: Abrir no AI Studio

📌 Sobre o projeto
O GraviPrompt é uma aplicação web desenvolvida para a Antigravity com o objetivo de otimizar e aprimorar prompts de inteligência artificial. Com uma interface limpa e intuitiva, o usuário insere um prompt inicial e recebe uma versão refinada, mais clara e eficiente, gerada pelo modelo Google Gemini.

🚀 Tecnologias utilizadas
CamadaTecnologiaFrontendReact 19 + TypeScriptBundlerVite 6EstilizaçãoTailwind CSS 4AnimaçõesFramer MotionIAGoogle Gemini (@google/genai)Banco de dadosSupabase + better-sqlite3Renderizaçãoreact-markdown + remark-gfmDeployVercel

🛠️ Rodando localmente
Pré-requisitos

Node.js (versão 18 ou superior)
Uma chave de API do Google Gemini

Passo a passo

Clone o repositório:

bashgit clone https://github.com/Fardinando/GraviPrompt.git
cd GraviPrompt

Instale as dependências:

bashnpm install

Configure as variáveis de ambiente:

Crie um arquivo .env.local na raiz do projeto (use o .env.example como base):
bashcp .env.example .env.local
Edite o .env.local e adicione sua chave:
envGEMINI_API_KEY=sua_chave_aqui

Rode o projeto:

bashnpm run dev
A aplicação estará disponível em http://localhost:3000.

📦 Scripts disponíveis
ComandoDescriçãonpm run devInicia o servidor de desenvolvimentonpm run buildGera o build de produçãonpm run previewVisualiza o build localmentenpm run lintVerifica erros de tipagem TypeScriptnpm run cleanRemove a pasta dist

🗂️ Estrutura do projeto
GraviPrompt/
├── src/              # Código-fonte da aplicação
├── index.html        # Ponto de entrada HTML
├── vite.config.ts    # Configuração do Vite
├── tsconfig.json     # Configuração do TypeScript
├── package.json      # Dependências e scripts
└── .env.example      # Exemplo de variáveis de ambiente

📄 Licença
Este projeto foi desenvolvido para uso interno da Antigravity. Todos os direitos reservados.

<p align="center">Feito com 💜 para a <strong>Antigravity</strong></p>
