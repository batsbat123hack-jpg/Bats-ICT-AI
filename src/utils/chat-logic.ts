export interface Attachment {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  data?: string; // base64
  text?: string;
  type: 'image' | 'video' | 'audio' | 'pdf' | 'code' | 'document' | 'other';
}

export interface GroundingSource {
  title: string;
  url: string;
  domain?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp: number;
  attachments?: Attachment[];
  modelUsed?: string;
  thinking?: string;
  isStreaming?: boolean;
  error?: boolean;
  searchQueries?: string[];
  groundingSources?: GroundingSource[];
  isSearchGrounded?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
  pinned?: boolean;
  model: string;
}

export interface UserProfile {
  email: string;
  name: string;
  picture?: string;
  signedInAt: number;
}

/**
 * Chat history should only be recorded if the user has signed up/in with an email.
 */
export function shouldSaveHistory(user: UserProfile | null | undefined): boolean {
  if (!user || !user.email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(user.email.trim());
}

/**
 * Categorizes a list of conversations into time buckets for the Gemini-style drawer.
 */
export function categorizeConversationsByDate(
  conversations: Conversation[],
  currentTimestamp: number = Date.now()
): {
  pinned: Conversation[];
  today: Conversation[];
  yesterday: Conversation[];
  previous7Days: Conversation[];
  older: Conversation[];
} {
  const ONE_DAY = 24 * 60 * 60 * 1000;
  const todayStart = new Date(currentTimestamp).setHours(0, 0, 0, 0);
  const yesterdayStart = todayStart - ONE_DAY;
  const sevenDaysStart = todayStart - 6 * ONE_DAY;

  const result = {
    pinned: [] as Conversation[],
    today: [] as Conversation[],
    yesterday: [] as Conversation[],
    previous7Days: [] as Conversation[],
    older: [] as Conversation[],
  };

  const sorted = [...conversations].sort((a, b) => b.updatedAt - a.updatedAt);

  for (const conv of sorted) {
    if (conv.pinned) {
      result.pinned.push(conv);
      continue;
    }

    if (conv.updatedAt >= todayStart) {
      result.today.push(conv);
    } else if (conv.updatedAt >= yesterdayStart) {
      result.yesterday.push(conv);
    } else if (conv.updatedAt >= sevenDaysStart) {
      result.previous7Days.push(conv);
    } else {
      result.older.push(conv);
    }
  }

  return result;
}

/**
 * Classifies uploaded file into standard categories for preview and Gemini ingestion.
 */
export function classifyFileType(fileName: string, mimeType: string): Attachment['type'] {
  const lowerName = fileName.toLowerCase();

  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType === 'application/pdf' || lowerName.endsWith('.pdf')) return 'pdf';

  const codeExtensions = [
    '.ts', '.tsx', '.js', '.jsx', '.json', '.html', '.css', '.scss',
    '.py', '.java', '.cpp', '.c', '.h', '.cs', '.go', '.rs', '.php',
    '.rb', '.sql', '.sh', '.yaml', '.yml', '.xml', '.env', '.toml'
  ];
  if (codeExtensions.some(ext => lowerName.endsWith(ext))) {
    return 'code';
  }

  const docExtensions = ['.txt', '.md', '.csv', '.rtf', '.ppt', '.pptx', '.doc', '.docx', '.xls', '.xlsx'];
  if (docExtensions.some(ext => lowerName.endsWith(ext))) {
    return 'document';
  }

  return 'other';
}

/**
 * Filter conversations by search term.
 */
export function searchConversations(conversations: Conversation[], query: string): Conversation[] {
  const q = query.trim().toLowerCase();
  if (!q) return conversations;
  return conversations.filter(conv => {
    if (conv.title.toLowerCase().includes(q)) return true;
    return conv.messages.some(m => m.content.toLowerCase().includes(q));
  });
}

/**
 * Extracts auto-title for a conversation from the first user prompt.
 */
export function generateConversationTitle(firstMessage: string): string {
  const clean = firstMessage.replace(/[\r\n]+/g, ' ').trim();
  if (!clean) return 'New Conversation';
  if (clean.length <= 42) return clean;
  return clean.substring(0, 42) + '...';
}

/**
 * Default search suggestion bubbles shown like Gemini's quick-query bubbles
 */
export const DEFAULT_SEARCH_BUBBLES = [
  'Latest AI breakthrough updates',
  'Python automation scripts & tips',
  'Next.js 15 & React 19 architecture',
  'Minimalist 4K phone wallpaper concepts',
  'Fast algorithms & time complexity',
  'Quantum computing explained simply',
];

/**
 * Intelligently generates Gemini-style contextual search bubbles & grounding sources
 * based on prompt topic and response content.
 */
export function generateSearchBubbles(prompt: string, content?: string): {
  queries: string[];
  sources: GroundingSource[];
} {
  const text = `${prompt} ${content || ''}`.toLowerCase();

  let queries: string[] = [];
  let sources: GroundingSource[] = [];

  if (text.includes('python') || text.includes('code') || text.includes('script') || text.includes('bug')) {
    queries = [
      'Python official syntax & best practices',
      'High-performance Python libraries',
      'Clean architecture in Python apps',
      'Python debugging & profiling techniques',
    ];
    sources = [
      { title: 'Python Official Documentation', url: 'https://docs.python.org/3/', domain: 'docs.python.org' },
      { title: 'Real Python Tutorials', url: 'https://realpython.com/', domain: 'realpython.com' },
      { title: 'GitHub Open Source Code', url: 'https://github.com/', domain: 'github.com' },
    ];
  } else if (text.includes('react') || text.includes('javascript') || text.includes('typescript') || text.includes('css') || text.includes('web')) {
    queries = [
      'Modern TypeScript & React patterns',
      'Tailwind CSS component design',
      'Web performance & Core Web Vitals',
      'Frontend architectural best practices',
    ];
    sources = [
      { title: 'MDN Web Docs', url: 'https://developer.mozilla.org/', domain: 'developer.mozilla.org' },
      { title: 'React Official Documentation', url: 'https://react.dev/', domain: 'react.dev' },
      { title: 'TypeScript Handbook', url: 'https://www.typescriptlang.org/docs/', domain: 'typescriptlang.org' },
    ];
  } else if (text.includes('wallpaper') || text.includes('image') || text.includes('design') || text.includes('art') || text.includes('photo')) {
    queries = [
      '4K phone wallpaper color aesthetics',
      'Minimalist dark mode OLED designs',
      'Creative visual prompt engineering',
      'Contemporary abstract wallpaper art',
    ];
    sources = [
      { title: 'Unsplash Photography', url: 'https://unsplash.com/', domain: 'unsplash.com' },
      { title: 'Behance Design Portfolios', url: 'https://www.behance.net/', domain: 'behance.net' },
      { title: 'Dribbble Creative Inspiration', url: 'https://dribbble.com/', domain: 'dribbble.com' },
    ];
  } else if (text.includes('film') || text.includes('cinema') || text.includes('movie')) {
    queries = [
      'Classic cinema history and trivia',
      'Cinematography lighting & framing techniques',
      'Top critically acclaimed films analysis',
      'Oscar winning screenplay structures',
    ];
    sources = [
      { title: 'IMDb Movie Database', url: 'https://www.imdb.com/', domain: 'imdb.com' },
      { title: 'British Film Institute (BFI)', url: 'https://www.bfi.org.uk/', domain: 'bfi.org.uk' },
      { title: 'Criterion Channel Collection', url: 'https://www.criterion.com/', domain: 'criterion.com' },
    ];
  } else {
    // General high-quality queries derived from prompt
    const cleanPrompt = prompt.replace(/[^\w\s]/g, '').trim();
    const words = cleanPrompt.split(/\s+/).filter((w) => w.length > 2);
    const keyTerm = words.slice(0, 4).join(' ') || 'latest developments';

    queries = [
      `${keyTerm} overview & analysis`,
      `Key facts and background on ${keyTerm}`,
      `Recent updates about ${keyTerm}`,
      `Expert insights and deep dive: ${keyTerm}`,
    ];
    sources = [
      { title: 'Wikipedia Knowledge Base', url: `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(keyTerm)}`, domain: 'en.wikipedia.org' },
      { title: 'Google Web Search Index', url: `https://www.google.com/search?q=${encodeURIComponent(keyTerm)}`, domain: 'google.com' },
      { title: 'Scholarly & Academic Research', url: 'https://arxiv.org/', domain: 'arxiv.org' },
    ];
  }

  return { queries, sources };
}
