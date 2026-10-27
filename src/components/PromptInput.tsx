import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowUp,
  Paperclip,
  Square,
  X,
  FileCode,
  FileText,
  FileVideo,
  FileAudio,
  FileSpreadsheet,
  Image as ImageIcon,
  Sparkles,
} from 'lucide-react';
import { Attachment } from '../types';
import { classifyFileType } from '../utils/chat-logic';

interface PromptInputProps {
  onSendMessage: (content: string, attachments: Attachment[]) => void;
  isStreaming: boolean;
  onStopStreaming: () => void;
  placeholder?: string;
}

export const PromptInput: React.FC<PromptInputProps> = ({
  onSendMessage,
  isStreaming,
  onStopStreaming,
  placeholder = 'Ask Bats AI anything, edit code, or upload files...',
}) => {
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea based on input
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 220)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
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
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleFileChange = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newAttachments: Attachment[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const type = classifyFileType(file.name, file.type);

      try {
        if (type === 'code' || type === 'document') {
          // Read text files as text
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
          // Read media/PDF/others as base64
          const reader = new FileReader();
          const base64Data = await new Promise<string>((resolve, reject) => {
            reader.onload = () => {
              const res = reader.result as string;
              // strip data:mime;base64, prefix for Gemini inlineData
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
        console.error('Failed to read file:', file.name, err);
      }
    }

    setAttachments((prev) => [...prev, ...newAttachments]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const renderFileIcon = (type: Attachment['type']) => {
    switch (type) {
      case 'code':
        return <FileCode className="w-3.5 h-3.5 text-blue-400" />;
      case 'image':
        return <ImageIcon className="w-3.5 h-3.5 text-purple-400" />;
      case 'video':
        return <FileVideo className="w-3.5 h-3.5 text-red-400" />;
      case 'audio':
        return <FileAudio className="w-3.5 h-3.5 text-amber-400" />;
      case 'pdf':
      case 'document':
        return <FileText className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <Paperclip className="w-3.5 h-3.5 text-zinc-400" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFileChange(e.dataTransfer.files);
      }}
      className={`relative w-full max-w-4xl mx-auto rounded-3xl bg-zinc-900/90 border transition shadow-2xl ${
        isDragging
          ? 'border-cyan-400 bg-cyan-950/20 ring-2 ring-cyan-500/30'
          : 'border-zinc-800/90 hover:border-zinc-700/80 focus-within:border-cyan-500/50'
      }`}
    >
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => handleFileChange(e.target.files)}
        multiple
        className="hidden"
        accept="*/*"
      />

      {/* Attachment chips */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 px-4 pt-3 pb-1 border-b border-zinc-800/60">
          {attachments.map((att) => (
            <div
              key={att.id}
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-zinc-800/90 border border-zinc-700/60 text-xs text-zinc-200"
            >
              {renderFileIcon(att.type)}
              <span className="max-w-[150px] truncate font-medium">{att.name}</span>
              <span className="text-[10px] text-zinc-500">({formatFileSize(att.size)})</span>
              <button
                type="button"
                onClick={() => removeAttachment(att.id)}
                className="p-0.5 rounded-full hover:bg-zinc-700 text-zinc-400 hover:text-white"
                aria-label={`Remove file ${att.name}`}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main input area */}
      <div className="flex items-end px-3 py-2.5">
        {/* Attachment button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded-2xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition mr-1 mb-0.5"
          title="Upload files (videos, code files, txt, ppt, PDF documents, images, audio)"
          aria-label="Upload files"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          className="flex-1 bg-transparent border-0 resize-none text-zinc-100 placeholder-zinc-500 text-sm md:text-base px-2 py-1.5 focus:outline-none min-h-[36px] max-h-[220px]"
        />

        {/* Send / Stop button */}
        {isStreaming ? (
          <button
            type="button"
            onClick={onStopStreaming}
            className="p-2.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-red-400 transition ml-2 mb-0.5 flex items-center justify-center shadow-lg"
            title="Stop generating"
            aria-label="Stop generating response"
          >
            <Square className="w-4 h-4 fill-current" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!input.trim() && attachments.length === 0}
            className={`p-2.5 rounded-2xl transition ml-2 mb-0.5 flex items-center justify-center shadow-lg ${
              input.trim() || attachments.length > 0
                ? 'bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white hover:from-cyan-400 hover:to-indigo-500 scale-100'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-60'
            }`}
            title="Send prompt"
            aria-label="Send message"
          >
            <ArrowUp className="w-4 h-4 stroke-[2.5]" />
          </button>
        )}
      </div>

      <div className="px-4 pb-2 flex items-center justify-between text-[11px] text-zinc-500">
        <span>Press <kbd className="px-1 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono text-[10px]">Enter</kbd> to send, <kbd className="px-1 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono text-[10px]">Shift+Enter</kbd> for newline</span>
        <span>Supports PDF, Code, Video, PPT, Images</span>
      </div>
    </div>
  );
};
