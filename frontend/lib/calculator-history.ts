export type CalculatorHistoryRecord = {
  id: string;
  toolId: string;
  title: string;
  summary: string;
  badges?: string[];
  createdAt: string;
};

const STORAGE_KEY = 'free-calculator-history';
export const CALCULATOR_HISTORY_EVENT = 'calculator-history-updated';

export function loadCalculatorHistory(): CalculatorHistoryRecord[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CalculatorHistoryRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCalculatorHistory(records: CalculatorHistoryRecord[]) {
  if (typeof window === 'undefined') return;

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  window.dispatchEvent(new CustomEvent(CALCULATOR_HISTORY_EVENT, { detail: records }));
}

export function appendCalculatorHistory(
  payload: Omit<CalculatorHistoryRecord, 'id' | 'createdAt'>
) {
  const nextRecord: CalculatorHistoryRecord = {
    ...payload,
    id: `${payload.toolId}-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  const current = loadCalculatorHistory();
  const next = [nextRecord, ...current].slice(0, 12);
  saveCalculatorHistory(next);
}

export function removeCalculatorHistory(id: string) {
  const next = loadCalculatorHistory().filter((item) => item.id !== id);
  saveCalculatorHistory(next);
}

export function clearCalculatorHistory() {
  saveCalculatorHistory([]);
}
