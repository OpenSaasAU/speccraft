#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { SpecCraftMCPServer } from './speccraft-server.js';

const server = new Server(
  {
    name: 'speccraft-mcp-server',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Initialize SpecCraft MCP server
const specCraftServer = new SpecCraftMCPServer();

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'spec_new',
        description: 'Start a new feature specification questionnaire',
        inputSchema: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'Feature title',
            },
            description: {
              type: 'string',
              description: 'Brief feature description',
            },
          },
          required: ['title', 'description'],
        },
      },
      {
        name: 'spec_continue',
        description: 'Continue an existing specification session',
        inputSchema: {
          type: 'object',
          properties: {
            sessionId: {
              type: 'string',
              description: 'Session ID to continue',
            },
          },
          required: ['sessionId'],
        },
      },
      {
        name: 'spec_answer',
        description: 'Answer the current question in a specification session',
        inputSchema: {
          type: 'object',
          properties: {
            sessionId: {
              type: 'string',
              description: 'Session ID',
            },
            answer: {
              type: ['string', 'boolean', 'array'],
              description: 'Answer to the current question',
            },
          },
          required: ['sessionId', 'answer'],
        },
      },
      {
        name: 'spec_generate',
        description: 'Generate markdown specification from completed session',
        inputSchema: {
          type: 'object',
          properties: {
            sessionId: {
              type: 'string',
              description: 'Session ID to generate specification from',
            },
            outputPath: {
              type: 'string',
              description: 'Optional output file path',
            },
          },
          required: ['sessionId'],
        },
      },
      {
        name: 'spec_validate',
        description: 'Validate specification completeness using AI analysis',
        inputSchema: {
          type: 'object',
          properties: {
            filePath: {
              type: 'string',
              description: 'Path to specification markdown file',
            },
            sessionId: {
              type: 'string',
              description: 'Optional session ID for additional context',
            },
          },
          required: ['filePath'],
        },
      },
      {
        name: 'spec_status',
        description: 'Get status of a specification session',
        inputSchema: {
          type: 'object',
          properties: {
            sessionId: {
              type: 'string',
              description: 'Session ID to check',
            },
          },
          required: ['sessionId'],
        },
      },
      {
        name: 'spec_list',
        description: 'List all active specification sessions',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'spec_follow_up',
        description: 'Generate intelligent follow-up questions for a session',
        inputSchema: {
          type: 'object',
          properties: {
            sessionId: {
              type: 'string',
              description: 'Session ID',
            },
          },
          required: ['sessionId'],
        },
      },
      {
        name: 'spec_analyze',
        description: 'Analyze a specification file for complexity and recommendations',
        inputSchema: {
          type: 'object',
          properties: {
            specPath: {
              type: 'string',
              description: 'Path to the specification markdown file',
            },
          },
          required: ['specPath'],
        },
      },
      {
        name: 'spec_build',
        description: 'Build code from specification - intelligently creates new project or adds to existing',
        inputSchema: {
          type: 'object',
          properties: {
            specPath: {
              type: 'string',
              description: 'Path to the specification markdown file',
            },
            projectName: {
              type: 'string',
              description: 'Name for new project (optional, will use spec title)',
            },
            outputPath: {
              type: 'string',
              description: 'Target directory (optional, uses current directory)',
            },
          },
          required: ['specPath'],
        },
      },
      {
        name: 'spec_help',
        description: 'Get help documentation and examples for Keystone.js implementation',
        inputSchema: {
          type: 'object',
          properties: {
            topic: {
              type: 'string',
              description: 'Topic to get help for (field types, patterns, examples, etc.)',
            },
          },
          required: ['topic'],
        },
      },
      {
        name: 'spec_fetch_docs',
        description: 'Fetch latest Keystone.js documentation from GitHub for implementation',
        inputSchema: {
          type: 'object',
          properties: {
            docPath: {
              type: 'string',
              description: 'Path to documentation (e.g., "fields/text", "guides/access-control")',
            },
            section: {
              type: 'string',
              description: 'Specific section to fetch (optional)',
            },
          },
          required: ['docPath'],
        },
      },
      {
        name: 'spec_fetch_example',
        description: 'Fetch Keystone.js code examples from GitHub for reference',
        inputSchema: {
          type: 'object',
          properties: {
            exampleName: {
              type: 'string',
              description: 'Name of example to fetch (e.g., "blog", "ecommerce", "auth")',
            },
            filePath: {
              type: 'string',
              description: 'Specific file within example (optional, e.g., "schema.ts")',
            },
          },
          required: ['exampleName'],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'spec_new':
        return await specCraftServer.createNewSpecification(args as {
          title: string;
          description: string;
        });

      case 'spec_continue':
        return await specCraftServer.continueSpecification(args as {
          sessionId: string;
        });

      case 'spec_answer':
        return await specCraftServer.answerQuestion(args as {
          sessionId: string;
          answer: string | boolean | string[];
        });

      case 'spec_generate':
        return await specCraftServer.generateSpecification(args as {
          sessionId: string;
          outputPath?: string;
        });

      case 'spec_validate':
        return await specCraftServer.validateSpecification(args as {
          filePath: string;
          sessionId?: string;
        });

      case 'spec_status':
        return await specCraftServer.getSessionStatus(args as {
          sessionId: string;
        });

      case 'spec_list':
        return await specCraftServer.listSessions();

      case 'spec_follow_up':
        return await specCraftServer.generateFollowUpQuestions(args as {
          sessionId: string;
        });

      case 'spec_analyze':
        return await specCraftServer.analyzeSpecification(args as {
          specPath: string;
        });

      case 'spec_build':
        return await specCraftServer.buildFromSpecification(args as {
          specPath: string;
          projectName?: string;
          outputPath?: string;
        });

      case 'spec_help':
        return await specCraftServer.lookupDocumentation(args as {
          topic: string;
        });

      case 'spec_fetch_docs':
        return await specCraftServer.fetchKeystoneDocumentation(args as {
          docPath: string;
          section?: string;
        });

      case 'spec_fetch_example':
        return await specCraftServer.fetchKeystoneExample(args as {
          exampleName: string;
          filePath?: string;
        });

      default:
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${name}`
        );
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new McpError(ErrorCode.InternalError, errorMessage);
  }
});

// Start the server
const transport = new StdioServerTransport();
server.connect(transport);
console.error('SpecCraft MCP server running on stdio');