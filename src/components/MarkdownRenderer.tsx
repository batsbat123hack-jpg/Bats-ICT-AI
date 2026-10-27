import React from 'react';
import { CodeBlock } from './CodeBlock';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  // Parse code blocks with ```lang ... ```
  const parts = React.useMemo(() => {
    const segments: Array<{ type: 'text' | 'code'; text: string; language?: string }> = [];
    const codeBlockRegex = /```([a-zA-Z0-9_\-+]*)\n([\s\S]*?)```/g;

    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        segments.push({
          type: 'text',
          text: content.substring(lastIndex, match.index),
        });
      }

      segments.push({
        type: 'code',
        language: match[1]?.trim() || 'javascript',
        text: match[2],
      });

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      segments.push({
        type: 'text',
        text: content.substring(lastIndex),
      });
    }

    return segments;
  }, [content]);

  // Format regular markdown text (headers, bold, lists, inline code)
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // Headers
      if (line.startsWith('### ')) {
        return (
          <h3 key={idx} className="text-lg font-semibold text-zinc-100 mt-4 mb-2">
            {line.substring(4)}
          </h3>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h2 key={idx} className="text-xl font-bold text-zinc-50 mt-5 mb-2.5 border-b border-zinc-800 pb-1">
            {line.substring(3)}
          </h2>
        );
      }
      if (line.startsWith('# ')) {
        return (
          <h1 key={idx} className="text-2xl font-bold text-white mt-6 mb-3">
            {line.substring(2)}
          </h1>
        );
      }

      // Unordered list items
      if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        const itemText = line.trim().substring(2);
        return (
          <li key={idx} className="ml-4 list-disc text-zinc-300 my-1 leading-relaxed">
            {renderInlineMarkdown(itemText)}
          </li>
        );
      }

      // Ordered list items
      const numMatch = line.trim().match(/^(\d+)\.\s+(.*)$/);
      if (numMatch) {
        return (
          <li key={idx} className="ml-4 list-decimal text-zinc-300 my-1 leading-relaxed">
            {renderInlineMarkdown(numMatch[2])}
          </li>
        );
      }

      // Blockquote
      if (line.startsWith('> ')) {
        return (
          <blockquote key={idx} className="border-l-4 border-cyan-500/70 pl-3 my-2 text-zinc-400 italic">
            {renderInlineMarkdown(line.substring(2))}
          </blockquote>
        );
      }

      // Empty line / paragraph break
      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }

      // Standard paragraph
      return (
        <p key={idx} className="text-zinc-200 my-1.5 leading-relaxed">
          {renderInlineMarkdown(line)}
        </p>
      );
    });
  };

  // Helper for inline markdown: bold, italic, inline code `code`
  const renderInlineMarkdown = (line: string): React.ReactNode => {
    // Split by inline code `...`
    const parts = line.split(/(`[^`]+`)/g);

    return parts.map((part, i) => {
      if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
        return (
          <code
            key={i}
            className="px-1.5 py-0.5 rounded bg-zinc-800/90 text-cyan-300 font-mono text-xs border border-zinc-700/50"
          >
            {part.slice(1, -1)}
          </code>
        );
      }

      // Process bold **text**
      const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
      return (
        <span key={i}>
          {boldParts.map((bPart, j) => {
            if (bPart.startsWith('**') && bPart.endsWith('**') && bPart.length > 4) {
              return (
                <strong key={j} className="font-semibold text-zinc-100">
                  {bPart.slice(2, -2)}
                </strong>
              );
            }
            return bPart;
          })}
        </span>
      );
    });
  };

  return (
    <div className="markdown-content text-sm md:text-base leading-relaxed break-words">
      {parts.map((part, index) => {
        if (part.type === 'code') {
          return (
            <CodeBlock
              key={index}
              code={part.text}
              language={part.language || 'typescript'}
              showLineNumbers={true}
            />
          );
        }
        return <div key={index}>{renderFormattedText(part.text)}</div>;
      })}
    </div>
  );
};
