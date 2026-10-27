import test from 'node:test';
import assert from 'node:assert/strict';
import { generateBatsVisualArtwork, generateBatsIntelligentFallback } from './ai-fallback';

test('generateBatsVisualArtwork generates valid base64 image data for different aspect ratios', () => {
  const result1 = generateBatsVisualArtwork('A cyber bat flying over neon city', '1:1', 'cyberpunk');
  assert.ok(result1.imageUrl.startsWith('data:image/svg+xml;base64,'));
  assert.equal(result1.aspectRatio, '1:1');
  assert.ok(result1.caption.includes('cyber bat'));

  const result16_9 = generateBatsVisualArtwork('Cosmic landscape with stars', '16:9', 'anime');
  assert.ok(result16_9.imageUrl.startsWith('data:image/svg+xml;base64,'));
  assert.equal(result16_9.aspectRatio, '16:9');
});

test('generateBatsIntelligentFallback provides structured code solutions without error codes', () => {
  const pythonResponse = generateBatsIntelligentFallback('Write a python script to parse json to csv');
  assert.ok(pythonResponse.includes('```python'));
  assert.ok(pythonResponse.includes('json_to_csv'));
  assert.ok(!pythonResponse.includes('429'));
  assert.ok(!pythonResponse.includes('RESOURCE_EXHAUSTED'));

  const reactResponse = generateBatsIntelligentFallback('Build a react typescript component');
  assert.ok(reactResponse.includes('```tsx'));
  assert.ok(!reactResponse.includes('RESOURCE_EXHAUSTED'));

  const generalResponse = generateBatsIntelligentFallback('Hello general question');
  assert.ok(!generalResponse.includes('Bats AI Insight'));
  assert.ok(!generalResponse.includes('Insight'));
  assert.ok(!generalResponse.includes('Core Architecture'));
  assert.ok(!generalResponse.includes('Here is a clear, structured breakdown:'));

  const wallpaperResponse = generateBatsIntelligentFallback('Design a phone wallpaper for me');
  assert.ok(wallpaperResponse.includes('Cyber Obsidian'));
  assert.ok(!wallpaperResponse.includes('Bats AI Insight'));
});

test('generateBatsIntelligentFallback never outputs banned architecture boilerplate text', () => {
  const bannedPhrases = [
    'Here is a clear, structured breakdown',
    'Core Architecture',
    'High efficiency with minimal latency',
    'Key Best Practices',
    'Type Safety: Strictly define interfaces',
    'Bats AI Insight',
  ];

  const testPrompts = [
    'test',
    'hello',
    'what can you do',
    'help me please',
    'random query 12345',
  ];

  for (const p of testPrompts) {
    const output = generateBatsIntelligentFallback(p);
    for (const phrase of bannedPhrases) {
      assert.ok(
        !output.includes(phrase),
        `Output for "${p}" must not include banned phrase "${phrase}"`
      );
    }
  }
});

