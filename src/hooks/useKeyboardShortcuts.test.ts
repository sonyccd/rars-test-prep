import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKeyboardShortcuts, KeyboardShortcut } from './useKeyboardShortcuts';

describe('useKeyboardShortcuts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should call action when matching key is pressed', () => {
    const action = vi.fn();
    const shortcuts: KeyboardShortcut[] = [
      { key: 'a', description: 'Test', action },
    ];

    renderHook(() => useKeyboardShortcuts(shortcuts));

    const event = new KeyboardEvent('keydown', { key: 'a' });
    window.dispatchEvent(event);

    expect(action).toHaveBeenCalledTimes(1);
  });

  it('should not call action when shortcut is disabled', () => {
    const action = vi.fn();
    const shortcuts: KeyboardShortcut[] = [
      { key: 'a', description: 'Test', action, disabled: true },
    ];

    renderHook(() => useKeyboardShortcuts(shortcuts));

    const event = new KeyboardEvent('keydown', { key: 'a' });
    window.dispatchEvent(event);

    expect(action).not.toHaveBeenCalled();
  });

  it('should not trigger when hook is disabled via options', () => {
    const action = vi.fn();
    const shortcuts: KeyboardShortcut[] = [
      { key: 'a', description: 'Test', action },
    ];

    renderHook(() => useKeyboardShortcuts(shortcuts, { enabled: false }));

    const event = new KeyboardEvent('keydown', { key: 'a' });
    window.dispatchEvent(event);

    expect(action).not.toHaveBeenCalled();
  });

  it('should handle modifier keys correctly', () => {
    const action = vi.fn();
    const shortcuts: KeyboardShortcut[] = [
      { key: 's', description: 'Save', action, ctrlKey: true },
    ];

    renderHook(() => useKeyboardShortcuts(shortcuts));

    // Without ctrl - should not trigger
    const eventWithoutCtrl = new KeyboardEvent('keydown', { key: 's' });
    window.dispatchEvent(eventWithoutCtrl);
    expect(action).not.toHaveBeenCalled();

    // With ctrl - should trigger
    const eventWithCtrl = new KeyboardEvent('keydown', { key: 's', ctrlKey: true });
    window.dispatchEvent(eventWithCtrl);
    expect(action).toHaveBeenCalledTimes(1);
  });

  it('should be case-insensitive for key matching', () => {
    const action = vi.fn();
    const shortcuts: KeyboardShortcut[] = [
      { key: 'A', description: 'Test', action },
    ];

    renderHook(() => useKeyboardShortcuts(shortcuts));

    const event = new KeyboardEvent('keydown', { key: 'a' });
    window.dispatchEvent(event);

    expect(action).toHaveBeenCalledTimes(1);
  });

  it('should handle arrow keys', () => {
    const leftAction = vi.fn();
    const rightAction = vi.fn();
    const shortcuts: KeyboardShortcut[] = [
      { key: 'ArrowLeft', description: 'Previous', action: leftAction },
      { key: 'ArrowRight', description: 'Next', action: rightAction },
    ];

    renderHook(() => useKeyboardShortcuts(shortcuts));

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    expect(leftAction).toHaveBeenCalledTimes(1);

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    expect(rightAction).toHaveBeenCalledTimes(1);
  });

  it('should ignore events when typing in input fields', () => {
    const action = vi.fn();
    const shortcuts: KeyboardShortcut[] = [
      { key: 'a', description: 'Test', action },
    ];

    renderHook(() => useKeyboardShortcuts(shortcuts));

    // Create and dispatch event from an input element
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    const event = new KeyboardEvent('keydown', { key: 'a', bubbles: true });
    Object.defineProperty(event, 'target', { value: input, writable: false });
    window.dispatchEvent(event);

    expect(action).not.toHaveBeenCalled();

    document.body.removeChild(input);
  });
});
