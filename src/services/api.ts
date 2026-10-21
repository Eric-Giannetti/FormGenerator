import { Month, MonthGames } from '../types';

async function request<T>(path: string): Promise<T> {
  const response = await fetch(path);
  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: 'Não foi possível concluir a solicitação.' }));
    throw new Error(body.message);
  }
  return response.json() as Promise<T>;
}
export const getMonths = () => request<Month[]>('/api/months');
export const getMonthGames = (folderId: string) => request<MonthGames>(`/api/months/${encodeURIComponent(folderId)}/games`);

