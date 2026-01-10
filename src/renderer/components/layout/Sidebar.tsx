import React from 'react';

interface SidebarProps {
  currentPage: 'history' | 'new' | 'settings';
  onNavigate: (page: 'history' | 'new' | 'settings') => void;
}

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const menuItems = [
    { id: 'new' as const, label: '새로운 조 편성', icon: '➕' },
    { id: 'history' as const, label: '조 편성 이력', icon: '📋' },
    { id: 'settings' as const, label: '설정', icon: '⚙️' },
  ];

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-bold">
          당근 랜덤 런치
          <br />조 편성기 🥕
        </h1>
      </div>

      <nav className="flex-1 p-4">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`
              w-full flex items-center gap-3 px-4 py-3 mb-2 rounded-lg
              text-left transition-colors
              ${
                currentPage === item.id
                  ? 'bg-primary text-white'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }
            `}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
