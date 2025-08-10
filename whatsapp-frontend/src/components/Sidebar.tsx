import React, { useState } from "react";
import { Search, Edit, MoreVertical } from "lucide-react";

export interface Conversation {
  wa_id: string;
  name: string;
  last_message: string;
  last_updated: string;
}

interface SidebarProps {
  conversations: Conversation[];
  selectedWaId: string | null;
  onSelect: (wa_id: string) => void;
  isMobile: boolean; 
}

export default function Sidebar({
  conversations,
  selectedWaId,
  onSelect,
  
}: SidebarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  function formatTimestamp(last_updated: string): string {
    const date = new Date(last_updated);
    const now = new Date();

    // If same day, show only time
    if (
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    ) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }

    // Else show short date
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  }

  return (
    <div className={`flex flex-col ${isMobile ? 'w-full' : 'w-[40%]'} h-full bg-white ${!isMobile ? 'border-r border-gray-200' : ''}`}>
      {/* Header */}
      {!isMobile && (
        <div className="px-4 py-3 flex items-center justify-between border-b border-gray-300">
          <h1 className="text-gray-800 text-lg font-semibold">Chats</h1>
          <div className="flex items-center space-x-3">
            <button className="text-gray-500 hover:text-black transition-colors">
              <Edit className="w-5 h-5" />
            </button>
            <button className="text-gray-500 hover:text-black transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Search bar */}
      <div className={`${isMobile ? 'px-4 py-3' : 'px-3 py-2'} bg-white border-b border-gray-200`}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search or start a chat"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full bg-gray-100 text-gray-900 pl-10 pr-4 ${isMobile ? 'py-3' : 'py-2'} rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500`}
          />
        </div>
      </div>

      {/* User list */}
      <div className="flex-1 overflow-y-auto bg-white">
        {conversations
          .filter((conv) =>
            conv.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map((conv) => (
            <div
              key={conv.wa_id}
              onClick={() => onSelect(conv.wa_id)}
              className={`cursor-pointer ${isMobile ? 'p-4' : 'p-4'} border-b border-gray-200 hover:bg-blue-50 active:bg-blue-100 transition-colors ${
                selectedWaId === conv.wa_id ? "bg-blue-100" : ""
              }`}
            >
              <div className="flex items-center space-x-3">
                {/* Avatar */}
                <img
                  src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
                  alt={conv.name}
                  className={`${isMobile ? 'w-12 h-12' : 'w-10 h-10'} rounded-full object-cover flex-shrink-0`}
                />
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <div className={`font-semibold ${isMobile ? 'text-base' : 'text-lg'} truncate`}>
                      {conv.name}
                    </div>
                    <small className="text-xs text-gray-400 flex-shrink-0 ml-2">
                      {formatTimestamp(conv.last_updated)}
                    </small>
                  </div>
                  <p className={`${isMobile ? 'text-sm' : 'text-sm'} text-gray-600 truncate mt-1`}>
                    {conv.last_message}
                  </p>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
