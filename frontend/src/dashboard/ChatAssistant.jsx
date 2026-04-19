import { useState } from "react";
import axios from "axios";

function ChatAssistant() {
  const [messages, setMessages] = useState([{ sender: 'ai', text: "Hello! I'm your Arogya AI Healthcare Assistant. Ask me anything about your symptoms or medical reports." }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const userMsg = input.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:3000/api/chat", { message: userMsg });
      setMessages(prev => [...prev, { sender: 'ai', text: res.data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { sender: 'ai', text: "Sorry, I am having trouble connecting to my servers right now." }]);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-[600px] bg-white/5 rounded-2xl border border-white/10 overflow-hidden shadow-[0_0_40px_rgba(31,188,249,0.1)]">
      <div className="bg-[#1FBCF9]/20 border-b border-white/10 p-4">
        <h2 className="text-xl font-bold flex items-center">
          <span className="text-[#1FBCF9] mr-2">✦</span> AI Chat Assistant
        </h2>
        <p className="text-sm text-gray-400">Ask health-related questions instantly.</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] p-4 rounded-2xl ${msg.sender === 'user' ? 'bg-[#1FBCF9] text-white rounded-br-none' : 'bg-white/10 text-gray-200 rounded-bl-none'}`}>
              <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/10 text-gray-200 p-4 rounded-2xl rounded-bl-none flex items-center space-x-2">
              <div className="w-2 h-2 bg-[#1FBCF9] rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-[#1FBCF9] rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-[#1FBCF9] rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-white/10 bg-black/20">
        <div className="flex space-x-4">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type your health queries here..."
            className="flex-1 bg-white/10 px-4 py-3 rounded-xl border border-white/20 focus:outline-none focus:border-[#1FBCF9] text-white"
          />
          <button 
            onClick={sendMessage}
            className="bg-[#1FBCF9] px-6 py-3 rounded-xl font-semibold hover:bg-[#15a0d6] transition flex items-center"
          >
            Send ➜
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatAssistant;
