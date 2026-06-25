# Chatbot · Ollama + LangChain + React 

Desenvolvimento de um chatbot full-stack que roda totalmente local, sem depender de APIs externas. O back-end foi construído em Python, usando FastAPI para a API, LangChain para estruturar as conversas e Ollama para executar o modelo de linguagem direto na máquina. As respostas chegam em streaming e o chatbot mantém o histórico da conversa para dar respostas com contexto.

No front-end, a interface foi feita em React com Tailwind CSS e componentes inspirados no shadcn/ui, buscando uma experiência limpa e responsiva.

O assistente também foi configurado para responder mensagens em outras línguas.

## 📸 Preview
### Tela inicial
<img width="1902" height="907" alt="0" src="https://github.com/user-attachments/assets/31ab917e-3b21-496f-a116-3104c2f6ac9b" />


### 1. Exemplo de conversas

<div align="center">
  <table>
    <tr>
      <td><img width="600" alt="3" src="https://github.com/user-attachments/assets/74329d18-f435-4a4b-921b-4268f61193bf" /></td>
      <td><img width="600" alt="2" src="https://github.com/user-attachments/assets/ce8de58c-9517-4313-b75b-41325b46ba6d"/></td>
    </tr>
      <tr>
      <td><img width="600" alt="7" src="https://github.com/user-attachments/assets/63944219-7e5c-4298-a3b0-a04eb05e0c1e" />
</td>
    <td><img width="600" alt="5" src="https://github.com/user-attachments/assets/fa641a81-2783-468a-be68-c439f2f5a50d" />
 </td>
      </tr>
  </table>
</div>


## Estrutura

```
chatbot-ollama/
├── backend/
│   ├── main.py            # API FastAPI + LangChain + Ollama
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── App.jsx                  # tela principal do chat
    │   ├── components/ChatMessage.jsx
    │   ├── components/ui/           # button, input, card
    │   ├── lib/utils.js
    │   ├── index.css
    │   └── main.jsx
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── vite.config.js
    └── .env.example
```

## 1. Pré-requisitos

- [Ollama](https://ollama.com) instalado e rodando localmente
- Um modelo baixado, por exemplo:
  ```bash
  ollama pull llama3.1
  ```
- Python 3.10+
- Node.js 18+

## 2. Rodando o back-end

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # ajuste o modelo/URL do Ollama se precisar
uvicorn main:app --reload --port 8000
```

A API sobe em `http://localhost:8000`. Endpoints:
- `GET /health` — checa se o servidor e o Ollama estão de pé
- `POST /chat` — resposta completa (sem streaming)
- `POST /chat/stream` — resposta em streaming (SSE), usada pelo front-end

## 3. Rodando o front-end

```bash
cd frontend
npm install
cp .env.example .env            # ajuste VITE_API_URL se o back-end estiver em outra porta/host
npm run dev
```

Acesse `http://localhost:5173`.

## 4. Personalização

- **Modelo do Ollama**: troque `OLLAMA_MODEL` no `.env` do back-end (ex.: `llama3.1`, `mistral`, `gemma2`, etc.)
- **Personalidade do bot**: edite `SYSTEM_PROMPT` em `backend/main.py`
- **Cores/tema**: ajuste as variáveis HSL em `frontend/src/index.css` (seção `:root`) e os gradientes `from-indigo-500 to-violet-600` usados nos componentes
- **Sem streaming**: se preferir respostas completas (sem efeito de digitação), troque a chamada do front-end de `/chat/stream` para `/chat`

## Observações

- O CORS no back-end está liberado para `*` apenas para facilitar o desenvolvimento local. Em produção, é necessário restringir para a origem real do seu front-end.
- Se aparecer erro de conexão no chat, confira se o Ollama está rodando (`ollama list` para ver os modelos instalados) e se o back-end está acessível na porta configurada.

---

# Chatbot · Ollama + LangChain + React (English)

Development of a full-stack chatbot that runs entirely locally, without relying on paid external APIs. The back-end was built in Python, using FastAPI for the API, LangChain to structure the conversations, and Ollama to run the language model directly on the machine. Responses arrive via streaming, and the chatbot keeps the conversation history to provide context-aware answers.

On the front-end, the interface was built with React and Tailwind CSS, with components inspired by shadcn/ui, aiming for a clean and responsive experience.

The assistant was also configured to respond to messages in other languages.
## Structure

```
chatbot-ollama/
├── backend/
│   ├── main.py            # FastAPI + LangChain + Ollama API
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── App.jsx                  # Main chat screen
    │   ├── components/ChatMessage.jsx
    │   ├── components/ui/           # button, input, card
    │   ├── lib/utils.js
    │   ├── index.css
    │   └── main.jsx
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── vite.config.js
    └── .env.example
```

## 1. Prerequisites

- [Ollama](https://ollama.com) installed and running locally
- A downloaded model, for example:
  ```bash
  ollama pull llama3.1
  ```
- Python 3.10+
- Node.js 18+

## 2. Running the back-end

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # Adjust the model/Ollama URL if needed
uvicorn main:app --reload --port 8000
```

The API will start at `http://localhost:8000`. Endpoints:
- `GET /health` — Checks if the server and Ollama are up
- `POST /chat` — Full response (no streaming)
- `POST /chat/stream` — Streaming response (SSE), used by the front-end

## 3. Running the front-end

```bash
cd frontend
npm install
cp .env.example .env            # Adjust VITE_API_URL if the back-end is on another port/host
npm run dev
```

Access `http://localhost:5173`.

## 4. Customization

- **Ollama Model**: Change `OLLAMA_MODEL` in the back-end's `.env` (e.g., `llama3.1`, `mistral`, `gemma2`, etc.)
- **Bot Personality**: Edit `SYSTEM_PROMPT` in `backend/main.py`
- **Colors/Theme**: Adjust the HSL variables in `frontend/src/index.css` (`:root` section) and the gradients `from-indigo-500 to-violet-600` used in the components
- **Without Streaming**: If you prefer complete responses (no typing effect), change the front-end call from `/chat/stream` to `/chat`

## Notes

- CORS on the back-end is set to `*` only to facilitate local development. In production, restrict it to your front-end's actual origin.
- If a connection error occurs in the chat, check if Ollama is running (`ollama list` to see installed models) and if the back-end is accessible on the configured port.

