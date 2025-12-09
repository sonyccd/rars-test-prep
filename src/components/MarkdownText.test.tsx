import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MarkdownText } from './MarkdownText';

describe('MarkdownText', () => {
  it('renders plain text correctly', () => {
    const { getByText } = render(<MarkdownText text="Hello world" />);
    expect(getByText('Hello world')).toBeInTheDocument();
  });

  it('renders bold text correctly', () => {
    const { getByText } = render(<MarkdownText text="This is **bold** text" />);
    const boldElement = getByText('bold');
    expect(boldElement.tagName).toBe('STRONG');
  });

  it('renders italic text correctly', () => {
    const { getByText } = render(<MarkdownText text="This is *italic* text" />);
    const italicElement = getByText('italic');
    expect(italicElement.tagName).toBe('EM');
  });

  it('renders inline code correctly', () => {
    const { getByText } = render(<MarkdownText text="Use `const` keyword" />);
    const codeElement = getByText('const');
    expect(codeElement.tagName).toBe('CODE');
  });

  it('handles multiple formatting in one text', () => {
    const { getByText } = render(<MarkdownText text="**Bold** and *italic* and `code`" />);
    
    expect(getByText('Bold').tagName).toBe('STRONG');
    expect(getByText('italic').tagName).toBe('EM');
    expect(getByText('code').tagName).toBe('CODE');
  });

  it('handles line breaks', () => {
    const { container } = render(<MarkdownText text="Line 1\nLine 2" />);
    const paragraphs = container.querySelectorAll('p');
    expect(paragraphs.length).toBeGreaterThanOrEqual(1);
  });

  it('handles empty text', () => {
    const { container } = render(<MarkdownText text="" />);
    expect(container.textContent).toBe('');
  });

  it('renders text without formatting unchanged', () => {
    const { getByText } = render(<MarkdownText text="Plain text without any markdown" />);
    expect(getByText('Plain text without any markdown')).toBeInTheDocument();
  });
});
