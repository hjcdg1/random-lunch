import React, { useState, useEffect } from 'react';
import type { Assignment, Member } from '../../../shared/types';
import GroupCard from './GroupCard';
import AlertDialog from '../common/AlertDialog';

type Step = 'select' | 'assigning' | 'result';

export default function NewAssignmentPage() {
  const [step, setStep] = useState<Step>('select');
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Assignment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState({ title: '', message: '' });
  const [departmentName, setDepartmentName] = useState<string>('');

  useEffect(() => {
    // Load current department name from settings
    window.electron
      .loadSettings()
      .then(settings => {
        setDepartmentName(settings.departmentName);
      })
      .catch(error => {
        console.error('Failed to load settings:', error);
      });
  }, []);

  const handleFetchMembers = async () => {
    setLoading(true);
    setError(null);

    try {
      const fetchedMembers = await window.electron.fetchMembers();
      // nickname 기준 사전순 정렬
      const sortedMembers = [...fetchedMembers].sort((a, b) =>
        a.nickname.localeCompare(b.nickname)
      );
      setMembers(sortedMembers);
      // 기본적으로 모두 선택
      setSelectedIds(new Set(sortedMembers.map(m => m.id)));
      setStep('select');
    } catch (err) {
      console.error('Failed to fetch members:', err);
      setError(err instanceof Error ? err.message : '구성원 목록을 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMember = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleToggleAll = () => {
    if (selectedIds.size === members.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(members.map(m => m.id)));
    }
  };

  const handleCreateAssignment = async () => {
    if (selectedIds.size === 0) {
      setAlertMessage({
        title: '선택 오류',
        message: '최소 1명 이상 선택해주세요.',
      });
      setAlertOpen(true);
      return;
    }

    setStep('assigning');
    setError(null);

    try {
      const memberIdsArray = Array.from(selectedIds);
      console.log('Creating assignment for members:', memberIdsArray);

      const assignment = await window.electron.createAssignment(memberIdsArray);
      console.log('Assignment created:', assignment);

      setResult(assignment);
      setStep('result');
    } catch (err) {
      console.error('Failed to create assignment:', err);
      setError(err instanceof Error ? err.message : '조 편성 생성에 실패했습니다.');
      setStep('select');
    }
  };

  const handleReset = () => {
    setStep('select');
    setMembers([]);
    setSelectedIds(new Set());
    setResult(null);
    setError(null);
  };

  const generateSlackText = (): string => {
    if (!result) return '';

    const lines = result.groups.map((group, idx) => {
      const groupNumber = idx + 1;
      const memberNames = group.members.map((memberId, memberIdx) => {
        const member = members.find(m => m.id === memberId);
        const displayName = member ? `@${member.nickname}` : String(memberId);
        if (memberIdx === 0) {
          return `${displayName} (스레드 오픈 담당)`;
        }
        return displayName;
      });
      return `• ${groupNumber}조: ${memberNames.join(', ')}`;
    });

    return lines.join('\n');
  };

  const handleCopyToClipboard = async () => {
    const text = generateSlackText();
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

  return (
    <div className="p-8 min-w-[900px]">
      <h1 className="text-3xl font-bold mb-6">새로운 조 편성</h1>

      {/* 초기 상태: 당근 구성원 불러오기 버튼 */}
      {step === 'select' && members.length === 0 && (
        <div className="w-full">
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            당근 eHR에서 구성원 목록을 불러온 후, 참여할 구성원을 선택하여 조를 편성합니다.
          </p>
          {departmentName && (
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 border border-border rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                현재 적용된 부서명 필터:{' '}
                <span className="font-semibold text-primary">{departmentName}</span>
              </span>
            </div>
          )}
          <button
            onClick={handleFetchMembers}
            disabled={loading}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? '불러오는 중...' : '당근 구성원 목록 불러오기'}
          </button>
        </div>
      )}

      {/* 에러 표시 */}
      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-6 mt-6">
          {error}
        </div>
      )}

      {/* Step 1: 구성원 선택 */}
      {step === 'select' && members.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-600 dark:text-gray-300">
                총 {members.length}명 중 {selectedIds.size}명 선택됨
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleToggleAll}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm"
              >
                {selectedIds.size === members.length ? '전체 해제' : '전체 선택'}
              </button>
              <button
                onClick={handleCreateAssignment}
                disabled={selectedIds.size === 0}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 text-sm"
              >
                조 편성하기
              </button>
            </div>
          </div>

          {/* 구성원 카드 그리드 */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 min-h-[400px] p-1">
            {members.map(member => {
              const isSelected = selectedIds.has(member.id);
              return (
                <div
                  key={member.id}
                  onClick={() => handleToggleMember(member.id)}
                  className={`
                    relative p-3 rounded-lg border-2 cursor-pointer transition-all
                    ${
                      isSelected
                        ? 'border-primary bg-primary/10 dark:bg-primary/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }
                  `}
                >
                  {/* 체크박스 */}
                  <div className="absolute top-2 right-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleMember(member.id)}
                      onClick={e => e.stopPropagation()}
                      className="w-4 h-4"
                    />
                  </div>

                  {/* 이름 (닉네임 (본명)) */}
                  <div className="pr-6">
                    <p
                      className="text-sm font-medium truncate"
                      title={`${member.nickname} (${member.realName})`}
                    >
                      {member.nickname} ({member.realName})
                    </p>
                  </div>

                  {/* 부서 */}
                  <p
                    className="text-xs text-gray-500 dark:text-gray-500 mt-1 truncate"
                    title={member.department}
                  >
                    {member.department}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 2: 조 편성 중 */}
      {step === 'assigning' && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mb-4"></div>
          <p className="text-lg font-medium">조 편성 중...</p>
          <p className="text-sm text-gray-500 mt-2">
            Simulated Annealing 알고리즘으로 최적의 조를 찾고 있습니다.
          </p>
        </div>
      )}

      {/* Step 3: 결과 표시 */}
      {step === 'result' && result && (
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
            {result.groups.map((group, idx) => (
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
              {generateSlackText()}
            </pre>
          </div>
        </div>
      )}

      {/* Dialog */}
      <AlertDialog
        isOpen={alertOpen}
        title={alertMessage.title}
        message={alertMessage.message}
        onConfirm={() => setAlertOpen(false)}
      />
    </div>
  );
}
