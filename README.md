# GraviPrompt ✨

> Otimizador de prompts para a **Antigravity** — transforme ideias brutas em prompts poderosos com o auxílio da IA do Google Gemini.

🔗 **Demo ao vivo:** [graviprompt.vercel.app](https://graviprompt.vercel.app)
🧪 **AI Studio:** [Abrir no AI Studio](https://ai.studio/apps/a3e10a81-bfc4-41c7-8e26-c4b70f362cfd)

---

## 📌 Sobre o projeto

O **GraviPrompt** é uma aplicação web desenvolvida para a **Antigravity** com o objetivo de otimizar e aprimorar prompts de inteligência artificial. Com uma interface limpa e intuitiva, o usuário insere um prompt inicial e recebe uma versão refinada, mais clara e eficiente, gerada pelo modelo **Google Gemini**.

---

## 🚀 Tecnologias utilizadas

| Camada | Tecnologia |
|---|---|
| Frontend | React 19 + TypeScript |
| Bundler | Vite 6 |
| Estilização | Tailwind CSS 4 |
| Animações | Framer Motion |
| IA | Google Gemini (`@google/genai`) |
| Banco de dados | Supabase + better-sqlite3 |
| Renderização | react-markdown + remark-gfm |
| Deploy | Vercel |

---

## 🛠️ Rodando localmente

### Pré-requisitos

- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- Uma chave de API do Google Gemini

### Passo a passo

1. **Clone o repositório:**

```bash
git clone https://github.com/Fardinando/GraviPrompt.git
cd GraviPrompt
```

2. **Instale as dependências:**

```bash
npm install
```

3. **Configure as variáveis de ambiente:**

Crie um arquivo `.env.local` na raiz do projeto (use o `.env.example` como base):

```bash
cp .env.example .env.local
```

Edite o `.env.local` e adicione sua chave:

```env
GEMINI_API_KEY=sua_chave_aqui
```

4. **Rode o projeto:**

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`.

---

## 📦 Scripts disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera o build de produção |
| `npm run preview` | Visualiza o build localmente |
| `npm run lint` | Verifica erros de tipagem TypeScript |
| `npm run clean` | Remove a pasta `dist` |

---

## 🗂️ Estrutura do projeto

```
GraviPrompt/
├── src/              # Código-fonte da aplicação
├── index.html        # Ponto de entrada HTML
├── vite.config.ts    # Configuração do Vite
├── tsconfig.json     # Configuração do TypeScript
├── package.json      # Dependências e scripts
└── .env.example      # Exemplo de variáveis de ambiente
```

---

## 📄 Licença

Este projeto foi desenvolvido por Fernando Anderson Almeida Sousa. Todos os direitos reservados.

---

<p align="center">Feito com 💜 para <strong>VOcê</strong></p>
