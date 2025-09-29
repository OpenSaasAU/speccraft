export interface DocumentationLookup {
  topic: string;
  content: string;
  examples: string[];
  relatedTopics: string[];
  source?: string;
}

export interface GitHubDocFetchResult {
  success: boolean;
  content?: string;
  error?: string;
}

export class KeystoneDocumentationProvider {
  private readonly KEYSTONE_DOCS_BASE = 'https://raw.githubusercontent.com/keystonejs/keystone/main/docs/content/docs';
  private readonly KEYSTONE_EXAMPLES_BASE = 'https://raw.githubusercontent.com/keystonejs/keystone/main/examples';
  private documentationCache = new Map<string, DocumentationLookup>();

  constructor() {
    // No longer initializing hardcoded documentation
  }

  async lookup(topic: string): Promise<DocumentationLookup | null> {
    try {
      // Check cache first
      if (this.documentationCache.has(topic)) {
        return this.documentationCache.get(topic)!;
      }

      // Try to fetch from GitHub
      const result = await this.fetchDocumentationFromGitHub(topic);
      if (result) {
        this.documentationCache.set(topic, result);
        return result;
      }

      return null;
    } catch (error) {
      console.warn(`Error in documentation lookup for topic "${topic}":`, error);
      return null;
    }
  }

  async getFieldDocumentation(fieldType: string): Promise<DocumentationLookup | null> {
    return this.fetchFromGitHub(`fields/${fieldType}`, fieldType);
  }

  async getHookDocumentation(hookType: string): Promise<DocumentationLookup | null> {
    return this.fetchFromGitHub(`guides/hooks`, hookType);
  }

  async getAccessPatternDocumentation(pattern: string): Promise<DocumentationLookup | null> {
    return this.fetchFromGitHub(`guides/access-control`, pattern);
  }

  async getSchemaPatterns(): Promise<DocumentationLookup | null> {
    return this.fetchFromGitHub(`guides/schema`, 'schema-patterns');
  }

  async getExample(exampleName: string, filePath?: string): Promise<DocumentationLookup | null> {
    const mappedExampleName = this.mapExampleName(exampleName);
    const path = filePath ? `${mappedExampleName}/${filePath}` : mappedExampleName;
    return this.fetchExampleFromGitHub(path, exampleName);
  }

  getAllTopics(): string[] {
    // Return known Keystone topics - these are common doc paths
    return [
      'fields/text', 'fields/relationship', 'fields/select', 'fields/integer',
      'fields/float', 'fields/checkbox', 'fields/timestamp', 'fields/image',
      'fields/file', 'fields/json', 'fields/virtual',
      'guides/schema', 'guides/access-control', 'guides/hooks', 'guides/admin-ui',
      'guides/testing', 'guides/deployment', 'guides/database'
    ];
  }

  async fetchFromGitHub(docPath: string, topic: string): Promise<DocumentationLookup | null> {
    try {
      const url = `${this.KEYSTONE_DOCS_BASE}/${docPath}.md`;
      const response = await fetch(url);
      
      if (!response.ok) {
        return null;
      }

      const content = await response.text();
      return this.parseMarkdownToDocumentation(content, topic, url);
    } catch (error) {
      console.warn(`Failed to fetch documentation for ${docPath}:`, error);
      return null;
    }
  }

  private async fetchExampleFromGitHub(examplePath: string, topic: string): Promise<DocumentationLookup | null> {
    try {
      const url = `${this.KEYSTONE_EXAMPLES_BASE}/${examplePath}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        return null;
      }

      const content = await response.text();
      return {
        topic: `Example: ${topic}`,
        content: `**Example from Keystone.js repository:**\n\n\`\`\`\n${content}\n\`\`\``,
        examples: [content],
        relatedTopics: [],
        source: url
      };
    } catch (error) {
      console.warn(`Failed to fetch example for ${examplePath}:`, error);
      return null;
    }
  }

  private async fetchDocumentationFromGitHub(topic: string): Promise<DocumentationLookup | null> {
    // Map common topic names to documentation paths
    const topicMappings: Record<string, string> = {
      'text': 'fields/text',
      'relationship': 'fields/relationship',
      'relationships': 'fields/relationship', // Handle plural
      'relation': 'fields/relationship', // Handle synonym
      'relations': 'fields/relationship', // Handle plural synonym
      'select': 'fields/select',
      'integer': 'fields/integer',
      'number': 'fields/integer', // Handle synonym
      'float': 'fields/float',
      'decimal': 'fields/float', // Handle synonym
      'checkbox': 'fields/checkbox',
      'boolean': 'fields/checkbox', // Handle synonym
      'bool': 'fields/checkbox', // Handle synonym
      'timestamp': 'fields/timestamp',
      'datetime': 'fields/timestamp', // Handle synonym
      'date': 'fields/timestamp', // Handle synonym
      'image': 'fields/image',
      'images': 'fields/image', // Handle plural
      'file': 'fields/file',
      'files': 'fields/file', // Handle plural
      'json': 'fields/json',
      'virtual': 'fields/virtual',
      'schema': 'guides/schema',
      'schemas': 'guides/schema', // Handle plural
      'hooks': 'guides/hooks',
      'hook': 'guides/hooks', // Handle singular
      'access-control': 'guides/access-control',
      'access': 'guides/access-control', // Handle short form
      'auth': 'guides/access-control', // Handle synonym
      'authentication': 'guides/access-control', // Handle synonym
      'authorization': 'guides/access-control', // Handle synonym
      'admin-ui': 'guides/admin-ui',
      'admin': 'guides/admin-ui', // Handle short form
      'ui': 'guides/admin-ui', // Handle short form
      'testing': 'guides/testing',
      'tests': 'guides/testing' // Handle plural
    };

    const docPath = topicMappings[topic] || topic;
    return this.fetchFromGitHub(docPath, topic);
  }

  private mapExampleName(exampleName: string): string {
    // Map common example names to actual Keystone example directory names
    const exampleMappings: Record<string, string> = {
      'blog': 'usecase-blog',
      'todo': 'usecase-todo',
      'roles': 'usecase-roles',
      'versioning': 'usecase-versioning',
      'moderated-blog': 'usecase-blog-moderated',
      'ecommerce': 'framework-nextjs', // closest equivalent
      'nextjs': 'framework-nextjs',
      'remix': 'framework-remix',
      'astro': 'framework-astro',
      'custom-field': 'custom-field',
      'document-field': 'document-field',
      'auth': 'auth',
      'magic-link': 'auth-magic-link',
      'relationships': 'relationships',
      'virtual-field': 'virtual-field'
    };

    return exampleMappings[exampleName] || exampleName;
  }

  private parseMarkdownToDocumentation(markdown: string, topic: string, source: string): DocumentationLookup {
    // Extract title
    const titleMatch = markdown.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : topic;

    // Extract code examples
    const codeBlocks = markdown.match(/```[\s\S]*?```/g) || [];
    const examples = codeBlocks.map(block => block.replace(/```[\w]*\n?|```/g, '').trim());

    // Extract related topics from markdown links
    const linkMatches = markdown.match(/\[([^\]]+)\]\([^)]+\)/g) || [];
    const relatedTopics = linkMatches.map(link => {
      const match = link.match(/\[([^\]]+)\]/);
      return match ? match[1] : '';
    }).filter(topic => topic.length > 0);

    return {
      topic: title,
      content: markdown,
      examples,
      relatedTopics,
      source
    };
  }
}