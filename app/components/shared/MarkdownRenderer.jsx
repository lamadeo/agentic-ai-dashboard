import React from 'react';

/**
 * parseMarkdown - Simple markdown parser for AI-generated insights
 * Parses bold text (**text**) and returns structured paragraph data
 * @param {string} text - Markdown text to parse
 * @returns {Array} Array of paragraph objects with parsed parts
 */
export const parseMarkdown = (text) => {
  if (!text) return [];

  // Split into paragraphs
  const paragraphs = text.split('\n\n').filter(p => p.trim());

  return paragraphs.map((paragraph, idx) => {
    // Parse bold text: **text** -> <strong>text</strong>
    const parts = [];
    let match;
    const boldRegex = /\*\*(.*?)\*\*/g;
    let lastIndex = 0;

    while ((match = boldRegex.exec(paragraph)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push({ type: 'text', content: paragraph.slice(lastIndex, match.index) });
      }
      // Add bold text
      parts.push({ type: 'bold', content: match[1] });
      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < paragraph.length) {
      parts.push({ type: 'text', content: paragraph.slice(lastIndex) });
    }

    return { idx, parts: parts.length > 0 ? parts : [{ type: 'text', content: paragraph }] };
  });
};

/**
 * MarkdownRenderer - Renders parsed markdown with proper formatting
 * @param {Object} props
 * @param {string} props.text - Markdown text to render
 * @param {string} [props.className] - Optional CSS classes for container
 */
const MarkdownRenderer = ({ text, className = "" }) => {
  const paragraphs = parseMarkdown(text);

  return (
    <div className={className}>
      {paragraphs.map((paragraph) => (
        <p key={paragraph.idx} className="mb-2">
          {paragraph.parts.map((part, partIdx) =>
            part.type === 'bold' ? (
              <strong key={partIdx}>{part.content}</strong>
            ) : (
              <span key={partIdx}>{part.content}</span>
            )
          )}
        </p>
      ))}
    </div>
  );
};

export default MarkdownRenderer;
