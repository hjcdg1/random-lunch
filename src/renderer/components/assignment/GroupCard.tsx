import React from 'react';
import type { Group, Member } from '../../../shared/types';

interface GroupCardProps {
  group: Group;
  groupNumber: number;
  members?: Member[];
}

export default function GroupCard({ group, groupNumber, members }: GroupCardProps) {
  const getMemberDisplay = (memberId: number): string => {
    if (!members) return String(memberId);
    const member = members.find(m => m.id === memberId);
    if (!member) return String(memberId);
    return `${member.nickname} (${member.realName})`;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">{groupNumber}조</h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">{group.members.length}명</span>
      </div>

      <div className="space-y-2">
        {group.members.map(memberId => (
          <div key={memberId} className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded text-sm">
            {getMemberDisplay(memberId)}
          </div>
        ))}
      </div>
    </div>
  );
}
