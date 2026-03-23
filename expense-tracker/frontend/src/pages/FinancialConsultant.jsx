import React, { useState, useEffect, useRef } from "react";
import aiService from "../services/aiService";
import { Sparkles, Send, Loader2, User, Bot, Trash2, PlusCircle } from "lucide-react";

const FinancialConsultant = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await aiService.getHistory();
        if (res.data && res.data.length > 0) {
          setMessages(res.data);
        } else {
          setMessages([{ role: "bot", text: "Hello! I am Vance, your AI Financial Consultant. How can I help you today?" }]);
        }
      } catch (error) {
        console.error("Error fetching history", error);
        setMessages([{ role: "bot", text: "Hello! I am Vance, your AI Financial Consultant. How can I assist with your finances today?" }]);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleClearChat = async () => {
    if (window.confirm("Are you sure you want to delete all chat history? This cannot be undone.")) {
      try {
        await aiService.deleteHistory();
        setMessages([{ role: "bot", text: "History cleared. Hello! I am Vance, your AI Financial Consultant. How can I help you today?" }]);
      } catch (error) {
        console.error("Error clearing history", error);
      }
    }
  };

  const handleNewChat = async () => {
     // For 'New Chat', we actually treat it as clearing history to start fresh
     // or just resetting the frontend. Let's make it clear the DB history too
     await handleClearChat();
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: userMessage }]);
    setLoading(true);

    try {
      const response = await aiService.chat(userMessage);
      setMessages(prev => [...prev, { role: "bot", text: response.data.response }]);
    } catch (error) {
      console.error("Chat error", error);
      setMessages(prev => [...prev, { role: "bot", text: "I'm sorry, I'm having trouble connecting to my brain. Please try again later." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 flex items-center justify-between text-white shadow-md">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2.5 rounded-2xl">
            <Sparkles className="text-blue-600 w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-800 tracking-tight">Vance</h2>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">AI Consultant</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
            <button 
                onClick={handleNewChat}
                className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition"
                title="New Chat"
            >
                <PlusCircle className="w-5 h-5" />
            </button>
            <button 
                onClick={handleClearChat}
                className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition"
                title="Delete History"
            >
                <Trash2 className="w-5 h-5" />
            </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
        {initialLoading ? (
            <div className="flex items-center justify-center h-full gap-4 text-gray-400">
               <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
               <p className="font-bold">Retrieving conversation...</p>
            </div>
        ) : messages.map((msg, index) => (
          <div 
            key={index} 
            className={`flex items-start gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div className={`p-3 rounded-2xl shadow-sm border border-gray-100 ${msg.role === "user" ? "bg-blue-600 text-white" : "bg-white text-gray-800"}`}>
              {msg.role === "bot" ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
            </div>
            
            <div className={`max-w-[75%] p-4 rounded-3xl text-sm leading-relaxed shadow-sm font-medium ${
              msg.role === "user" 
                ? "bg-blue-600 text-white rounded-tr-none" 
                : "bg-white text-gray-700 rounded-tl-none border border-gray-100"
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100">
              <Bot className="w-5 h-5 text-blue-600 animate-pulse" />
            </div>
            <div className="bg-white p-4 rounded-3xl flex items-center gap-2 shadow-sm border border-gray-100">
               <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
               <p className="text-xs text-gray-500 font-bold">Thinking...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-6 bg-white border-t border-gray-50">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your budget, EMI, or advice..."
            className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-6 pr-16 outline-none focus:ring-2 focus:ring-blue-100 transition text-sm text-gray-800 placeholder-gray-400 font-medium"
          />
          <button 
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-2 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition disabled:opacity-50 shadow-lg shadow-blue-200"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
        <p className="text-[10px] text-gray-400 text-center mt-3 font-semibold uppercase tracking-widest">
          AI Consultant considers all your tracked data for context.
        </p>
      </div>
    </div>
  );
};

export default FinancialConsultant;
