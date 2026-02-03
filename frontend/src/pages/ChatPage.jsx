import { useEffect, useRef, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { Send, Bot, User, Loader2, ChevronLeft } from "lucide-react"; // Optional: npm install lucide-react
import { Link } from "react-router-dom";

export default function ChatPage() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi 👋 How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const renderMessage = (msg) => {
    if (msg.role === "user") return <p className="leading-relaxed">{msg.content}</p>;
    if (!msg.intent) return <p className="leading-relaxed">{msg.content}</p>;

    switch (msg.intent) {
      case "TOTAL_COLLECTION":
        return (
          <div className="space-y-3 min-w-[200px]">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-300">
              <span className="text-xl">📊</span>
              <span className="font-bold text-gray-800 underline decoration-blue-500">Collection – {msg.data.period}</span>
            </div>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex justify-between bg-green-50 p-2 rounded shadow-sm">
                <span className="text-green-700 font-medium">💰 Collected:</span>
                <span className="font-bold text-green-800">₹{msg.data.summary.collected}</span>
              </div>
              <div className="flex justify-between bg-red-50 p-2 rounded shadow-sm">
                <span className="text-red-700 font-medium">⏳ Pending:</span>
                <span className="font-bold text-red-800">₹{msg.data.summary.pendingDues}</span>
              </div>
              <div className="flex justify-between bg-blue-50 p-2 rounded shadow-sm border-t border-blue-100 mt-1">
                <span className="text-blue-700 font-medium font-bold">📈 Total:</span>
                <span className="font-bold text-blue-800">₹{msg.data.summary.totalRevenueExpected}</span>
              </div>
            </div>
          </div>
        );

      case "PENDING_FEES":
      case "EXPIRING_SUBSCRIPTIONS":
        const isExpiring = msg.intent === "EXPIRING_SUBSCRIPTIONS";
        return (
          <div className="space-y-3 min-w-60">
            <div className={`font-bold flex items-center gap-2 ${isExpiring ? "text-orange-600" : "text-blue-600"}`}>
              {isExpiring ? "⏰ Expiring Today" : "⏳ Pending Fees"}
            </div>
            {msg.data.length === 0 ? (
              <div className="italic text-gray-500">No records found.</div>
            ) : (
              <div className="max-h-60 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
                {msg.data.map((m, i) => (
                  <div key={i} className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm hover:border-blue-300 transition-colors">
                    <div className="font-bold text-gray-900">{m.name}</div>
                    <div className="text-[11px] text-gray-500 mt-1 space-y-0.5">
                      <div>📞 {m.contact}</div>
                      <div>📧 {m.email}</div>
                    </div>
                    <div className="mt-2 flex justify-between items-center border-t pt-2">
                      <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
                        {isExpiring ? "Status" : "Due Date"}
                      </span>
                      <span className={`font-bold text-sm ${isExpiring ? "text-orange-500" : "text-red-600"}`}>
                        {isExpiring ? m.status : `₹${m.dueAmount}`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return <div className="italic">🤖 Data received, but display logic missing.</div>;
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await axiosInstance.post("/ai/chat", { message: userMessage.content });
      setMessages((prev) => [...prev, {
        role: "assistant",
        intent: res.data.intent,
        data: res.data.data,
        content: res.data.reply
      }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: "assistant", content: "❌ Connection error." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen  bg-slate-50 ">
      {/* Header */}
      <header className="flex-none bg-white border-b border-gray-300 px-6 py-4 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-3">
            <Link to={'/'}>
            <ChevronLeft  />
            
            </Link>
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-md">
            <Bot size={24} />
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-900 uppercase tracking-tight">AI Financial Assistant</h1>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] text-gray-500 font-medium">Online & Ready</span>
            </div>
          </div>
        </div>
      </header>

      {/* Message Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth custom-scrollbar">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start animate-in fade-in slide-in-from-bottom-2"}`}>
            <div className={`flex gap-3 max-w-[85%] md:max-w-[70%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
              {/* Avatar Icons */}
              <div className={`flex-none w-8 h-8 rounded-full flex items-center justify-center text-white text-xs ${msg.role === "user" ? "bg-slate-700" : "bg-blue-300 text-blue-600"}`}>
                {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
              </div>
              
              <div className={`relative px-4 py-3 rounded-2xl shadow-sm text-sm ${
                  msg.role === "user" 
                  ? "bg-blue-600 text-white rounded-tr-none" 
                  : "bg-white border border-gray-200 text-gray-800 rounded-tl-none"
                }`}>
                {renderMessage(msg)}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start items-center gap-3 animate-pulse">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <Loader2 className="animate-spin" size={16} />
            </div>
            <div className="bg-gray-200 h-8 w-24 rounded-full"></div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <footer className="flex-none p-4 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto flex gap-2">
          <input
            autoFocus
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Ask about collections, dues, or expirations..."
            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md active:scale-95"
          >
            <Send size={20} />
          </button>
        </div>
      </footer>
    </div>
  );
}