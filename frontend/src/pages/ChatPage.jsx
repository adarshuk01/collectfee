import { useEffect, useRef, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { Send, Bot, User, Loader2, ChevronLeft } from "lucide-react"; // Optional: npm install lucide-react
import { Link } from "react-router-dom";
import { formatDate } from "../utils/date";

export default function ChatPage() {
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content: "Hi 👋 How can I help you today?",
        },
    ]);
    const [hideSuggestions, setHideSuggestions] = useState(false);


    const suggestions = [
  "Total collection",
  "Pending fees",
  "Subscriptions expiring today",
  "Collection in February 2026",
];

    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    const sendSuggestion = async (text) => {
  if (loading) return;
  setInput("");
  setMessages((prev) => [...prev, { role: "user", content: text }]);
  setLoading(true);

  try {
    const res = await axiosInstance.post("/ai/chat", { message: text });
    console.log(res.data);
    
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        intent: res.data.intent,
        data: res.data.data,
        content: res.data.reply,
      },
    ]);
  } catch {
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: "❌ Connection error." },
    ]);
  } finally {
    setLoading(false);
  }
};


    const renderMessage = (msg) => {
        if (msg.role === "user")
            return <p className="text-sm leading-relaxed">{msg.content}</p>;

        if (!msg.intent)
            return <p className="text-sm leading-relaxed">{msg.content}</p>;

        switch (msg.intent) {
            case "TOTAL_COLLECTION":
                return (
                    <div className="min-w-[220px] space-y-3">
                        <div className="text-sm font-semibold text-gray-900 border-b border-gray-300 pb-2">
                            Collection Summary
                            <div className="text-xs font-normal text-gray-500">
                                {msg.data.period}
                            </div>
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Collected</span>
                                <span className="font-medium text-gray-900">
                                    ₹{msg.data.summary.collected}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-500">Pending</span>
                                <span className="font-medium text-gray-900">
                                    ₹{msg.data.summary.pendingDues}
                                </span>
                            </div>

                            <div className="flex justify-between border-t border-gray-300 pt-2">
                                <span className="text-gray-700 font-medium">Total</span>
                                <span className="font-semibold text-gray-900">
                                    ₹{msg.data.summary.totalRevenueExpected}
                                </span>
                            </div>
                        </div>
                    </div>
                );
case "PENDING_FEES":
case "EXPIRED_MEMBERS":
case "EXPIRING_SUBSCRIPTIONS": {
  const isExpiring = msg.intent === "EXPIRING_SUBSCRIPTIONS";
  const isExpired = msg.intent === "EXPIRED_MEMBERS";
  const isPending = msg.intent === "PENDING_FEES";

  const title = isExpired
    ? "Expired Members"
    : isExpiring
    ? "Expiring Subscriptions"
    : "Pending Fees";

  return (
    <div className="min-w-[260px] space-y-3">
      <div className="text-sm font-semibold text-gray-900 border-b border-gray-300 pb-2">
        {title}
      </div>

      {msg.data.length === 0 ? (
        <div className="text-sm text-gray-500">No records found</div>
      ) : (
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {msg.data.map((m, i) => (
            <div
              key={i}
              className="border border-gray-200 rounded-lg p-3 text-sm"
            >
              <div className="font-medium text-gray-900">{m.name}</div>

              <div className="text-xs text-gray-500 mt-1">{m.email}</div>

              <div className="mt-2 flex justify-between items-center">
                <span className="text-xs text-gray-400">
                  {isPending && `Due : ${formatDate(m.dueDate)}`}
                  {isExpiring && "Status"}
                  {isExpired && "Status"}
                </span>

                <span
                  className={`text-sm font-medium ${
                    isExpired
                      ? "text-red-600"
                      : isExpiring
                      ? "text-yellow-600"
                      : "text-gray-900"
                  }`}
                >
                  {isPending && `₹${m.dueAmount}`}
                  {(isExpiring || isExpired) && m.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

            default:
                return (
                    <p className="text-sm italic text-gray-500">
                        Data received, but no display configured.
                    </p>
                );
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
        <div className="flex flex-col h-[95vh]  bg-slate-50 ">
            {/* Header */}
            <header className="flex-none bg-white border-b border-gray-300 px-6 py-4 flex items-center justify-between shadow-sm z-10">
                <div className="flex items-center gap-3">
                    <Link to={'/'}>
                        <ChevronLeft />

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

                            <div className={`relative px-4 py-3 rounded-2xl shadow-sm text-sm ${msg.role === "user"
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

                {/* Suggestions */}
{!hideSuggestions &&  (
  <div className="max-w-4xl mx-auto mb-3 flex flex-wrap gap-2">
    {suggestions.map((q, i) => (
      <button
        key={i}
        onClick={() => sendSuggestion(q)}
        className="
          text-xs sm:text-sm
          px-3 py-1.5
          rounded-full
          border border-gray-200
          bg-gray-50
          text-gray-700
          hover:bg-gray-100
          hover:border-gray-300
          transition
          active:scale-95
        "
      >
        {q}
      </button>
    ))}
  </div>
)}

                <div className="max-w-4xl mx-auto flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                        placeholder="Ask about collections, dues, or expirations..."
                        className="
    flex-1 bg-gray-50 border border-gray-200 rounded-xl
    px-4 py-3
    text-base sm:text-sm
    focus:outline-none focus:ring-2 focus:ring-blue-500/20
    focus:border-blue-500 transition-all
    placeholder:text-gray-400
  "
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