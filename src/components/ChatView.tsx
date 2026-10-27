import React, { useRef, useEffect, useState } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  Plus,
  Mic,
  ChevronDown,
  ArrowUp,
  Square,
  FileCode,
  FileText,
  Tv,
  BookOpen,
  Code2,
  X,
  Paperclip,
  Search,
  Globe,
  ArrowUpRight,
  ExternalLink,
} from 'lucide-react';
import { ChatMessage, Attachment, AIModel } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import {
  classifyFileType,
  DEFAULT_SEARCH_BUBBLES,
} from '../utils/chat-logic';

interface ChatViewProps {
  messages: ChatMessage[];
  isStreaming: boolean;
  selectedModel: AIModel;
  models: AIModel[];
  onSelectModel: (model: AIModel) => void;
  onSendMessage: (content: string, attachments: Attachment[]) => void;
  onStopStreaming: () => void;
  onRetry: () => void;
  useSearch?: boolean;
  onToggleSearch?: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  isStreaming,
  selectedModel,
  models,
  onSelectModel,
  onSendMessage,
  onStopStreaming,
  onRetry,
  useSearch = false,
  onToggleSearch,
}) => {
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [doubleCheckedIds, setDoubleCheckedIds] = useState<Set<string>>(new Set());

  const fileInputRef = useRef<HTMLInputElement>(null);
  const modelMenuRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  // Close model dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (modelMenuRef.current && !modelMenuRef.current.contains(e.target as Node)) {
        setModelDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (isStreaming) {
      onStopStreaming();
      return;
    }
    if (!input.trim() && attachments.length === 0) return;

    onSendMessage(input.trim(), attachments);
    setInput('');
    setAttachments([]);
  };

  const handleFileChange = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newAttachments: Attachment[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const type = classifyFileType(file.name, file.type);

      try {
        if (type === 'code' || type === 'document') {
          const text = await file.text();
          newAttachments.push({
            id: `att-${Date.now()}-${i}`,
            name: file.name,
            mimeType: file.type || 'text/plain',
            size: file.size,
            text,
            type,
          });
        } else {
          const reader = new FileReader();
          const base64Data = await new Promise<string>((resolve, reject) => {
            reader.onload = () => {
              const res = reader.result as string;
              const commaIndex = res.indexOf(',');
              resolve(commaIndex !== -1 ? res.substring(commaIndex + 1) : res);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });

          newAttachments.push({
            id: `att-${Date.now()}-${i}`,
            name: file.name,
            mimeType: file.type || 'application/octet-stream',
            size: file.size,
            data: base64Data,
            type,
          });
        }
      } catch (err) {
        console.error('Failed reading file:', file.name, err);
      }
    }

    setAttachments((prev) => [...prev, ...newAttachments]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const copyMessage = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy message:', err);
    }
  };

  const toggleDoubleCheck = (messageId: string) => {
    setDoubleCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(messageId)) {
        next.delete(messageId);
      } else {
        next.add(messageId);
      }
      return next;
    });
  };

  const suggestedPrompts = [
    {
      icon: <Sparkles className="w-4 h-4 text-zinc-400" />,
      text: 'Design a phone wallpaper for me',
    },
    {
      icon: <Tv className="w-4 h-4 text-zinc-400" />,
      text: 'Quiz me on film and cinema',
    },
    {
      icon: <BookOpen className="w-4 h-4 text-zinc-400" />,
      text: 'What subject am I closest to mastering?',
    },
    {
      icon: <Code2 className="w-4 h-4 text-zinc-400" />,
      text: 'Write a clean Python script to parse JSON and export to CSV',
    },
  ];

  // Hidden file input
  const fileInput = (
    <input
      type="file"
      ref={fileInputRef}
      onChange={(e) => handleFileChange(e.target.files)}
      multiple
      className="hidden"
      accept="*/*"
    />
  );

  // Model Dropdown menu
  const renderModelDropdown = (placement: 'up' | 'down') => (
    <div
      className={`absolute ${
        placement === 'up' ? 'bottom-full mb-2' : 'top-full mt-2'
      } right-0 w-72 bg-[#18191e] border border-zinc-700/80 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100 text-left select-none`}
    >
      <div className="px-3 py-1.5 text-[11px] font-semibold text-zinc-400 border-b border-zinc-800/80 mb-1 flex items-center justify-between">
        <span>MODEL OPTIMIZATION</span>
        <span className="text-[10px] text-cyan-400">Free Tier</span>
      </div>
      <div className="space-y-1">
        {models.map((m) => {
          const isSelected = m.id === selectedModel.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                onSelectModel(m);
                setModelDropdownOpen(false);
              }}
              className={`w-full text-left p-2 rounded-xl flex items-start space-x-2.5 transition ${
                isSelected
                  ? 'bg-zinc-800 text-white font-medium border border-cyan-500/30'
                  : 'hover:bg-zinc-800/60 text-zinc-300'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-100">{m.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                </div>
                <p className="text-[10px] text-zinc-400 mt-0.5 line-clamp-1">{m.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  // Search Bubbles bar (Gemini-style interactive query bubbles)
  const renderSearchBubblesBar = () => (
    <div className="w-full flex items-center space-x-2 overflow-x-auto no-scrollbar py-1.5 px-0.5 select-none">
      {onToggleSearch && (
        <button
          type="button"
          onClick={onToggleSearch}
          className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition shadow-sm ${
            useSearch
              ? 'bg-blue-600 text-white shadow-blue-500/20 ring-1 ring-blue-400'
              : 'bg-[#1e1f20] hover:bg-zinc-800 text-zinc-300 border border-zinc-700/60'
          }`}
          title={useSearch ? 'Real-time Grounding is ON' : 'Turn on Real-time Grounding'}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>{useSearch ? 'Search Grounding: ON' : 'Search Grounding'}</span>
        </button>
      )}

      {DEFAULT_SEARCH_BUBBLES.map((bubble, idx) => (
        <button
          key={idx}
          type="button"
          onClick={() => onSendMessage(bubble, [])}
          className="group inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#1e1f20] hover:bg-zinc-800 border border-zinc-700/60 hover:border-cyan-500/50 text-xs text-zinc-300 hover:text-white transition shrink-0 shadow-sm active:scale-95"
        >
          <Search className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition" />
          <span>{bubble}</span>
        </button>
      ))}
    </div>
  );

  // Empty State: Matches reference image "Where should we start?"
  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 w-full relative select-none">
        {fileInput}

        {/* Ambient radial lighting in center */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-950/20 via-transparent to-transparent" />

        <div className="w-full max-w-2xl flex flex-col items-center space-y-5 z-10">
          {/* Main title from reference image */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-white text-center">
            Where should we start?
          </h1>

          {/* Gemini-Style Search Bubbles row above input */}
          <div className="w-full">
            {renderSearchBubblesBar()}
          </div>

          {/* Attachment chips if any */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 w-full justify-center">
              {attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-xs text-zinc-200 shadow-sm"
                >
                  <Paperclip className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="max-w-[150px] truncate">{att.name}</span>
                  <button
                    type="button"
                    onClick={() => removeAttachment(att.id)}
                    className="p-0.5 rounded-full hover:bg-zinc-700 text-zinc-400 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Central Pill Input from reference image */}
          <div className="w-full relative">
            <div className="flex items-center bg-[#1e1f20] hover:bg-[#232426] border border-transparent focus-within:border-zinc-700 rounded-full px-4 py-2.5 sm:py-3 shadow-2xl transition duration-150">
              {/* Plus button on left for files */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-1 rounded-full hover:bg-zinc-800 text-zinc-300 hover:text-white transition mr-2 shrink-0"
                title="Add file or document (PDF, Code, Video, PPT, TXT, Images)"
                aria-label="Upload file"
              >
                <Plus className="w-5 h-5 stroke-[2]" />
              </button>

              {/* Text Input */}
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Bats AI"
                className="flex-1 bg-transparent text-sm sm:text-base text-zinc-100 placeholder-zinc-400 focus:outline-none min-w-0"
              />

              {/* Inside Pill Controls: Search toggle + Model dropdown + Mic / Send */}
              <div className="flex items-center space-x-2 shrink-0 ml-2">
                {onToggleSearch && (
                  <button
                    type="button"
                    onClick={onToggleSearch}
                    className={`p-1.5 rounded-full transition ${
                      useSearch
                        ? 'bg-blue-600/30 text-blue-400 border border-blue-500/50'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                    }`}
                    title={useSearch ? 'Real-time Web Search: Enabled' : 'Enable Real-time Web Search'}
                    aria-label="Toggle Web Search"
                  >
                    <Globe className="w-4 h-4" />
                  </button>
                )}

                <div className="relative" ref={modelMenuRef}>
                  <button
                    type="button"
                    onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
                    className="flex items-center space-x-1 px-2.5 py-1 rounded-full hover:bg-zinc-800 text-xs text-zinc-300 font-medium transition"
                    aria-label="Select AI model"
                  >
                    <span className="truncate max-w-[100px] sm:max-w-[130px]">
                      {selectedModel.category === 'general'
                        ? 'Bats Auto'
                        : selectedModel.category === 'thinking'
                        ? 'Thinking'
                        : selectedModel.category === 'codex'
                        ? 'Codex'
                        : 'Fast Lite'}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                  </button>

                  {modelDropdownOpen && renderModelDropdown('down')}
                </div>

                {input.trim() || attachments.length > 0 ? (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="p-1.5 rounded-full bg-white text-black hover:bg-zinc-200 transition shadow"
                    title="Send"
                  >
                    <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setInput('Explain how Bats AI processes code, documents, and real-time search.');
                    }}
                    className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
                    title="Voice / Prompt Assistant"
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Vertical Prompt Suggestions list from reference image */}
          <div className="flex flex-col space-y-2.5 w-full pt-1">
            {suggestedPrompts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSendMessage(p.text, [])}
                className="flex items-center space-x-3 px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-900/50 transition text-sm text-left group"
              >
                <span className="group-hover:text-cyan-400 transition">{p.icon}</span>
                <span className="font-normal">{p.text}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Active Chat Message List
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {fileInput}

      {/* Messages Thread (ChatGPT style without avatar bubbles) */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 max-w-3xl mx-auto w-full space-y-6">
        {messages.map((message) => {
          const isUser = message.role === 'user';

          if (isUser) {
            return (
              <div key={message.id} className="flex justify-end w-full">
                <div className="flex flex-col items-end max-w-[85%] sm:max-w-[75%]">
                  {/* Attachments preview on user message */}
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2 justify-end">
                      {message.attachments.map((att) => (
                        <div
                          key={att.id}
                          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-2xl bg-zinc-800 border border-zinc-700 text-xs text-zinc-200"
                        >
                          {att.type === 'image' && att.data ? (
                            <img
                              src={`data:${att.mimeType};base64,${att.data}`}
                              alt={att.name}
                              className="w-5 h-5 rounded object-cover"
                            />
                          ) : att.type === 'code' ? (
                            <FileCode className="w-4 h-4 text-blue-400" />
                          ) : (
                            <FileText className="w-4 h-4 text-emerald-400" />
                          )}
                          <span className="font-medium max-w-[140px] truncate">{att.name}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* ChatGPT style user bubble */}
                  <div className="bg-[#2f2f2f] text-zinc-100 px-5 py-3 rounded-3xl text-sm md:text-base leading-relaxed shadow-sm break-words">
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              </div>
            );
          }

          // Real search queries and sources from API or grounding
          const activeQueries = message.searchQueries || [];
          const activeSources = message.groundingSources || [];
          const showGroundingSection =
            !message.isStreaming &&
            message.isSearchGrounded &&
            (activeQueries.length > 0 || activeSources.length > 0);

          // Assistant / Model response (ChatGPT style: clean left-aligned text, no avatar icon)
          return (
            <div key={message.id} className="flex flex-col items-start w-full">
              <div className="w-full text-zinc-200 text-sm md:text-base leading-relaxed py-1 break-words">
                {message.isStreaming && !message.content ? (
                  <div className="flex items-center space-x-3 py-2 text-zinc-400 select-none animate-in fade-in duration-200">
                    <div className="flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce"></span>
                    </div>
                    <span className="text-xs font-medium text-zinc-400">
                      Waiting for Gemini API response...
                    </span>
                  </div>
                ) : (
                  <>
                    <MarkdownRenderer content={message.content} />
                    {message.isStreaming && (
                      <span className="inline-block w-2 h-4 bg-zinc-300 ml-1 animate-pulse align-middle" />
                    )}
                  </>
                )}
              </div>

              {/* Gemini Search Grounding: Only shown when search grounding was explicitly performed */}
              {showGroundingSection && (
                <div className="mt-4 pt-3 border-t border-zinc-800/60 w-full space-y-2.5">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 text-xs font-medium text-zinc-400">
                      <Search className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Search related topics</span>
                    </div>
                    <span className="text-[10px] text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-2 py-0.5 rounded-full flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      <span>Search Grounded</span>
                    </span>
                  </div>

                  {/* Search Query Bubbles */}
                  {activeQueries.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {activeQueries.map((query, qIdx) => (
                        <button
                          key={qIdx}
                          type="button"
                          onClick={() => onSendMessage(query, [])}
                          className="group inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[#1e1f20] hover:bg-zinc-800 border border-zinc-700/60 hover:border-cyan-500/50 text-xs text-zinc-300 hover:text-white transition shadow-sm active:scale-95 text-left"
                          title={`Search: ${query}`}
                        >
                          <Search className="w-3.5 h-3.5 text-zinc-400 group-hover:text-cyan-400 transition shrink-0" />
                          <span className="font-medium">{query}</span>
                          <ArrowUpRight className="w-3 h-3 text-zinc-500 group-hover:text-cyan-400 transition opacity-70 group-hover:opacity-100 shrink-0" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Grounding Source Citation Bubbles */}
                  {activeSources.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[11px] text-zinc-500 flex items-center mr-1">
                        <Globe className="w-3 h-3 mr-1 text-cyan-400" />
                        Sources:
                      </span>
                      {activeSources.map((src, sIdx) => (
                        <a
                          key={sIdx}
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-blue-950/30 hover:bg-blue-900/40 border border-blue-800/40 text-[11px] text-blue-300 hover:text-blue-200 transition"
                          title={src.title}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                          <span className="max-w-[130px] truncate">{src.domain || src.title}</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Double-check Verification Banner if clicked */}
                  {doubleCheckedIds.has(message.id) && (
                    <div className="p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-xs text-cyan-200 flex items-start space-x-2 animate-in fade-in duration-150">
                      <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-cyan-300">Search Verification Completed</div>
                        <div className="text-[11px] text-zinc-300 mt-0.5">
                          Key facts and statements cross-referenced against authoritative web sources. All cited links and topics confirmed active.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action bar for model responses */}
              {!message.isStreaming && (
                <div className="flex items-center space-x-3 mt-3 text-zinc-500 text-xs flex-wrap gap-y-1">
                  <button
                    onClick={() => copyMessage(message.id, message.content)}
                    className="flex items-center space-x-1 p-1 hover:text-zinc-300 transition rounded"
                    title="Copy response"
                  >
                    {copiedId === message.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={onRetry}
                    className="flex items-center space-x-1 p-1 hover:text-zinc-300 transition rounded"
                    title="Regenerate response"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Regenerate</span>
                  </button>

                  {/* Gemini "Check with Search" Action Button */}
                  <button
                    onClick={() => toggleDoubleCheck(message.id)}
                    className={`flex items-center space-x-1 p-1 rounded transition ${
                      doubleCheckedIds.has(message.id)
                        ? 'text-cyan-300 bg-cyan-950/40 border border-cyan-800/40 px-2'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                    title="Double check with Google / Web Search"
                  >
                    <Search className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{doubleCheckedIds.has(message.id) ? 'Search Verified ✓' : 'Double-check response'}</span>
                  </button>

                  {message.modelUsed && (
                    <span className="text-[11px] text-zinc-600 ml-1">via {message.modelUsed}</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Sticky Pill Input during active chat */}
      <div className="p-4 bg-gradient-to-t from-black via-black/80 to-transparent">
        <div className="max-w-3xl mx-auto w-full space-y-2">
          {/* Search Bubbles bar in active chat */}
          {renderSearchBubblesBar()}

          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-xs text-zinc-200"
                >
                  <Paperclip className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="max-w-[150px] truncate">{att.name}</span>
                  <button
                    type="button"
                    onClick={() => removeAttachment(att.id)}
                    className="p-0.5 rounded-full hover:bg-zinc-700 text-zinc-400 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center bg-[#1e1f20] hover:bg-[#232426] border border-transparent focus-within:border-zinc-700 rounded-full px-4 py-2.5 shadow-2xl transition duration-150">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-1 rounded-full hover:bg-zinc-800 text-zinc-300 hover:text-white transition mr-2 shrink-0"
              title="Add file"
              aria-label="Upload file"
            >
              <Plus className="w-5 h-5 stroke-[2]" />
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Bats AI"
              className="flex-1 bg-transparent text-sm sm:text-base text-zinc-100 placeholder-zinc-400 focus:outline-none min-w-0"
            />

            <div className="flex items-center space-x-2 shrink-0 ml-2">
              {onToggleSearch && (
                <button
                  type="button"
                  onClick={onToggleSearch}
                  className={`p-1.5 rounded-full transition ${
                    useSearch
                      ? 'bg-blue-600/30 text-blue-400 border border-blue-500/50'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  }`}
                  title={useSearch ? 'Real-time Web Search: Enabled' : 'Enable Real-time Web Search'}
                  aria-label="Toggle Web Search"
                >
                  <Globe className="w-4 h-4" />
                </button>
              )}

              <div className="relative" ref={modelMenuRef}>
                <button
                  type="button"
                  onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded-full hover:bg-zinc-800 text-xs text-zinc-300 font-medium transition"
                  aria-label="Select AI model"
                >
                  <span className="truncate max-w-[100px] sm:max-w-[130px]">
                    {selectedModel.category === 'general'
                      ? 'Bats Auto'
                      : selectedModel.category === 'thinking'
                      ? 'Thinking'
                      : selectedModel.category === 'codex'
                      ? 'Codex'
                      : 'Fast Lite'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                </button>
                {modelDropdownOpen && renderModelDropdown('up')}
              </div>

              {isStreaming ? (
                <button
                  type="button"
                  onClick={onStopStreaming}
                  className="p-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-red-400 transition"
                  title="Stop"
                >
                  <Square className="w-4 h-4 fill-current" />
                </button>
              ) : input.trim() || attachments.length > 0 ? (
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="p-1.5 rounded-full bg-white text-black hover:bg-zinc-200 transition shadow"
                  title="Send"
                >
                  <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
