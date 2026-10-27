export type AttachmentType = 'image' | 'video' | 'audio' | 'pdf' | 'code' | 'document' | 'other';

export interface Attachment {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  data?: string; // base64 without prefix or with prefix
  text?: string;
  type: AttachmentType;
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

export interface AIModel {
  id: string;
  name: string;
  category: 'general' | 'thinking' | 'codex' | 'speed';
  tag: string;
  description: string;
  icon: string;
  badgeColor: string;
}

export interface AppSettings {
  backgroundColor: string;
  accentColor: string;
  defaultModel: string;
  streamResponses: boolean;
  codeLineNumbers: boolean;
  fontSize: 'sm' | 'md' | 'lg';
}

export type ActiveTab = 'chat' | 'image' | 'codex';
