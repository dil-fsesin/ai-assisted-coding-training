/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Todo } from '../types/Todo';

const STORAGE_KEY = 'todos';

/**
 * Runtime valiation to ensure parsed data conforms to the expected Todo[] shape.
 */
export function isValidTodos(data: unknown): data is Array<Partial<Todo>> {
  if (!Array.isArray(data)) return false;

  return data.every(
    item =>
      item &&
      typeof (item as any).id === 'string' &&
      typeof (item as any).title === 'string' &&
      typeof (item as any).completed === 'boolean'
  );
}

/**
 * Load persisted todos from sessionStorage.
 * Returns an empty array if nothing is stored or if data is corrupt.
 */
export function loadTodos(): Todo[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (isValidTodos(parsed)) {
      // Convert createdAt back to Date instance if present
      return (parsed as any).map((t: any) => ({
        ...t,
        createdAt: t.createdAt ? new Date(t.createdAt) : new Date(),
        description: t.description ?? '',
      })) as Todo[];
    }
  } catch (e) {
    console.warn('Failed to parse todos from sessionStorage. Clearing the stored value.', e);
  }
  // If we reach here data was invalid or parse failed – clear key and fall back to empty.
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
    // noop – removing can also throw if storage is unavailable, ignore.
  }
  return [];
}

/**
 * Persist todos to sessionStorage.
 * Throws QuotaExceededError so caller can react (e.g. show toast).
 */
export function saveTodos(todos: Todo[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch (e: any) {
    // Rethrow QuotaExceeded so higher-level logic can decide how to handle.
    if (e?.name === 'QuotaExceededError') {
      // swallow quota error – continue using in-memory state but notify caller via console
      console.warn('Storage quota exceeded – falling back to in-memory state.', e);
      return;
    }
    console.warn('Failed to save todos to sessionStorage', e);
  }
}
