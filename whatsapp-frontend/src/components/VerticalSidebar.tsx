import React from "react";
import {
  MessageCircle,
  Phone,
  Circle,
  Star,
  Archive,
  Settings,
} from "lucide-react";
import { cn } from "./libs/utils";

interface NavItem {
  icon?: React.ReactNode;
  badge?: number;
  active?: boolean;
}

const VerticalSidebar: React.FC = () => {
  const navItems: NavItem[] = [
    { icon: <MessageCircle size={20} />, badge: 6, active: true },
    { icon: <Phone size={20} /> },
    { icon: <Circle size={20} className="text-green-500" /> },
    {}, // spacer
    { icon: <Star size={20} /> },
    { icon: <Archive size={20} />, badge: 5 },
    {}, // spacer
    { icon: <Settings size={20} /> },
  ];

  return (
    <div className="w-[60px] bg-white border-r flex flex-col items-center py-4 justify-between">
      {/* Top Logo Full Width */}
      

      {/* Main icons */}
      <div className="flex-1 flex flex-col gap-4 items-center">
        {navItems.map((item, index) =>
          !item.icon ? (
            <div key={index} className="h-4" /> // Spacer
          ) : (
            <div
              key={index}
              className={cn(
                "relative w-10 h-10 rounded-lg flex items-center justify-center hover:bg-gray-100 cursor-pointer",
                item.active && "bg-gray-200 border-l-4 border-green-600"
              )}
            >
              {item.icon}
              {item.badge && (
                <span className="absolute -top-1 -right-1 bg-green-500 text-white text-[10px] px-1 rounded-full">
                  {item.badge}
                </span>
              )}
            </div>
          )
        )}
      </div>

      {/* Profile pic */}
      <div className="mt-4">
        <img
          src="/logo192.png"
          alt="Profile"
          className="w-8 h-8 rounded-full border object-cover"
        />
      </div>
    </div>
  );
};

export default VerticalSidebar;
