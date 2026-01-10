import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import type { Assignment } from '../../../shared/types';
import GroupCard from '../assignment/GroupCard';

export default function HistoryPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    setLoading(true);
    try {
      const data = await window.electron.loadAssignments();
      setAssignments(data);
    } catch (error) {
      console.error('Failed to load assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return format(new Date(timestamp), 'yyyy년 M월 d일 HH:mm:ss');
  };

  const handleDelete = async (timestamp: number) => {
    if (!confirm('이 조 편성 이력을 삭제하시겠습니까?')) {
      return;
    }

    try {
      console.log('Deleting assignment:', timestamp);
      await window.electron.deleteAssignment(timestamp);
      console.log('Delete successful, reloading list...');
      await loadAssignments();
      if (selectedAssignment && selectedAssignment.timestamp === timestamp) {
        setSelectedAssignment(null);
      }
      alert('삭제되었습니다.');
    } catch (error) {
      console.error('Failed to delete assignment:', error);
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      alert(`삭제에 실패했습니다.\n오류: ${errorMessage}`);
    }
  };

  if (loading) {
    return (
      <div className="p-8 min-w-[900px]">
        <h1 className="text-3xl font-bold mb-6">조 편성 이력</h1>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (selectedAssignment) {
    return (
      <div className="p-8 min-w-[900px]">
        <div className="mb-6">
          <button
            onClick={() => setSelectedAssignment(null)}
            className="text-primary hover:underline mb-2"
          >
            ← 목록으로 돌아가기
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{formatDate(selectedAssignment.timestamp)}</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                {selectedAssignment.participatingMembers.length}명 →{' '}
                {selectedAssignment.groups.length}개 조
              </p>
            </div>
            <button
              onClick={() => handleDelete(selectedAssignment.timestamp)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              삭제
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {selectedAssignment.groups.map((group, idx) => (
            <GroupCard key={idx} group={group} groupNumber={idx + 1} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 min-w-[900px]">
      <h1 className="text-3xl font-bold mb-6">조 편성 이력</h1>

      {assignments.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-xl text-gray-500 dark:text-gray-400 mb-4">
            아직 조 편성 이력이 없습니다.
          </p>
          <p className="text-gray-400 dark:text-gray-500">"조 편성" 메뉴에서 조를 편성해보세요.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {assignments.map(assignment => (
            <div
              key={assignment.timestamp}
              className="bg-card border border-border rounded-lg p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div
                  onClick={() => setSelectedAssignment(assignment)}
                  className="flex-1 cursor-pointer"
                >
                  <h3 className="text-lg font-semibold">{formatDate(assignment.timestamp)}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {assignment.participatingMembers.length}명 → {assignment.groups.length}개 조
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      handleDelete(assignment.timestamp);
                    }}
                    className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                  >
                    삭제
                  </button>
                  <span className="text-gray-400">→</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
