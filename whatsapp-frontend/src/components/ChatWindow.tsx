import React, { useState, useEffect, useRef } from "react";
import { Paperclip, Smile, Mic, Send, Video, Phone, Search, ArrowLeft, MoreVertical } from "lucide-react";


export interface Message {
  from: string;
  wa_id: string;
  id: string;
  text: string;
  timestamp: string;
  status?: "sent" | "delivered" | "read";
  sender: "me" | "them";
}

interface ChatWindowProps {
  messages: Message[];
  userName: string;
  userWaId: string;
  myWaId: string;
  onSendMessage: (text: string) => void;
  onBack?: () => void;
  isMobile?: boolean;
}

export default function ChatWindow({
  messages,
  userName,
  myWaId,
  onSendMessage,
  onBack,
  isMobile = false,
}: ChatWindowProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput("");
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

const defaultAvatar =
    "https://cdn-icons-png.flaticon.com/512/149/149071.png";
  // Deduplicate by `id` or fallback key
  const uniqueMessagesMap = new Map<string, Message>();
  messages.forEach((msg) => {
    uniqueMessagesMap.set(msg.id || `${msg.wa_id}-${msg.timestamp}`, msg);
  });
  const uniqueMessages = Array.from(uniqueMessagesMap.values());

  return (
    <div className={`flex flex-col flex-1 ${!isMobile ? 'border-l border-gray-300' : ''}`}>
      {/* Header */}
      <div className={`flex items-center justify-between ${isMobile ? 'p-3' : 'p-4'} border-b border-gray-300 bg-white`}>
        {/* Left: Back button (mobile) + Avatar + Name */}
        <div className="flex items-center space-x-3">
          {isMobile && onBack && (
            <button 
              onClick={onBack}
              className="text-gray-600 hover:text-gray-800 p-1"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <img
            src={defaultAvatar}       
            alt={userName}
            className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'} rounded-full object-cover`}
          />
          <div className="flex flex-col">
            <span className={`font-semibold ${isMobile ? 'text-base' : 'text-lg'}`}>{userName}</span>
            {isMobile && <span className="text-xs text-gray-500">online</span>}
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className={`flex items-center ${isMobile ? 'space-x-2' : 'space-x-4'}`}>
          {!isMobile && (
            <>
              <button className="text-gray-600 hover:text-gray-800">
                <Video size={22} />
              </button>
              <button className="text-gray-600 hover:text-gray-800">
                <Phone size={22} />
              </button>
              <button className="text-gray-600 hover:text-gray-800">
                <Search size={22} />
              </button>
            </>
          )}
          {isMobile && (
            <>
              <button className="text-gray-600 hover:text-gray-800 p-2">
                <Video size={20} />
              </button>
              <button className="text-gray-600 hover:text-gray-800 p-2">
                <Phone size={20} />
              </button>
              <button className="text-gray-600 hover:text-gray-800 p-2">
                <MoreVertical size={20} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className={`flex-1 ${isMobile ? 'p-3' : 'p-4'} overflow-y-auto space-y-3 bg-gray-50`}>
        {uniqueMessages.map((msg) => {
          const isMe =
            msg.wa_id === myWaId ||
            msg.from === myWaId ||
            msg.sender === "me";

          return (
            <div
              key={msg.id || `${msg.wa_id}-${msg.timestamp}`} // ✅ fallback
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`${isMobile ? 'max-w-[280px]' : 'max-w-xs'} px-4 py-2 rounded-lg ${
                  isMe
                    ? "bg-green-300 text-black rounded-br-none"
                    : "bg-white border border-gray-300 rounded-bl-none"
                }`}
              >
                <div>{msg.text}</div>
                <div className="text-xs text-gray-500 mt-1 text-right">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {isMe && msg.status && (
                    <span className="ml-2">
                      {msg.status === "sent" && "✓"}
                      {msg.status === "delivered" && "✓✓"}
                      {msg.status === "read" && (
                        <span className="text-blue-400">✓✓</span>
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className={`${isMobile ? 'p-2' : 'p-3'} border-t bg-white flex items-center space-x-2`}>
        {/* Emoji Button */}
        <button className={`${isMobile ? 'p-1' : 'p-2'} text-gray-500 hover:text-gray-700`}>
          <Smile size={isMobile ? 20 : 24} />
        </button>

        {/* Attachment Button */}
        <button className={`${isMobile ? 'p-1' : 'p-2'} text-gray-500 hover:text-gray-700`}>
          <Paperclip size={isMobile ? 20 : 24} />
        </button>

        {/* Text Input */}
        <input
          ref={inputRef}
          type="text"
          placeholder="Type a message"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className={`flex-1 bg-gray-100 rounded-full px-4 ${isMobile ? 'py-2 text-sm' : 'py-2'} outline-none focus:ring-2 focus:ring-green-500`}
        />

        {/* Mic or Send Button */}
        {input.trim() ? (
          <button
            onClick={handleSend}
            className={`${isMobile ? 'p-1' : 'p-2'} text-green-500 hover:text-green-600`}
          >
            <Send size={isMobile ? 20 : 24} />
          </button>
        ) : (
          <button className={`${isMobile ? 'p-1' : 'p-2'} text-gray-500 hover:text-gray-700`}>
            <Mic size={isMobile ? 20 : 24} />
          </button>
        )}
      </div>
    </div>
  );
}
