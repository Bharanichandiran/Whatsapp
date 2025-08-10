import React, { useEffect, useState } from "react";
import axios from "axios";

import Sidebar, { Conversation } from "./components/Sidebar";
import ChatWindow, { Message } from "./components/ChatWindow";
import VerticalSidebar from "./components/VerticalSidebar";

const BASE_URL = "http://localhost:4000/api/chats";

function App() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedWaId, setSelectedWaId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedName, setSelectedName] = useState<string>("");
  const [isMobile, setIsMobile] = useState(false);
  const [showChat, setShowChat] = useState(false);

  // Check if mobile view
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // On desktop, always show chat if conversation is selected
      if (!mobile && selectedWaId) {
        setShowChat(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [selectedWaId]);

  // Load conversations on mount
  useEffect(() => {
    async function fetchConversations() {
      try {
        const res = await axios.get(`${BASE_URL}/chats`);
        setConversations(res.data);

        if (res.data.length > 0 && !isMobile) {
          setSelectedWaId(res.data[0].wa_id);
          setSelectedName(res.data[0].name);
          setShowChat(true);
        }
      } catch (error) {
        console.error("Failed to fetch conversations", error);
      }
    }
    fetchConversations();
  }, [isMobile]);

  // Load messages when selectedWaId changes
  useEffect(() => {
    if (!selectedWaId) return;

    async function fetchMessages() {
      try {
        const res = await axios.get(`${BASE_URL}/messages?wa_id=${selectedWaId}`);
        setMessages(res.data);
      } catch (error) {
        console.error("Failed to fetch messages", error);
      }
    }

    fetchMessages();

    // Update selected user name
    const conv = conversations.find((c) => c.wa_id === selectedWaId);
    setSelectedName(conv ? conv.name : selectedWaId);
  }, [selectedWaId, conversations]);

  // Handle conversation selection
  const handleSelectConversation = (wa_id: string) => {
    setSelectedWaId(wa_id);
    if (isMobile) {
      setShowChat(true);
    }
  };

  // Handle back to conversations (mobile)
  const handleBackToConversations = () => {
    if (isMobile) {
      setShowChat(false);
    }
  };

  // Send message handler
  async function sendMessage(text: string) {
    if (!selectedWaId) return;

    try {
      await axios.post(`${BASE_URL}/messages`, { wa_id: selectedWaId, text });

      // Optimistic UI update
      setMessages((prev) => [
        ...prev,
        {
          id: `temp-${Date.now()}`,
          text,
          timestamp: new Date().toISOString(),
          status: "sent",
          sender: "me",
          from: "918329446654",
          wa_id: "918329446654",
        },
      ]);
    } catch (error) {
      console.error("Failed to send message", error);
    }
  }

  // Mobile layout
  if (isMobile) {
    return (
      <div className="flex h-screen font-sans bg-gray-100">
        {!showChat ? (
          // Show conversations list on mobile
          <Sidebar
            conversations={conversations}
            selectedWaId={selectedWaId}
            onSelect={handleSelectConversation}
            isMobile={true}
          />
        ) : (
          // Show chat window on mobile
          selectedWaId && (
            <ChatWindow
              messages={messages}
              userName={selectedName}
              userWaId={selectedWaId}
              myWaId="918329446654"
              onSendMessage={sendMessage}
              onBack={handleBackToConversations}
              isMobile={true}
            />
          )
        )}
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="flex h-screen font-sans">
      <VerticalSidebar />
      <Sidebar
        conversations={conversations}
        selectedWaId={selectedWaId}
        onSelect={handleSelectConversation}
        isMobile={false}
      />
      {selectedWaId ? (
        <ChatWindow
          messages={messages}
          userName={selectedName}
          userWaId={selectedWaId}
          myWaId="918329446654"
          onSendMessage={sendMessage}
          isMobile={false}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          Select a conversation to start
        </div>
      )}
    </div>
  );
}

export default App;
