import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import type { ThemeMode } from '../../../shared/types';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [apiToken, setApiToken] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load API token from settings
    window.electron
      .loadSettings()
      .then(settings => {
        setApiToken(settings.apiToken);
      })
      .catch(error => {
        console.error('Failed to load settings:', error);
      });
  }, []);

  const handleThemeChange = async (newTheme: ThemeMode) => {
    try {
      await setTheme(newTheme);
    } catch (error) {
      console.error('Failed to change theme:', error);
    }
  };

  const handleSaveToken = async () => {
    setSaving(true);
    setSaved(false);

    try {
      await window.electron.saveSettings({ apiToken });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save API token:', error);
      alert('API 토큰 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 min-w-[900px]">
      <h1 className="text-3xl font-bold mb-8">설정</h1>

      <div className="space-y-8">
        {/* 테마 설정 */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">테마</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            애플리케이션의 테마를 설정합니다.
          </p>

          <div className="space-y-2">
            {[
              { value: 'system' as const, label: '시스템', desc: '시스템 설정을 따릅니다' },
              { value: 'light' as const, label: '라이트', desc: '밝은 테마' },
              { value: 'dark' as const, label: '다크', desc: '어두운 테마' },
            ].map(option => (
              <label
                key={option.value}
                className={`
                  flex items-center gap-4 p-4 rounded-lg border cursor-pointer
                  transition-colors
                  ${
                    theme === option.value
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:bg-gray-50 dark:hover:bg-gray-800'
                  }
                `}
              >
                <input
                  type="radio"
                  name="theme"
                  value={option.value}
                  checked={theme === option.value}
                  onChange={() => handleThemeChange(option.value)}
                  className="w-5 h-5 text-primary"
                />
                <div className="flex-1">
                  <div className="font-medium">{option.label}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{option.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* 당근 eHR 토큰 설정 */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">당근 eHR API 토큰</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            당근 eHR에서 구성원 목록을 불러올 때 사용하는 API 토큰입니다.
          </p>

          <div className="space-y-4">
            <input
              type="password"
              value={apiToken}
              onChange={e => setApiToken(e.target.value)}
              placeholder="당근 eHR API 토큰을 입력하세요"
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />

            <div className="flex items-center gap-3">
              <button
                onClick={handleSaveToken}
                disabled={saving}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {saving ? '저장 중...' : '저장'}
              </button>

              {saved && (
                <span className="text-green-600 dark:text-green-400 text-sm">✓ 저장되었습니다</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
