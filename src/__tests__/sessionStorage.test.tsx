import { describe, it, expect, afterEach, vi } from 'vitest';
import { loadTodos, saveTodos } from '../utils/sessionStorage';
import type { Todo } from '../types/Todo';

describe('sessionStorage helpers', () => {
  const KEY = 'todos';

  afterEach(() => {
    window.sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it('loadTodos returns persisted todos when valid', () => {
    const data: Todo[] = [
      { id: '1', title: 'a', description: '', completed: false, createdAt: new Date() },
    ];
    window.sessionStorage.setItem(KEY, JSON.stringify(data));
    const result = loadTodos();
    expect(result.length).toBe(1);
    expect(result[0].title).toBe('a');
  });

  it('loadTodos returns empty on corrupt data and clears key', () => {
    window.sessionStorage.setItem(KEY, '{invalid json');
    const result = loadTodos();
    expect(result).toEqual([]);
    expect(window.sessionStorage.getItem(KEY)).toBeNull();
  });

  it('saveTodos handles QuotaExceededError gracefully', () => {
    const data: Todo[] = [];
    const quotaError = Object.assign(new Error('quota exceeded'), { name: 'QuotaExceededError' });
    vi.spyOn(window.sessionStorage, 'setItem').mockImplementation(() => {
      throw quotaError;
    });
    // should NOT throw – handled internally
    expect(() => saveTodos(data)).not.toThrow();
  });
});
