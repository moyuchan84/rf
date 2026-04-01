import { useState } from 'react';
import { useRagStore } from '../store/useRagStore';
import { ragApi } from '../api/ragApi';

export const useRagSearch = () => {
  const { addMessage, setLoading, isLoading } = useRagStore();

  const search = async (query: string) => {
    if (!query.trim()) return;

    // 1. Add User Message
    addMessage({
      role: 'user',
      content: query
    });

    setLoading(true);

    try {
      // 2. Call API
      const results = await ragApi.search(query);

      // 3. Construct Assistant Response
      let responseContent = "I found some relevant information in the Photo-Key database:";
      if (results.length === 0) {
        responseContent = "I couldn't find any specific data matching your query in the current database.";
      }

      // 4. Add Assistant Message with references
      addMessage({
        role: 'assistant',
        content: responseContent,
        results
      });
    } catch (error) {
      addMessage({
        role: 'assistant',
        content: "Sorry, I encountered an error while searching the database. Please make sure the RAG Backend is running."
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return { search, isLoading };
};
