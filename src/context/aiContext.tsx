// frontend/context/AIContext.tsx
import { createContext, useContext, useState, type ReactNode } from "react";
import { postChat } from "../services/ai";

interface AIContextType {
  ask: (prompt: string) => Promise<string>; // returns the AI response
  response: string;
  loading: boolean;
}

export const AIContext = createContext<AIContextType | undefined>(undefined);

export const AIProvider = ({ children }: { children: ReactNode }) => {
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const ask = async (prompt: string): Promise<string> => {
    setLoading(true);
    try {
      const res = await postChat(prompt); // call your backend
      setResponse(res);
      return res; // return the content so caller can use it
    } catch (err) {
      console.error("AI error:", err);
      const errorMessage = "Error contacting AI.";
      setResponse(errorMessage);
      return errorMessage; // return error message as fallback
    } finally {
      setLoading(false);
    }
  };

  return (
    <AIContext.Provider value={{ ask, response, loading }}>
      {children}
    </AIContext.Provider>
  );
};

export const useAI = (): AIContextType => {
  const context = useContext(AIContext);
  if (!context) throw new Error("useAI must be used within AIProvider");
  return context;
};