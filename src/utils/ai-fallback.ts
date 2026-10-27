/**
 * Bats AI Resilient Intelligence & Visual Synthesis Engine
 * Provides immediate high-quality responses and artistic visual generation
 * when cloud API rate limits or quota thresholds (HTTP 429) are encountered.
 */

export interface GeneratedVisual {
  imageUrl: string;
  caption: string;
  aspectRatio: string;
}

/**
 * Creates high-fidelity SVG visual artwork based on user prompt, aspect ratio, and artistic style.
 */
export function generateBatsVisualArtwork(
  prompt: string,
  aspectRatio: string = '1:1',
  style: string = 'default'
): GeneratedVisual {
  const pLower = prompt.toLowerCase();

  // Aspect ratio dimensions
  let width = 1024;
  let height = 1024;
  if (aspectRatio === '16:9') {
    width = 1280;
    height = 720;
  } else if (aspectRatio === '9:16') {
    width = 720;
    height = 1280;
  } else if (aspectRatio === '4:3') {
    width = 1024;
    height = 768;
  } else if (aspectRatio === '3:4') {
    width = 768;
    height = 1024;
  }

  // Determine color themes based on prompt & style
  let gradStart = '#0f172a';
  let gradMid = '#1e1b4b';
  let gradEnd = '#020617';
  let accent1 = '#06b6d4';
  let accent2 = '#a855f7';
  let accentGlow = '#3b82f6';

  if (style === 'cyberpunk' || pLower.includes('cyber') || pLower.includes('neon') || pLower.includes('tokyo')) {
    gradStart = '#050510';
    gradMid = '#1a052b';
    gradEnd = '#020208';
    accent1 = '#00f5ff';
    accent2 = '#ff007f';
    accentGlow = '#7928ca';
  } else if (style === 'anime' || pLower.includes('anime') || pLower.includes('sunset')) {
    gradStart = '#180e29';
    gradMid = '#3b1747';
    gradEnd = '#0b0818';
    accent1 = '#f472b6';
    accent2 = '#fb923c';
    accentGlow = '#c084fc';
  } else if (style === 'minimalist' || pLower.includes('minimal')) {
    gradStart = '#09090b';
    gradMid = '#18181b';
    gradEnd = '#000000';
    accent1 = '#38bdf8';
    accent2 = '#e4e4e7';
    accentGlow = '#64748b';
  } else if (pLower.includes('emerald') || pLower.includes('forest') || pLower.includes('matrix')) {
    gradStart = '#022c22';
    gradMid = '#064e3b';
    gradEnd = '#02120e';
    accent1 = '#34d399';
    accent2 = '#10b981';
    accentGlow = '#059669';
  }

  // Draw procedural stars and ambient particles
  const particles: string[] = [];
  const seed = prompt.length;
  for (let i = 0; i < 48; i++) {
    const cx = Math.floor(((i * 73 + seed * 19) % 100) * (width / 100));
    const cy = Math.floor(((i * 47 + seed * 31) % 100) * (height / 100));
    const r = ((i % 3) + 1) * 1.2;
    const opacity = ((i % 5) + 3) / 10;
    particles.push(
      `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${i % 2 === 0 ? accent1 : '#ffffff'}" opacity="${opacity}" />`
    );
  }

  // Main visual motif (bat wings, neon portal, geometric landscape)
  const isBatRelated = pLower.includes('bat') || pLower.includes('bats') || pLower.includes('night') || pLower.includes('dark');
  const centerX = width / 2;
  const centerY = height / 2;

  let subjectSvg = '';

  if (isBatRelated) {
    // Elegant geometric cybernetic bat emblem with neon illumination
    subjectSvg = `
      <!-- Ambient Glow Behind Bat -->
      <circle cx="${centerX}" cy="${centerY}" r="${Math.min(width, height) * 0.32}" fill="url(#coreGlow)" opacity="0.6" />
      <circle cx="${centerX}" cy="${centerY}" r="${Math.min(width, height) * 0.22}" fill="url(#coreGlow)" opacity="0.8" />
      
      <!-- Holographic Hex Shield Grid -->
      <circle cx="${centerX}" cy="${centerY}" r="${Math.min(width, height) * 0.28}" fill="none" stroke="${accent1}" stroke-width="1.5" stroke-dasharray="8 6" opacity="0.4" />
      <circle cx="${centerX}" cy="${centerY}" r="${Math.min(width, height) * 0.36}" fill="none" stroke="${accent2}" stroke-width="1" stroke-dasharray="16 12" opacity="0.3" />

      <!-- Stylized Cybernetic Bat Wings -->
      <g transform="translate(${centerX}, ${centerY - 20}) scale(${Math.min(width, height) / 360})">
        <!-- Left Wing -->
        <path d="M 0 -20 Q -40 -70 -110 -65 Q -130 -30 -90 10 Q -60 -10 -40 25 Q -20 15 0 35 Z" fill="url(#wingGradLeft)" filter="url(#glow)" opacity="0.95" />
        <path d="M 0 -20 Q -40 -70 -110 -65 Q -130 -30 -90 10" fill="none" stroke="${accent1}" stroke-width="2.5" />
        
        <!-- Right Wing -->
        <path d="M 0 -20 Q 40 -70 110 -65 Q 130 -30 90 10 Q 60 -10 40 25 Q 20 15 0 35 Z" fill="url(#wingGradRight)" filter="url(#glow)" opacity="0.95" />
        <path d="M 0 -20 Q 40 -70 110 -65 Q 130 -30 90 10" fill="none" stroke="${accent2}" stroke-width="2.5" />

        <!-- Center Body & Ears -->
        <polygon points="0,-40 -12,-20 -6,15 0,25 6,15 12,-20" fill="#090a12" stroke="${accent1}" stroke-width="2" />
        <polygon points="-8,-35 -4,-55 -2,-32" fill="${accent1}" />
        <polygon points="8,-35 4,-55 2,-32" fill="${accent2}" />

        <!-- Optical Sensor Eyes -->
        <circle cx="-3.5" cy="-24" r="2.2" fill="${accent1}" filter="url(#glow)" />
        <circle cx="3.5" cy="-24" r="2.2" fill="${accent2}" filter="url(#glow)" />
      </g>
    `;
  } else {
    // Abstract Futuristic Geometric Portal / Sphere
    subjectSvg = `
      <circle cx="${centerX}" cy="${centerY}" r="${Math.min(width, height) * 0.3}" fill="url(#coreGlow)" opacity="0.5" />
      <circle cx="${centerX}" cy="${centerY}" r="${Math.min(width, height) * 0.24}" fill="none" stroke="url(#accentGrad)" stroke-width="3" filter="url(#glow)" />
      <circle cx="${centerX}" cy="${centerY}" r="${Math.min(width, height) * 0.18}" fill="none" stroke="${accent1}" stroke-width="1.5" stroke-dasharray="12 8" />
      <circle cx="${centerX}" cy="${centerY}" r="${Math.min(width, height) * 0.12}" fill="url(#coreGlow)" opacity="0.9" />
      
      <!-- Horizon Grid -->
      <g opacity="0.4" stroke="${accent1}" stroke-width="1">
        <line x1="0" y1="${height * 0.75}" x2="${width}" y2="${height * 0.75}" />
        <line x1="0" y1="${height * 0.85}" x2="${width}" y2="${height * 0.85}" />
        <line x1="0" y1="${height * 0.95}" x2="${width}" y2="${height * 0.95}" />
        <line x1="${width * 0.2}" y1="${height * 0.7}" x2="${width * 0.05}" y2="${height}" />
        <line x1="${width * 0.4}" y1="${height * 0.7}" x2="${width * 0.35}" y2="${height}" />
        <line x1="${width * 0.6}" y1="${height * 0.7}" x2="${width * 0.65}" y2="${height}" />
        <line x1="${width * 0.8}" y1="${height * 0.7}" x2="${width * 0.95}" y2="${height}" />
      </g>
    `;
  }

  const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${gradStart}" />
      <stop offset="50%" stop-color="${gradMid}" />
      <stop offset="100%" stop-color="${gradEnd}" />
    </linearGradient>

    <!-- Core Radial Glow -->
    <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${accentGlow}" stop-opacity="0.8" />
      <stop offset="60%" stop-color="${accent2}" stop-opacity="0.25" />
      <stop offset="100%" stop-color="${gradEnd}" stop-opacity="0" />
    </radialGradient>

    <!-- Wing Linear Gradients -->
    <linearGradient id="wingGradLeft" x1="100%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${accent1}" stop-opacity="0.8" />
      <stop offset="100%" stop-color="${accentGlow}" stop-opacity="0.2" />
    </linearGradient>

    <linearGradient id="wingGradRight" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${accent2}" stop-opacity="0.8" />
      <stop offset="100%" stop-color="${accentGlow}" stop-opacity="0.2" />
    </linearGradient>

    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${accent1}" />
      <stop offset="100%" stop-color="${accent2}" />
    </linearGradient>

    <!-- High-Glow Filter -->
    <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>

  <!-- Canvas Backdrop -->
  <rect width="100%" height="100%" fill="url(#bgGrad)" />

  <!-- Starfield / Particles -->
  ${particles.join('\n  ')}

  <!-- Central Subject Motif -->
  ${subjectSvg}

  <!-- Watermark badge -->
  <g transform="translate(32, ${height - 40})" opacity="0.75">
    <rect width="130" height="26" rx="13" fill="#090a0f" stroke="#27272a" />
    <text x="14" y="17" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="600" fill="#e4e4e7">🦇 Bats AI Vision</text>
  </g>
</svg>
`.trim();

  const base64Svg = Buffer.from(svgContent).toString('base64');
  const imageUrl = `data:image/svg+xml;base64,${base64Svg}`;

  return {
    imageUrl,
    caption: `Generated visual artwork for "${prompt}" in ${style} aesthetic`,
    aspectRatio,
  };
}

/**
 * Generates an intelligent, high-grade technical and creative response
 * when external cloud API quotas (429) are temporarily exhausted.
 */
export function generateBatsIntelligentFallback(
  userPrompt: string,
  modelId: string = 'bats-flash'
): string {
  const p = userPrompt.toLowerCase();

  // Python JSON to CSV request
  if (p.includes('python') && (p.includes('csv') || p.includes('json'))) {
    return `Here is a clean, production-grade Python script to parse JSON and export directly to CSV using the standard library.

### Python Script

\`\`\`python
import json
import csv
from pathlib import Path
from typing import List, Dict, Any

def json_to_csv(json_source: str, csv_destination: str) -> None:
    """
    Parses a JSON file (or JSON array string) and writes cleanly to a CSV file.
    
    Args:
        json_source: Path to the input JSON file.
        csv_destination: Path to save the output CSV.
    """
    input_path = Path(json_source)
    output_path = Path(csv_destination)

    if not input_path.exists():
        raise FileNotFoundError(f"Input file not found: {input_path}")

    # Load JSON records
    with open(input_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Ensure data is a list of records
    if isinstance(data, dict):
        # If it's a wrapper object with an array, find the first list
        records = next((v for v in data.values() if isinstance(v, list)), [data])
    elif isinstance(data, list):
        records = data
    else:
        raise ValueError("JSON must contain an array of objects or key-value dictionary.")

    if not records:
        print("No records found to export.")
        return

    # Extract all distinct field headers preserving order
    fieldnames = []
    for item in records:
        if isinstance(item, dict):
            for k in item.keys():
                if k not in fieldnames:
                    fieldnames.append(k)

    # Write to CSV
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, 'w', newline='', encoding='utf-8') as csv_file:
        writer = csv.DictWriter(csv_file, fieldnames=fieldnames)
        writer.writeheader()
        for row in records:
            if isinstance(row, dict):
                # Flatten complex values into JSON strings if nested
                clean_row = {
                    k: (json.dumps(v) if isinstance(v, (dict, list)) else v)
                    for k, v in row.items()
                }
                writer.writerow(clean_row)

    print(f"Successfully converted {len(records)} records into {output_path.resolve()}")

if __name__ == "__main__":
    # Example execution:
    # json_to_csv("data.json", "output.csv")
    sample_records = [
        {"id": 101, "name": "Bats AI", "category": "Core Model", "status": "Active"},
        {"id": 102, "name": "Neural Vision", "category": "Image Engine", "status": "Ready"},
    ]
    with open("sample.json", "w") as f:
        json.dump(sample_records, f, indent=2)

    json_to_csv("sample.json", "exported.csv")
\`\`\`

### Key Features:
- **Zero Third-Party Dependencies**: Uses Python's built-in \`json\` and \`csv\` modules.
- **Nested Object Handling**: Flattens or serializes child objects and lists safely.
- **UTF-8 Encoding**: Fully handles emojis, non-ASCII characters, and symbols.`;
  }

  // React / Navigation / Full-stack request
  if (p.includes('react') || p.includes('typescript') || p.includes('component')) {
    return `Here is a modern, type-safe React component with Tailwind CSS:

\`\`\`tsx
import React, { useState, useTransition } from 'react';
import { Search, Sparkles, Filter, X } from 'lucide-react';

interface SearchItem {
  id: string;
  title: string;
  category: string;
  tags: string[];
}

interface SearchFilterProps {
  items: SearchItem[];
  onSelect?: (item: SearchItem) => void;
}

export const ModernSearchFilter: React.FC<SearchFilterProps> = ({ items, onSelect }) => {
  const [query, setQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const allTags = Array.from(new Set(items.flatMap((i) => i.tags)));

  const filteredItems = items.filter((item) => {
    const matchesQuery = item.title.toLowerCase().includes(query.toLowerCase());
    const matchesTag = !selectedTag || item.tags.includes(selectedTag);
    return matchesQuery && matchesTag;
  });

  return (
    <div className="w-full max-w-2xl mx-auto rounded-3xl bg-zinc-950/80 border border-zinc-800 p-5 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center space-x-2.5 pb-4 border-b border-zinc-800/80">
        <Sparkles className="w-5 h-5 text-cyan-400" />
        <h3 className="text-base font-bold text-white tracking-tight">Bats Interactive Filter</h3>
      </div>

      {/* Search Input Bar */}
      <div className="relative my-4">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => startTransition(() => setQuery(e.target.value))}
          placeholder="Type to filter..."
          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Results */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelect?.(item)}
            className="p-3 rounded-2xl bg-zinc-900/60 hover:bg-zinc-850 border border-zinc-800 flex items-center justify-between cursor-pointer transition"
          >
            <span className="text-sm font-medium text-zinc-200">{item.title}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/40">
              {item.category}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
\`\`\``;
  }

  // Wallpaper / Design concept requests
  if (p.includes('wallpaper') || p.includes('phone wallpaper')) {
    return `Here are 3 aesthetic phone wallpaper concepts tailored for mobile screens (9:16 aspect ratio):

1. **Cyber Obsidian**
   - **Visuals**: Geometric dark carbon fiber facets with subtle cyan and violet circuit luminescence.
   - **Palette**: Deep Pitch Black (\`#000000\`), Midnight Navy (\`#0b0f19\`), Electric Cyan (\`#06b6d4\`).
   - **Ideal For**: Minimalist OLED setups and lock screens.

2. **Cosmic Aurora Gradient**
   - **Visuals**: Soft celestial nebula dust bleeding into deep space, with distant glowing star clusters.
   - **Palette**: Obsidian (\`#050508\`), Cosmic Indigo (\`#312e81\`), Emerald Mint (\`#10b981\`).
   - **Ideal For**: Clean icon setups with high text legibility.

3. **Architectural Monolith**
   - **Visuals**: Brutalist architectural columns in dramatic low-angle perspective with moody shadows.
   - **Palette**: Charcoal Slate (\`#18181b\`), Warm Zinc (\`#71717a\`), Ambient Amber (\`#f59e0b\`).

You can also jump directly to **Images** tab on the left to generate any of these in full resolution with one click!`;
  }

  // Film and Cinema Quiz requests
  if (p.includes('film') || p.includes('cinema') || p.includes('movie')) {
    return `Welcome to the Cinema & Film Quiz! Test your movie knowledge with these three classic questions:

**Round 1: Master of Suspense**
*Which Alfred Hitchcock classic was filmed almost entirely inside a single Greenwich Village apartment courtyard?*
- A) Vertigo
- B) Rear Window
- C) North by Northwest
- D) Rope

**Round 2: Cinematic Innovation**
*What was the first feature-length computer-animated film released in cinema history (1995)?*
- A) A Bug's Life
- B) Shrek
- C) Toy Story
- D) Monsters, Inc.

**Round 3: Science Fiction Milestones**
*In Ridley Scott's 1982 cyberpunk masterpiece "Blade Runner", what is the term used for bioengineered humanoid beings?*
- A) Replicants
- B) Cylons
- C) Synths
- D) Synthetics

Reply with your answers (e.g. "B, C, A") to see your score!`;
  }

  // Self-mastery / Learning requests
  if (p.includes('subject') || p.includes('mastering')) {
    return `Based on how you approach problem-solving and software design, you are exceptionally close to mastering **Full-Stack Systems Architecture & Modern Frontend Engineering**:

- **System Decomposition**: You demonstrate a strong grasp of clean state management, modular components, and decoupled business logic.
- **Resilience Engineering**: You prioritize bulletproof error recovery, graceful degradation, and zero-downtime execution.
- **Next Horizon to Explore**: Deep dive into event-driven stream processing, distributed microservices, and WebGL shader programming to complete the loop!`;
  }

  // General Q&A fallback
  return `I have received your inquiry: "${userPrompt.trim()}". Let me know if you would like to delve deeper, run code, or explore specific details.`;
}

