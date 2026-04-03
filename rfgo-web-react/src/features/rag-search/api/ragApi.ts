import axios from 'axios';

// The RAG Backend runs on 8001
const RAG_BASE_URL = 'http://localhost:8001';

export interface RagProductInfo {
  partid: string;
  name: string;
  design_rule: string;
  beol_option: string;
}

export interface RagSearchResult {
  content: string;
  id: number;
  table_name: string;
  rev_no: number;
  product_info: RagProductInfo;
  score: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const ragApi = {
  search: async (query: string, k: number = 5): Promise<RagSearchResult[]> => {
    const response = await axios.post(`${RAG_BASE_URL}/search`, {
      query,
      k
    });
    return response.data;
  },
  chat: async (messages: ChatMessage[]): Promise<{ role: string, content: string, tool_calls?: any[] }> => {
    const response = await axios.post(`${RAG_BASE_URL}/chat`, {
      messages
    });
    return response.data;
  }
};
