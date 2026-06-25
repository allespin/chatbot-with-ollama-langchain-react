"""
Chatbot backend usando FastAPI + LangChain + Ollama.

Como rodar:
    1. Instale e rode o Ollama localmente (https://ollama.com)
    2. Baixe um modelo, por exemplo:  ollama pull llama3.1
    3. pip install -r requirements.txt
    4. uvicorn main:app --reload --port 8000

Endpoints:
    POST /chat          -> envia uma mensagem e recebe a resposta completa
    POST /chat/stream    -> envia uma mensagem e recebe a resposta em streaming (SSE)
    GET  /health         -> verifica se o servidor e o Ollama estão de pé
"""

import json
import os
from typing import List, Literal

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_ollama import ChatOllama
from pydantic import BaseModel

load_dotenv()

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.1")

app = FastAPI(title="Chatbot Ollama + LangChain")

# Libera o front-end React (porta: 5173) para chamar a API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Prompt do sistema: definir aqui a personalidade do  chatbot
SYSTEM_PROMPT = (
    "Você é um assistente virtual simpático, direto e prestativo. "
    "Responda sempre no mesmo idioma em que a pergunta foi feita: "
    "se a pergunta for em português, responda em português; "
    "se for em inglês, responda em inglês; e assim por diante para outros idiomas. "
    "Seja claro e objetivo."
)

prompt_template = ChatPromptTemplate.from_messages(
    [
        ("system", SYSTEM_PROMPT),
        MessagesPlaceholder(variable_name="history"),
        ("human", "{input}"),
    ]
)

llm = ChatOllama(
    model=OLLAMA_MODEL,
    base_url=OLLAMA_BASE_URL,
    temperature=0.7,
)

chain = prompt_template | llm


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []


class ChatResponse(BaseModel):
    reply: str


def _history_to_langchain(history: List[ChatMessage]):
    """Converte o histórico vindo do front-end (JSON) para mensagens do LangChain."""
    converted = []
    for msg in history:
        if msg.role == "user":
            converted.append(HumanMessage(content=msg.content))
        else:
            converted.append(AIMessage(content=msg.content))
    return converted


@app.get("/health")
def health():
    return {"status": "ok", "model": OLLAMA_MODEL, "ollama_base_url": OLLAMA_BASE_URL}


@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="A mensagem não pode estar vazia.")

    try:
        result = chain.invoke(
            {
                "input": req.message,
                "history": _history_to_langchain(req.history),
            }
        )
        return ChatResponse(reply=result.content)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(
            status_code=500,
            detail=(
                "Erro ao falar com o Ollama. Verifique se o serviço está rodando "
                f"em {OLLAMA_BASE_URL} e se o modelo '{OLLAMA_MODEL}' foi baixado "
                f"(ollama pull {OLLAMA_MODEL}). Detalhe: {exc}"
            ),
        ) from exc


@app.post("/chat/stream")
def chat_stream(req: ChatRequest):
    
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="A mensagem não pode estar vazia.")

    def event_generator():
        try:
            for chunk in chain.stream(
                {
                    "input": req.message,
                    "history": _history_to_langchain(req.history),
                }
            ):
                token = getattr(chunk, "content", "")
                if token:
                    yield f"data: {json.dumps({'token': token})}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as exc:  # noqa: BLE001
            error_payload = json.dumps({"error": str(exc)})
            yield f"data: {error_payload}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
