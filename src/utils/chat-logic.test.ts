import test from 'node:test';
import assert from 'node:assert/strict';
import {
  shouldSaveHistory,
  categorizeConversationsByDate,
  classifyFileType,
  searchConversations,
  generateConversationTitle,
  generateSearchBubbles,
  Conversation,
} from './chat-logic';

test('shouldSaveHistory only returns true when user has valid email', () => {
  assert.equal(shouldSaveHistory(null), false);
  assert.equal(shouldSaveHistory(undefined), false);
  assert.equal(shouldSaveHistory({ email: '', name: 'Guest', signedInAt: Date.now() }), false);
  assert.equal(shouldSaveHistory({ email: 'invalid-email', name: 'User', signedInAt: Date.now() }), false);
  assert.equal(
    shouldSaveHistory({ email: 'batsbat123.hack@gmail.com', name: 'Bats Bat', signedInAt: Date.now() }),
    true
  );
  assert.equal(
    shouldSaveHistory({ email: 'user@example.com', name: 'Test User', signedInAt: Date.now() }),
    true
  );
});

test('classifyFileType correctly identifies various file types', () => {
  assert.equal(classifyFileType('image.png', 'image/png'), 'image');
  assert.equal(classifyFileType('demo.mp4', 'video/mp4'), 'video');
  assert.equal(classifyFileType('podcast.mp3', 'audio/mpeg'), 'audio');
  assert.equal(classifyFileType('report.pdf', 'application/pdf'), 'pdf');
  assert.equal(classifyFileType('server.ts', 'text/plain'), 'code');
  assert.equal(classifyFileType('style.css', 'text/css'), 'code');
  assert.equal(classifyFileType('presentation.pptx', 'application/vnd.openxmlformats'), 'document');
  assert.equal(classifyFileType('notes.txt', 'text/plain'), 'document');
});

test('categorizeConversationsByDate organizes chats into time buckets', () => {
  const now = 1770000000000;
  const ONE_HOUR = 3600 * 1000;
  const ONE_DAY = 24 * 3600 * 1000;

  const convs: Conversation[] = [
    {
      id: 'c-pin',
      title: 'Pinned Prompt',
      createdAt: now - ONE_HOUR,
      updatedAt: now - ONE_HOUR,
      messages: [],
      pinned: true,
      model: 'gemini-3.8-flash',
    },
    {
      id: 'c-today',
      title: 'Today Chat',
      createdAt: now - 2 * ONE_HOUR,
      updatedAt: now - 2 * ONE_HOUR,
      messages: [],
      model: 'gemini-3.8-flash',
    },
    {
      id: 'c-yesterday',
      title: 'Yesterday Chat',
      createdAt: now - 25 * ONE_HOUR,
      updatedAt: now - 25 * ONE_HOUR,
      messages: [],
      model: 'gemini-3.8-flash',
    },
    {
      id: 'c-week',
      title: 'Last Week Chat',
      createdAt: now - 3 * ONE_DAY,
      updatedAt: now - 3 * ONE_DAY,
      messages: [],
      model: 'gemini-3.8-flash',
    },
  ];

  const buckets = categorizeConversationsByDate(convs, now);
  assert.equal(buckets.pinned.length, 1);
  assert.equal(buckets.pinned[0].id, 'c-pin');
  assert.equal(buckets.today.length, 1);
  assert.equal(buckets.today[0].id, 'c-today');
});

test('generateConversationTitle truncates long prompts nicely', () => {
  assert.equal(generateConversationTitle('How to build a web app'), 'How to build a web app');
  const longPrompt = 'This is a very long prompt describing quantum computing algorithms and their applications in cryptography';
  const title = generateConversationTitle(longPrompt);
  assert.ok(title.endsWith('...'));
  assert.ok(title.length <= 45);
});

test('searchConversations finds by title and content', () => {
  const convs: Conversation[] = [
    {
      id: '1',
      title: 'Python Scripting',
      createdAt: 100,
      updatedAt: 100,
      model: 'gemini-3.8-flash',
      messages: [{ id: 'm1', role: 'user', content: 'Help me with list comprehension', timestamp: 100 }],
    },
    {
      id: '2',
      title: 'React Architecture',
      createdAt: 200,
      updatedAt: 200,
      model: 'gemini-3.8-flash',
      messages: [{ id: 'm2', role: 'user', content: 'Tailwind styling tricks', timestamp: 200 }],
    },
  ];

  const resultsTitle = searchConversations(convs, 'Python');
  assert.equal(resultsTitle.length, 1);
  assert.equal(resultsTitle[0].id, '1');

  const resultsContent = searchConversations(convs, 'Tailwind');
  assert.equal(resultsContent.length, 1);
  assert.equal(resultsContent[0].id, '2');
});

test('generateSearchBubbles produces queries and sources for queries', () => {
  const pyResults = generateSearchBubbles('How to write a fast Python script?');
  assert.ok(pyResults.queries.length >= 3);
  assert.ok(pyResults.queries.some(q => q.toLowerCase().includes('python')));
  assert.ok(pyResults.sources.length >= 2);
  assert.equal(pyResults.sources[0].domain, 'docs.python.org');

  const wallpaperResults = generateSearchBubbles('Design a phone wallpaper for me');
  assert.ok(wallpaperResults.queries.some(q => q.toLowerCase().includes('wallpaper')));

  const generalResults = generateSearchBubbles('Quantum Computing');
  assert.ok(generalResults.queries.length > 0);
  assert.ok(generalResults.sources.some(s => Boolean(s.domain && s.domain.includes('wikipedia'))));
});

