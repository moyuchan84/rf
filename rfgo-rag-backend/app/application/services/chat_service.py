import json
from typing import List, Dict, Any
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from app.core.config import settings
from app.infrastructure.vector_store import vector_store

class ChatService:
    def __init__(self):
        # Initialize LLM (OpenAI Compatible for Ollama/GPT-OSS)
        self.llm = ChatOpenAI(
            model=settings.LLM_MODEL,
            api_key=settings.OPENAI_API_KEY,
            base_url=settings.OPENAI_BASE_URL,
            temperature=0
        )
        
        self.system_prompt = (
            "당신은 삼성전자 반도체 Photo-Key 분석 전문가입니다. "
            "제공된 데이터베이스 컨텍스트를 바탕으로 정확한 기술 정보를 제공해야 합니다. "
            "\n\n규칙:"
            "\n1. 모든 답변은 반드시 **한국어**로 작성하세요."
            "\n2. 컨텍스트가 제공되면 이를 활용하여 정밀하게 답변하세요."
            "\n3. 좌표 데이터나 비교 정보는 반드시 마크다운 **표(TABLE)** 형식을 사용하여 정리하세요."
            "\n4. 제공된 정보가 부족하여 답변이 어려울 경우, 사용자에게 추가 정보를 요청하세요."
            "\n5. 전문적이고 친절한 톤을 유지하세요."
        )

    async def _should_search(self, last_message: str) -> bool:
        """
        Simple heuristic to decide if we need to search the database.
        You can make this smarter by using a small LLM call as a router.
        """
        keywords = ["@", "data", "search", "find", "key", "table", "align", "overlay", "product", "part"]
        message_lower = last_message.lower()
        return any(k in message_lower for k in keywords)

    async def chat(self, messages: List[Dict[str, str]]):
        user_query = messages[-1]["content"]
        
        # 1. Decision: Should we retrieve data?
        context = ""
        retrieved_results = []
        
        if await self._should_search(user_query):
            print(f"RAG: Searching database for: {user_query}")
            # Remove '@' or specific markers if present for cleaner search
            clean_query = user_query.replace("@data", "").replace("@", "").strip()
            retrieved_results = await vector_store.similarity_search(clean_query, k=5)
            
            if retrieved_results:
                context = "\n\n--- DATABASE CONTEXT ---\n"
                for res in retrieved_results:
                    context += f"[Source: {res['table_name']}, Product: {res['product_info']['name']}]\n"
                    context += f"{res['content']}\n---\n"
        
        # 2. Build Final Prompt with Context
        langchain_messages = [SystemMessage(content=self.system_prompt)]
        
        # Add history (excluding the very last one which we will add with context)
        for m in messages[:-1]:
            if m["role"] == "user":
                langchain_messages.append(HumanMessage(content=m["content"]))
            else:
                langchain_messages.append(AIMessage(content=m["content"]))
        
        # Add last user message with injected context
        final_user_content = user_query
        if context:
            final_user_content = f"User Query: {user_query}\n\nPlease use the following retrieved information to answer:\n{context}"
        
        langchain_messages.append(HumanMessage(content=final_user_content))

        # 3. Generate Response
        response = await self.llm.ainvoke(langchain_messages)
        
        return {
            "role": "assistant",
            "content": response.content,
            "references": retrieved_results if retrieved_results else None
        }

chat_service = ChatService()
