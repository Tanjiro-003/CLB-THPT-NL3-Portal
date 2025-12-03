import React, { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { User } from '../types';

interface ChatWidgetProps {
  user: User | null;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{sender: string, text: string}[]>([
    { sender: 'Bot', text: 'Chào bạn! Mình có thể giúp gì cho bạn về các CLB?' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages([...messages, { sender: 'You', text: input }]);
    setInput('');
    // Mock auto-reply
    setTimeout(() => {
      setMessages(prev => [...prev, { sender: 'Bot', text: 'Cảm ơn bạn đã nhắn tin. Ban quản trị sẽ phản hồi sớm nhất!' }]);
    }, 1000);
  };

  return (
    <>
      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="fixed bottom-6 right-6 z-50 p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all transform hover:scale-110 flex items-center justify-center"
      >
        {isOpen ? <X className="w-6 h-6" /> : (
          <>
            <MessageCircle className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 bg-red-500 w-3 h-3 rounded-full animate-ping"></span>
          </>
        )}
      </button>

      {/* Chat Box */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col h-[400px]">
          <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
            <div>
              <h3 className="font-bold">Hỗ trợ trực tuyến</h3>
              <p className="text-xs text-blue-100">Luôn sẵn sàng giải đáp</p>
            </div>
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          </div>
          
          <div className="flex-grow p-4 overflow-y-auto bg-gray-50 space-y-3">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.sender === 'You' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${m.sender === 'You' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border text-gray-700 rounded-tl-none shadow-sm'}`}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSend} className="p-3 bg-white border-t flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập tin nhắn..." 
              className="flex-grow px-3 py-2 rounded-full bg-gray-100 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button type="submit" className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatWidget;