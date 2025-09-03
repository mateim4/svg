// Popular Icon Repositories with Custom Parsing Logic

export interface IconRepository {
  id: string;
  name: string;
  description: string;
  githubUrl: string;
  homepage?: string;
  license: string;
  iconCount: number;
  categories: string[];
  parserType: 'direct-svg' | 'build-output' | 'sprite-sheet' | 'json-manifest' | 'custom';
  structure: {
    iconPath: string;
    pattern?: string;
    sizes?: number[];
    variants?: string[];
  };
  tags: string[];
  preview: string[];
}

export const ICON_REPOSITORIES: IconRepository[] = [
  {
    id: 'lucide',
    name: 'Lucide',
    description: 'Beautiful & consistent icon toolkit made by the community',
    githubUrl: 'https://github.com/lucide-icons/lucide',
    homepage: 'https://lucide.dev',
    license: 'ISC',
    iconCount: 1400,
    categories: ['General Purpose', 'UI', 'Interface'],
    parserType: 'direct-svg',
    structure: {
      iconPath: 'icons/',
      pattern: '*.svg',
      sizes: [24],
      variants: ['outline']
    },
    tags: ['outline', 'minimal', 'consistent', 'open-source'],
    preview: ['home', 'user', 'search', 'heart', 'star']
  },
  
  {
    id: 'heroicons',
    name: 'Heroicons',
    description: 'A set of free MIT-licensed high-quality SVG icons for UI development',
    githubUrl: 'https://github.com/tailwindlabs/heroicons',
    homepage: 'https://heroicons.com',
    license: 'MIT',
    iconCount: 292,
    categories: ['UI', 'Interface', 'Web'],
    parserType: 'direct-svg',
    structure: {
      iconPath: 'src/',
      pattern: '*/*.svg',
      sizes: [20, 24],
      variants: ['outline', 'solid', 'mini']
    },
    tags: ['tailwind', 'outline', 'solid', 'web'],
    preview: ['academic-cap', 'archive-box', 'arrow-right', 'bell', 'camera']
  },

  {
    id: 'feather',
    name: 'Feather',
    description: 'Simply beautiful open source icons',
    githubUrl: 'https://github.com/feathericons/feather',
    homepage: 'https://feathericons.com',
    license: 'MIT',
    iconCount: 287,
    categories: ['General Purpose', 'Minimal'],
    parserType: 'direct-svg',
    structure: {
      iconPath: 'icons/',
      pattern: '*.svg',
      sizes: [24],
      variants: ['outline']
    },
    tags: ['minimal', 'outline', 'clean', 'consistent'],
    preview: ['activity', 'airplay', 'alert-circle', 'archive', 'arrow-right']
  },

  {
    id: 'phosphor',
    name: 'Phosphor Icons',
    description: 'A flexible icon family for interfaces, diagrams, presentations. Uses build system to generate optimized SVGs from source.',
    githubUrl: 'https://github.com/phosphor-icons/core',
    homepage: 'https://phosphoricons.com',
    license: 'MIT',
    iconCount: 6848,
    categories: ['General Purpose', 'Interface', 'Diagrams'],
    parserType: 'build-output',
    structure: {
      iconPath: 'assets/',
      pattern: '*/*.svg',
      sizes: [256],
      variants: ['thin', 'light', 'regular', 'bold', 'fill', 'duotone']
    },
    tags: ['versatile', 'multiple-weights', 'comprehensive'],
    preview: ['address-book', 'airplane', 'alarm', 'anchor', 'archive']
  },

  {
    id: 'tabler-icons',
    name: 'Tabler Icons',
    description: 'Over 4950 free SVG icons for web development',
    githubUrl: 'https://github.com/tabler/tabler-icons',
    homepage: 'https://tabler-icons.io',
    license: 'MIT',
    iconCount: 4950,
    categories: ['UI', 'Interface', 'Web'],
    parserType: 'direct-svg',
    structure: {
      iconPath: 'icons/',
      pattern: '*.svg',
      sizes: [24],
      variants: ['outline', 'filled']
    },
    tags: ['comprehensive', 'outline', 'filled', 'ui'],
    preview: ['home', 'user', 'settings', 'mail', 'phone']
  },

  {
    id: 'fluent-system-icons',
    name: 'Fluent System Icons',
    description: 'Microsoft\'s official icon library for Fluent Design System. Original assets in SVG and PDF formats, with metadata.json files.',
    githubUrl: 'https://github.com/microsoft/fluentui-system-icons',
    homepage: 'https://github.com/microsoft/fluentui-system-icons',
    license: 'MIT',
    iconCount: 441, // Real count: 31 icons, 1 with 3 variants + 30 with 2 variants = 441 total variants
    categories: ['System', 'Microsoft', 'Enterprise'],
    parserType: 'custom',
    structure: {
      iconPath: 'assets/',
      pattern: '*/*/*.svg',
      sizes: [12, 16, 20, 24, 28, 32, 48],
      variants: ['regular', 'filled', 'light']
    },
    tags: ['microsoft', 'fluent', 'system', 'enterprise'],
    preview: ['add', 'arrow_right', 'calendar', 'document', 'home']
  },

  {
    id: 'radix-icons',
    name: 'Radix Icons',
    description: 'A crisp set of 15×15 icons designed by the Radix team',
    githubUrl: 'https://github.com/radix-ui/icons',
    homepage: 'https://icons.radix-ui.com',
    license: 'MIT',
    iconCount: 318,
    categories: ['UI', 'Minimal', 'System'],
    parserType: 'build-output',
    structure: {
      iconPath: 'packages/radix-icons/icons/',
      pattern: '*.svg',
      sizes: [15],
      variants: ['regular']
    },
    tags: ['minimal', 'ui', 'radix', 'small'],
    preview: ['arrow-right', 'check', 'cross-1', 'gear', 'home']
  },

  {
    id: 'ionicons',
    name: 'Ionicons',
    description: 'Premium designed icons for use in web, iOS, Android, and desktop apps. Built from TypeScript source with multiple output formats.',
    githubUrl: 'https://github.com/ionic-team/ionicons',
    homepage: 'https://ionicons.com',
    license: 'MIT',
    iconCount: 1338,
    categories: ['Mobile', 'Web', 'Ionic'],
    parserType: 'build-output',
    structure: {
      iconPath: 'src/svg/',
      pattern: '*.svg',
      sizes: [512],
      variants: ['outline', 'filled', 'sharp']
    },
    tags: ['ionic', 'mobile', 'web', 'multi-platform'],
    preview: ['add', 'arrow-forward', 'calendar', 'home', 'person']
  },

  {
    id: 'bootstrap-icons',
    name: 'Bootstrap Icons',
    description: 'Official open source SVG icon library for Bootstrap',
    githubUrl: 'https://github.com/twbs/icons',
    homepage: 'https://icons.getbootstrap.com',
    license: 'MIT',
    iconCount: 2000,
    categories: ['Bootstrap', 'Web', 'UI'],
    parserType: 'direct-svg',
    structure: {
      iconPath: 'icons/',
      pattern: '*.svg',
      sizes: [16],
      variants: ['regular', 'filled']
    },
    tags: ['bootstrap', 'web', 'comprehensive', 'ui'],
    preview: ['house', 'person', 'gear', 'envelope', 'phone']
  },

  {
    id: 'material-symbols',
    name: 'Material Symbols',
    description: 'Google\'s latest icon set with 2500+ glyphs in multiple styles. Generated from font files and design tokens.',
    githubUrl: 'https://github.com/google/material-design-icons',
    homepage: 'https://fonts.google.com/icons',
    license: 'Apache-2.0',
    iconCount: 2500,
    categories: ['Material Design', 'Google', 'System'],
    parserType: 'json-manifest',
    structure: {
      iconPath: 'symbols/',
      pattern: '*/*.svg',
      sizes: [20, 24, 40, 48],
      variants: ['outlined', 'rounded', 'sharp']
    },
    tags: ['material', 'google', 'comprehensive', 'design-system'],
    preview: ['home', 'person', 'settings', 'search', 'favorite']
  }
];

// Repository categories for filtering
export const REPOSITORY_CATEGORIES = [
  'General Purpose',
  'UI',
  'Interface', 
  'Web',
  'Mobile',
  'System',
  'Minimal',
  'Enterprise',
  'Bootstrap',
  'Material Design',
  'Microsoft',
  'Google',
  'Ionic',
  'Diagrams'
] as const;

// License types
export const LICENSE_TYPES = [
  'MIT',
  'ISC', 
  'Apache-2.0'
] as const;