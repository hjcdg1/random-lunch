import React from 'react';
import type { Group } from '../../../shared/types';

interface GroupCardProps {
  group: Group;
  groupNumber: number;
}

export default function GroupCard({ group, groupNumber }: GroupCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">{groupNumber}조</h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">{group.members.length}명</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {group.members.map(memberId => (
          <div
            key={memberId}
            className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
          >
            {memberId}
          </div>
        ))}
      </div>
    </div>
  );
}
