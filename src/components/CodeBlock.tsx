import React, { useState, useEffect } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-markdown';
import { Copy, Check, Download, Play, Eye, EyeOff } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = 'typescript',
  showLineNumbers = true,
}) => {
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const cleanLang = (language || 'typescript').toLowerCase().trim();
  const validLang = Prism.languages[cleanLang] ? cleanLang : 'javascript';

  const highlightedHtml = React.useMemo(() => {
    try {
      const grammar = Prism.languages[validLang] || Prism.languages.javascript;
      return Prism.highlight(code, grammar, validLang);
    } catch {
      return code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
  }, [code, validLang]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const handleDownload = () => {
    const extMap: Record<string, string> = {
      typescript: 'ts',
      javascript: 'js',
      python: 'py',
      html: 'html',
      css: 'css',
      json: 'json',
      sql: 'sql',
      bash: 'sh',
      markdown: 'md',
    };
    const ext = extMap[cleanLang] || 'txt';
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bats-code-${Date.now()}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const canPreview = cleanLang === 'html' || cleanLang === 'svg';
  const lines = code.split('\n');

  return (
    <div className="my-3 rounded-xl border border-zinc-800 bg-[#0c0d12] overflow-hidden shadow-2xl transition-all">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/90 border-b border-zinc-800/80 text-xs text-zinc-400">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1.5 mr-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/70 inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70 inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70 inline-block"></span>
          </div>
          <span className="font-mono text-cyan-400 font-semibold uppercase tracking-wider text-[11px] px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-800/30">
            {cleanLang || 'code'}
          </span>
          <span className="text-zinc-500 text-[11px]">
            {lines.length} {lines.length === 1 ? 'line' : 'lines'}
          </span>
        </div>

        <div className="flex items-center space-x-1.5">
          {canPreview && (
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition text-[11px]"
              title={showPreview ? 'Hide Preview' : 'Live Preview'}
            >
              {showPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showPreview ? 'Code' : 'Preview'}</span>
            </button>
          )}

          <button
            onClick={handleDownload}
            className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition"
            title="Download code"
            aria-label="Download code"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition text-[11px] font-medium"
            title="Copy code to clipboard"
            aria-label="Copy code"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Body or Live Preview */}
      {showPreview && canPreview ? (
        <div className="p-4 bg-white text-zinc-900 rounded-b-xl min-h-[140px] overflow-auto">
          <div dangerouslySetInnerHTML={{ __html: code }} />
        </div>
      ) : (
        <div className="overflow-x-auto text-sm font-mono p-4 flex leading-relaxed">
          {showLineNumbers && (
            <div className="select-none text-right pr-4 text-zinc-600 font-mono text-xs border-r border-zinc-800/80 mr-4">
              {lines.map((_, i) => (
                <div key={i} className="leading-6">
                  {i + 1}
                </div>
              ))}
            </div>
          )}
          <pre className="flex-1 font-mono text-xs md:text-sm text-zinc-200 overflow-x-auto m-0 p-0 leading-6">
            <code
              className={`language-${validLang}`}
              dangerouslySetInnerHTML={{ __html: highlightedHtml }}
            />
          </pre>
        </div>
      )}
    </div>
  );
};
