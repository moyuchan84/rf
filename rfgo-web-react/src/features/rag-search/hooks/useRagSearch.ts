import { useRagStore } from '../store/useRagStore';
import { ragApi } from '../api/ragApi';

export const useRagSearch = () => {
  const { addMessage, setLoading, isLoading, messages } = useRagStore();

  const search = async (query: string) => {
    if (!query.trim()) return;

    // 1. Add User Message to UI
    const userMessage = { role: 'user' as const, content: query };
    addMessage(userMessage);

    setLoading(true);

    try {
      // 2. Build history for API
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      history.push(userMessage);

      // 3. Call Agentic Chat API
      const response = await ragApi.chat(history);

      // 4. Add Assistant Response
      addMessage({
        role: 'assistant',
        content: response.content,
        results: response.references // Map back to 'results' for UI display
      });
    } catch (error) {
      addMessage({
        role: 'assistant',
        content: "Sorry, I encountered an error while processing your request. Please check if the LLM server is active."
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return { search, isLoading };
};
