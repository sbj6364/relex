import { useEffect, useState } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { PastePage } from '../pages/PastePage';
import { SettingsPage } from '../pages/SettingsPage';
import { TodayPage } from '../pages/TodayPage';
import { WeekPlannerPage } from '../pages/WeekPlannerPage';
import { loadFromStorage, saveToStorage } from '../lib/storage/localStorage';
import { defaultWorkRules } from '../lib/work/workRules';
import type { WorkRules } from '../types/work';

export type PageKey = 'today' | 'planner' | 'paste' | 'settings';
const rulesKey = 'relex:rules';

export function App() {
  const [page, setPage] = useState<PageKey>('today');
  const [rules, setRules] = useState<WorkRules>(() => loadFromStorage(rulesKey, defaultWorkRules));
  useEffect(() => saveToStorage(rulesKey, rules), [rules]);

  return <AppShell current={page} onChange={setPage}>{page === 'today' && <TodayPage rules={rules} />}{page === 'planner' && <WeekPlannerPage />}{page === 'paste' && <PastePage />}{page === 'settings' && <SettingsPage rules={rules} onChange={setRules} />}</AppShell>;
}
