export const site = {
  name: 'GenXAI',
  tagline: 'Graph-native agentic AI framework',
  description:
    'GenXAI is an advanced agentic AI framework with graph-based orchestration, multi-layer memory, extensible tools, and an enterprise-grade path to production.',
  links: {
    github: 'https://github.com/irsal2012/GenXAI',
    docsIndexInRepo:
      'https://github.com/irsal2012/GenXAI/blob/main/docs/DOCS_INDEX.md',
  },
} as const;

export type SiteConfig = typeof site;
