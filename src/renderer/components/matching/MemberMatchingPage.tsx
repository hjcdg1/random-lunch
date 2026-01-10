import React, { useState, useEffect } from 'react';
import type { Member, EdgeWeightMap } from '../../../shared/types';

interface MatchingResult {
  member: Member;
  matchCount: number;
}

interface MemberSection {
  targetMember: Member;
  matches: MatchingResult[];
}

export default function MemberMatchingPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [edgeWeights, setEdgeWeights] = useState<EdgeWeightMap>({});
  const [searchNickname, setSearchNickname] = useState('');
  const [sections, setSections] = useState<MemberSection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [membersData, weightsData] = await Promise.all([
        window.electron.fetchMembers(),
        window.electron.loadEdgeWeights(),
      ]);
      setMembers(membersData);
      setEdgeWeights(weightsData);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError(err instanceof Error ? err.message : '데이터를 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchNickname.trim()) {
      setError('닉네임을 입력해주세요.');
      return;
    }

    // Find members matching the nickname
    const matchingMembers = members.filter(m =>
      m.nickname.toLowerCase().includes(searchNickname.toLowerCase())
    );

    if (matchingMembers.length === 0) {
      setError('해당 닉네임을 가진 구성원을 찾을 수 없습니다.');
      setSections([]);
      return;
    }

    // For each matching member, calculate their match counts with all other members
    const newSections: MemberSection[] = [];

    matchingMembers.forEach(targetMember => {
      const matchCounts: Map<number, number> = new Map();

      // Iterate through all edge weights
      Object.entries(edgeWeights).forEach(([edgeKey, weight]) => {
        const [id1, id2] = edgeKey.split('-').map(Number);

        // Check if this edge involves the target member
        if (id1 === targetMember.id) {
          matchCounts.set(id2, (matchCounts.get(id2) || 0) + weight);
        } else if (id2 === targetMember.id) {
          matchCounts.set(id1, (matchCounts.get(id1) || 0) + weight);
        }
      });

      // Convert to results and sort by match count
      const matches: MatchingResult[] = Array.from(matchCounts.entries())
        .map(([memberId, count]) => {
          const member = members.find(m => m.id === memberId);
          return member ? { member, matchCount: count } : null;
        })
        .filter((result): result is MatchingResult => result !== null)
        .sort((a, b) => b.matchCount - a.matchCount);

      newSections.push({ targetMember, matches });
    });

    setSections(newSections);
    setError(null);
  };

  return (
    <div className="p-8 min-w-[900px]">
      <h1 className="text-3xl font-bold mb-6">매칭 수 확인</h1>

      <p className="text-gray-600 dark:text-gray-300 mb-6">
        구성원의 닉네임을 입력하면 해당 구성원이 누구와 가장 많이 조 편성되었는지 확인할 수 있습니다.
      </p>

      {/* Search Box */}
      <div className="bg-card border border-border rounded-lg p-6 mb-6 max-w-2xl">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">구성원 닉네임</label>
            <input
              type="text"
              value={searchNickname}
              onChange={e => setSearchNickname(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="닉네임을 입력하세요"
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? '검색 중...' : '검색'}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-6 max-w-2xl">
          {error}
        </div>
      )}

      {/* Results */}
      {sections.length > 0 && (
        <div className="space-y-8">
          {sections.map((section, sectionIndex) => (
            <div key={section.targetMember.id}>
              <div className="mb-4">
                <h2 className="text-2xl font-semibold">
                  {section.targetMember.nickname} ({section.targetMember.realName})
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {section.targetMember.department} · 총 {section.matches.length}명과 매칭 이력 있음
                </p>
              </div>

              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold">순위</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">닉네임 (본명)</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">부서</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">매칭 횟수</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {section.matches.map((result, index) => (
                      <tr key={result.member.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-6 py-4 text-sm">{index + 1}</td>
                        <td className="px-6 py-4 text-sm font-medium">
                          {result.member.nickname} ({result.member.realName})
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                          {result.member.department}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="px-3 py-1 bg-primary/10 text-primary rounded-full font-semibold">
                            {result.matchCount}회
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && sections.length === 0 && searchNickname.trim() === '' && (
        <div className="text-center py-20">
          <p className="text-xl text-gray-500 dark:text-gray-400 mb-4">
            닉네임을 입력하고 검색해보세요.
          </p>
        </div>
      )}
    </div>
  );
}
