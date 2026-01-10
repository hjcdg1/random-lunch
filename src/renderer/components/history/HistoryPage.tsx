import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import type { Assignment, Member } from '../../../shared/types';
import GroupCard from '../assignment/GroupCard';
import ConfirmDialog from '../common/ConfirmDialog';
import AlertDialog from '../common/AlertDialog';

export default function HistoryPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState({ title: '', message: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [assignmentsData, membersData] = await Promise.all([
        window.electron.loadAssignments(),
        window.electron.fetchMembers(),
      ]);
      setAssignments(assignmentsData);
      setMembers(membersData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAssignments = async () => {
    try {
      const data = await window.electron.loadAssignments();
      setAssignments(data);
    } catch (error) {
      console.error('Failed to load assignments:', error);
    }
  };

  const formatDate = (timestamp: number) => {
    return format(new Date(timestamp), 'yyyy년 M월 d일 HH:mm:ss');
  };

  const handleDeleteClick = (timestamp: number) => {
    setDeleteTarget(timestamp);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    setDeleteConfirmOpen(false);

    try {
      console.log('Deleting assignment:', deleteTarget);
      await window.electron.deleteAssignment(deleteTarget);
      console.log('Delete successful, reloading list...');
      await loadAssignments();
      if (selectedAssignment && selectedAssignment.timestamp === deleteTarget) {
        setSelectedAssignment(null);
      }
      setAlertMessage({ title: '삭제 완료', message: '삭제되었습니다.' });
      setAlertOpen(true);
    } catch (error) {
      console.error('Failed to delete assignment:', error);
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      setAlertMessage({
        title: '삭제 실패',
        message: `삭제에 실패했습니다.\n오류: ${errorMessage}`,
      });
      setAlertOpen(true);
    } finally {
      setDeleteTarget(null);
    }
  };

  const generateSlackText = (assignment: Assignment): string => {
    const lines = assignment.groups.map((group, idx) => {
      const groupNumber = idx + 1;
      const memberNames = group.members.map((memberId, memberIdx) => {
        const member = members.find(m => m.id === memberId);
        const displayName = member ? member.nickname : String(memberId);
        if (memberIdx === 0) {
          return `${displayName} (스레드 오픈 담당)`;
        }
        return displayName;
      });
      return `- ${groupNumber}조: ${memberNames.join(', ')}`;
    });

    return lines.join('\n');
  };

  const handleCopyToClipboard = async () => {
    if (!selectedAssignment) return;
    const text = generateSlackText(selectedAssignment);
    try {
      await navigator.clipboard.writeText(text);
      setAlertMessage({
        title: '복사 완료',
        message: '클립보드에 복사되었습니다!',
      });
      setAlertOpen(true);
    } catch (err) {
      console.error('Failed to copy:', err);
      setAlertMessage({
        title: '복사 실패',
        message: '복사에 실패했습니다.',
      });
      setAlertOpen(true);
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
              onClick={() => handleDeleteClick(selectedAssignment.timestamp)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              삭제
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
          {selectedAssignment.groups.map((group, idx) => (
            <GroupCard key={idx} group={group} groupNumber={idx + 1} members={members} />
          ))}
        </div>

        {/* Slack 공유용 텍스트 */}
        <div className="border border-border rounded-lg p-6 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Slack 공유용 텍스트</h3>
            <button
              onClick={handleCopyToClipboard}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity text-sm"
            >
              복사하기
            </button>
          </div>
          <pre className="text-sm bg-white dark:bg-gray-900 border border-border rounded p-4 overflow-x-auto whitespace-pre-wrap">
            {generateSlackText(selectedAssignment)}
          </pre>
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
                      handleDeleteClick(assignment.timestamp);
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

      {/* Dialogs */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        title="조 편성 이력 삭제"
        message="이 조 편성 이력을 삭제하시겠습니까?"
        confirmText="삭제"
        cancelText="취소"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setDeleteTarget(null);
        }}
      />
      <AlertDialog
        isOpen={alertOpen}
        title={alertMessage.title}
        message={alertMessage.message}
        onConfirm={() => setAlertOpen(false)}
      />
    </div>
  );
}
