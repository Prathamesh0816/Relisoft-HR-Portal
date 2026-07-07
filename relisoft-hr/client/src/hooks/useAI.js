import { useState, useCallback } from 'react';
import { aiAPI } from '../services/aiApi';
import toast from 'react-hot-toast';

export const useAIChat = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = useCallback(async (content) => {
    setLoading(true);
    const userMsg = { role: 'user', content, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    try {
      const { data } = await aiAPI.chat(content, messages.slice(-5));
      const aiMsg = { role: 'assistant', content: data.response, timestamp: new Date(), sources: data.sources };
      setMessages(prev => [...prev, aiMsg]);
      return data;
    } catch (error) {
      toast.error('AI service unavailable. Please try again.');
      setMessages(prev => [...prev, { role: 'assistant', content: 'I apologize, but I am currently unavailable. Please try again later.', timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  }, [messages]);

  const clearMessages = () => setMessages([]);

  return { messages, sendMessage, clearMessages, loading };
};

export const useAIInsights = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateInsights = useCallback(async (module, params) => {
    setLoading(true);
    try {
      const { data } = await aiAPI.getInsights(module, params);
      setInsights(data);
      return data;
    } catch (error) {
      toast.error('Failed to generate insights');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { insights, generateInsights, loading };
};

export const useResumeParser = () => {
  const [parsing, setParsing] = useState(false);

  const parseResume = useCallback(async (text, jobId) => {
    setParsing(true);
    try {
      const { data } = await aiAPI.parseResume(text, jobId);
      return data;
    } catch (error) {
      toast.error('Failed to parse resume');
      return null;
    } finally {
      setParsing(false);
    }
  }, []);

  return { parseResume, parsing };
};
