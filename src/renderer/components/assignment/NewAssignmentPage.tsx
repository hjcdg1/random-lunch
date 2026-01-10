import React, { useState } from 'react';
import type { Assignment } from '../../../shared/types';
import GroupCard from './GroupCard';

export default function NewAssignmentPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Assignment | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCreateAssignment = async () => {
    setLoading(true);
    setError(null);

    try {
      // 임시: 1-100 중 랜덤 90명 선택
      const allIds = Array.from({ length: 100 }, (_, i) => i + 1);
      const selectedIds = allIds.sort(() => Math.random() - 0.5).slice(0, 90);

      console.log('Creating assignment for members:', selectedIds);

      const assignment = await window.electron.createAssignment(selectedIds);
      console.log('Assignment created:', assignment);

      setResult(assignment);
    } catch (err) {
      console.error('Failed to create assignment:', err);
      setError(err instanceof Error ? err.message : '조 편성 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="p-8 min-w-[900px]">
      <h1 className="text-3xl font-bold mb-6">새로운 조 편성</h1>

      {!result && !loading && (
        <div className="max-w-2xl">
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            랜덤으로 조를 편성합니다. 과거 조 편성 이력을 기반으로, 최대한 새로운 사람과 만날 수
            있도록 편성해요.
          </p>
          <button
            onClick={handleCreateAssignment}
            disabled={loading}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            조 편성하기
          </button>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mb-4"></div>
          <p className="text-lg font-medium">조 편성 중...</p>
          <p className="text-sm text-gray-500 mt-2">
            Simulated Annealing 알고리즘으로 최적의 조를 찾고 있습니다.
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-6">
          <strong className="font-bold">오류: </strong>
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">편성 완료</h2>
              <p className="text-gray-600 dark:text-gray-300">
                {result.participatingMembers.length}명 → {result.groups.length}개 조
              </p>
            </div>
            <button
              onClick={handleReset}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              다시 편성하기
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {result.groups.map((group, idx) => (
              <GroupCard key={idx} group={group} groupNumber={idx + 1} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
