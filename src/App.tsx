import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChatView } from './components/ChatView';
import { PromptInput } from './components/PromptInput';
import { ImageStudio } from './components/ImageStudio';
import { CodexView } from './components/CodexView';
import { SettingsModal } from './components/SettingsModal';
import { SignInModal } from './components/SignInModal';
import {
  AIModel,
  AppSettings,
  Conversation,
  ChatMessage,
  UserProfile,
  Attachment,
  ActiveTab,
} from './types';
import {
  shouldSaveHistory,
  generateConversationTitle,
  generateSearchBubbles,
} from './utils/chat-logic';

export const DEFAULT_MODELS: AIModel[] = [
  {
    id: 'bats-flash',
    name: 'Bats Flash (General)',
    category: 'general',
    tag: 'Recommended',
    description: 'Fast, multimodal model optimized for real-time Q&A, documents, and general intelligence.',
    icon: 'Sparkles',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  },
  {
    id: 'bats-thinking',
    name: 'Bats Neural (High Thinking)',
    category: 'thinking',
    tag: 'Deep Reasoning',
    description: 'Extended reasoning level enabled for complex logic, multi-step math, research, and STEM.',
    icon: 'Brain',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  },
  {
    id: 'bats-codex',
    name: 'Bats Codex (Code Architect)',
    category: 'codex',
    tag: 'Code Specialist',
    description: 'Engineered specifically for full-stack code authoring, syntax review, bug fixing, and refactoring.',
    icon: 'Code2',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  },
  {
    id: 'bats-speed',
    name: 'Bats Ultra-Lite (Speed)',
    category: 'speed',
    tag: 'Instant TTFT',
    description: 'Ultra-low latency model designed for instant responses and lightweight queries.',
    icon: 'Zap',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  },
];

const DEFAULT_SETTINGS: AppSettings = {
  backgroundColor: '#000000', // User requirement: "The default background color should be black"
  accentColor: '#06b6d4',
  defaultModel: 'bats-flash',
  streamResponses: true,
  codeLineNumbers: true,
  fontSize: 'md',
};

export default function App() {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState<ActiveTab>('chat');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);

  // Settings & Theme
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('bats_ai_settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // User Profile (Signed-in Google email)
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('bats_ai_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Models
  const [models, setModels] = useState<AIModel[]>(DEFAULT_MODELS);
  const [selectedModel, setSelectedModel] = useState<AIModel>(() => {
    return DEFAULT_MODELS.find((m) => m.id === settings.defaultModel) || DEFAULT_MODELS[0];
  });
  const [useSearch, setUseSearch] = useState(false);

  // Saved Conversations (Only persisted when user is signed in)
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const savedUser = localStorage.getItem('bats_ai_user');
      if (savedUser) {
        const saved = localStorage.getItem('bats_ai_conversations');
        return saved ? JSON.parse(saved) : [];
      }
      return [];
    } catch {
      return [];
    }
  });

  // Active Chat Session
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch updated models from backend on mount
  useEffect(() => {
    fetch('/api/models')
      .then((res) => res.json())
      .then((data) => {
        if (data.models && Array.isArray(data.models)) {
          setModels(data.models);
        }
      })
      .catch((err) => console.log('Using default model configuration:', err));
  }, []);

  // Persist settings changes
  useEffect(() => {
    try {
      localStorage.setItem('bats_ai_settings', JSON.stringify(settings));
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  }, [settings]);

  // Persist user changes
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('bats_ai_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('bats_ai_user');
      }
    } catch (err) {
      console.error('Failed to save user session:', err);
    }
  }, [user]);

  // Persist conversations ONLY if user is signed in with a valid email
  useEffect(() => {
    if (shouldSaveHistory(user)) {
      try {
        localStorage.setItem('bats_ai_conversations', JSON.stringify(conversations));
      } catch (err) {
        console.error('Failed to save conversations:', err);
      }
    } else {
      // If signed out, ensure no persistent chats remain stored
      localStorage.removeItem('bats_ai_conversations');
    }
  }, [conversations, user]);

  // Handle switching conversations
  const handleSelectConversation = (id: string) => {
    const target = conversations.find((c) => c.id === id);
    if (target) {
      setCurrentConversationId(target.id);
      setMessages(target.messages);
      const matched = models.find((m) => m.id === target.model);
      if (matched) setSelectedModel(matched);
      setActiveTab('chat');
    }
  };

  // Start a fresh chat
  const handleNewChat = () => {
    if (isStreaming) {
      abortControllerRef.current?.abort();
      setIsStreaming(false);
    }
    setCurrentConversationId(null);
    setMessages([]);
    setActiveTab('chat');
  };

  // Delete conversation
  const handleDeleteConversation = (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (currentConversationId === id) {
      setCurrentConversationId(null);
      setMessages([]);
    }
  };

  // Pin/Unpin conversation
  const handlePinConversation = (id: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c))
    );
  };

  // Rename conversation
  const handleRenameConversation = (id: string, newTitle: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c))
    );
  };

  // Clear all history
  const handleClearHistory = () => {
    setConversations([]);
    setCurrentConversationId(null);
    setMessages([]);
    localStorage.removeItem('bats_ai_conversations');
  };

  // Export history as JSON
  const handleExportHistory = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(conversations, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `bats-ai-history-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // User Sign-in handler
  const handleSignIn = (profile: UserProfile) => {
    setUser(profile);
    // If the user already has an active guest chat with messages, save it now!
    if (messages.length > 0 && !currentConversationId) {
      const newId = `conv-${Date.now()}`;
      const firstUserMsg = messages.find((m) => m.role === 'user')?.content || 'New Chat';
      const newConv: Conversation = {
        id: newId,
        title: generateConversationTitle(firstUserMsg),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: messages,
        model: selectedModel.id,
      };
      setConversations([newConv]);
      setCurrentConversationId(newId);
    }
  };

  // User Sign-out handler
  const handleSignOut = () => {
    setUser(null);
    setConversations([]);
    setCurrentConversationId(null);
    setMessages([]);
    localStorage.removeItem('bats_ai_user');
    localStorage.removeItem('bats_ai_conversations');
  };

  // Send message and stream response from Gemini
  const handleSendMessage = async (content: string, attachments: Attachment[]) => {
    if (!content.trim() && attachments.length === 0) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
      attachments,
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    // Placeholder model message for streaming
    const botMessageId = `bot-${Date.now()}`;
    const botMessage: ChatMessage = {
      id: botMessageId,
      role: 'model',
      content: '',
      timestamp: Date.now(),
      modelUsed: selectedModel.name,
      isStreaming: true,
    };

    setMessages([...updatedMessages, botMessage]);
    setIsStreaming(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
            attachments: m.attachments?.map((a) => ({
              name: a.name,
              mimeType: a.mimeType,
              data: a.data,
              text: a.text,
            })),
          })),
          modelId: selectedModel.id,
          useSearch,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');
      let fullContent = '';
      let streamedSearchQueries: string[] = [];
      let streamedGroundingSources: any[] = [];

      if (reader) {
        let buffer = '';
        let streamDone = false;
        while (!streamDone) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const payload = JSON.parse(line.substring(6));
                if (payload.done) {
                  streamDone = true;
                  break;
                }
                if (payload.text) {
                  fullContent += payload.text;
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === botMessageId
                        ? { ...msg, content: fullContent, isStreaming: true }
                        : msg
                    )
                  );
                }
                if (payload.searchQueries && Array.isArray(payload.searchQueries)) {
                  streamedSearchQueries = payload.searchQueries;
                }
                if (payload.groundingSources && Array.isArray(payload.groundingSources)) {
                  streamedGroundingSources = payload.groundingSources;
                }
                if (payload.error) {
                  const errorNotice = payload.text || `\n\n*(Gemini API Notice: ${payload.error})*`;
                  fullContent += errorNotice;
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === botMessageId
                        ? { ...msg, content: fullContent, isStreaming: false, error: true }
                        : msg
                    )
                  );
                }
              } catch (e) {
                // Ignore SSE chunk parse errors
              }
            }
          }
        }
      }

      // Only attach search queries/grounding sources if search was actually used or returned by Gemini
      const hasRealSearchGrounding = useSearch || streamedSearchQueries.length > 0 || streamedGroundingSources.length > 0;
      let finalQueries: string[] = [];
      let finalSources: any[] = [];

      if (hasRealSearchGrounding) {
        if (streamedSearchQueries.length > 0) {
          finalQueries = streamedSearchQueries;
        } else if (useSearch) {
          finalQueries = generateSearchBubbles(content, fullContent).queries;
        }

        if (streamedGroundingSources.length > 0) {
          finalSources = streamedGroundingSources;
        } else if (useSearch) {
          finalSources = generateSearchBubbles(content, fullContent).sources;
        }
      }

      // Mark final message done
      const finalizedMessages = updatedMessages.concat({
        ...botMessage,
        content: fullContent || 'No response received from the Gemini API. Please try again.',
        isStreaming: false,
        searchQueries: finalQueries,
        groundingSources: finalSources,
        isSearchGrounded: hasRealSearchGrounding && (finalSources.length > 0 || finalQueries.length > 0),
      });

      setMessages(finalizedMessages);

      // Save conversation if user is signed in
      if (shouldSaveHistory(user)) {
        if (!currentConversationId) {
          const newId = `conv-${Date.now()}`;
          const newConv: Conversation = {
            id: newId,
            title: generateConversationTitle(content || attachments[0]?.name || 'New Chat'),
            createdAt: Date.now(),
            updatedAt: Date.now(),
            messages: finalizedMessages,
            model: selectedModel.id,
          };
          setConversations((prev) => [newConv, ...prev]);
          setCurrentConversationId(newId);
        } else {
          setConversations((prev) =>
            prev.map((c) =>
              c.id === currentConversationId
                ? {
                    ...c,
                    messages: finalizedMessages,
                    updatedAt: Date.now(),
                  }
                : c
            )
          );
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.warn('API Stream connection error:', err);
        const errMsg = 'The connection to the Gemini API was interrupted or timed out. Please try asking again.';

        const recoveredMessages = updatedMessages.concat({
          ...botMessage,
          content: errMsg,
          isStreaming: false,
          error: true,
          searchQueries: [],
          groundingSources: [],
          isSearchGrounded: false,
        });

        setMessages(recoveredMessages);

        if (shouldSaveHistory(user)) {
          if (!currentConversationId) {
            const newId = `conv-${Date.now()}`;
            const newConv: Conversation = {
              id: newId,
              title: generateConversationTitle(content || attachments[0]?.name || 'New Chat'),
              createdAt: Date.now(),
              updatedAt: Date.now(),
              messages: recoveredMessages,
              model: selectedModel.id,
            };
            setConversations((prev) => [newConv, ...prev]);
            setCurrentConversationId(newId);
          } else {
            setConversations((prev) =>
              prev.map((c) =>
                c.id === currentConversationId
                  ? {
                      ...c,
                      messages: recoveredMessages,
                      updatedAt: Date.now(),
                    }
                  : c
              )
            );
          }
        }
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const handleStopStreaming = () => {
    abortControllerRef.current?.abort();
    setIsStreaming(false);
    setMessages((prev) =>
      prev.map((msg) => (msg.isStreaming ? { ...msg, isStreaming: false } : msg))
    );
  };

  const handleRetryLast = () => {
    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMessage) {
      handleSendMessage(lastUserMessage.content, lastUserMessage.attachments || []);
    }
  };

  return (
    <div
      className="flex h-screen w-screen overflow-hidden text-zinc-100 transition-colors duration-300 select-auto"
      style={{ backgroundColor: settings.backgroundColor }}
    >
      {/* Gemini-style Collapsible Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onCloseMobile={() => setSidebarOpen(false)}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        conversations={conversations}
        currentConversationId={currentConversationId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
        onPinConversation={handlePinConversation}
        onRenameConversation={handleRenameConversation}
        user={user}
        onOpenSignIn={() => setSignInOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      {/* Main App Workspace */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        {/* Top Header */}
        <Header
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          selectedModel={selectedModel}
          models={models}
          onSelectModel={setSelectedModel}
          useSearch={useSearch}
          onToggleSearch={() => setUseSearch(!useSearch)}
          user={user}
          onOpenSignIn={() => setSignInOpen(true)}
          onSignOut={handleSignOut}
          onOpenSettings={() => setSettingsOpen(true)}
        />

        {/* Dynamic Views: Chat, Image Studio, or Codex */}
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
          {activeTab === 'chat' && (
            <ChatView
              messages={messages}
              isStreaming={isStreaming}
              selectedModel={selectedModel}
              models={models}
              onSelectModel={setSelectedModel}
              onSendMessage={handleSendMessage}
              onStopStreaming={handleStopStreaming}
              onRetry={handleRetryLast}
              useSearch={useSearch}
              onToggleSearch={() => setUseSearch(!useSearch)}
            />
          )}

          {activeTab === 'image' && (
            <ImageStudio
              onSendToChat={(prompt, imageUrl) => {
                setActiveTab('chat');
                handleSendMessage(prompt, [
                  {
                    id: `img-${Date.now()}`,
                    name: 'Generated Artwork.png',
                    mimeType: 'image/png',
                    size: 1024,
                    data: imageUrl.replace(/^data:image\/[a-z]+;base64,/, ''),
                    type: 'image',
                  },
                ]);
              }}
            />
          )}

          {activeTab === 'codex' && (
            <CodexView
              onSendToChat={(prompt) => {
                setActiveTab('chat');
                handleSendMessage(prompt, []);
              }}
            />
          )}
        </main>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={(newSettings) => setSettings((prev) => ({ ...prev, ...newSettings }))}
        user={user}
        onClearHistory={handleClearHistory}
        onExportHistory={handleExportHistory}
        onOpenSignIn={() => setSignInOpen(true)}
        conversationCount={conversations.length}
      />

      {/* Real Google Email Sign-In Modal */}
      <SignInModal
        isOpen={signInOpen}
        onClose={() => setSignInOpen(false)}
        onSignIn={handleSignIn}
        suggestedEmail="batsbat123.hack@gmail.com"
      />
    </div>
  );
}
