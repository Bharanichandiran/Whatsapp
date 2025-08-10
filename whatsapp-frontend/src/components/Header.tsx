import React from 'react';

export const Header: React.FC = () => {
  return (
    <>
    <div className="w-full px-4 py-2 mb-4 flex items-center gap-2 bg-white shadow-sm">
      <img src="/whatsapp-icon.svg" alt="WhatsApp Logo" className="w-6 h-6" />
      <span className="text-sm font-semibold text-gray-800">WhatsApp</span>
    </div>
    </>
  );
};
