#!/usr/bin/env node

/**
 * SpecCraft CLI for easy installation and management
 */

const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const readline = require("readline");

const command = process.argv[2];

function showHelp() {
  console.log(`
🎯 SpecCraft - AI-powered specification creation for Claude Code

Usage:
  npx @opensaas/speccraft <command>

Commands:
  init <name>     Create new project with SpecCraft slash commands
  install         Add SpecCraft to Claude Code
  uninstall       Remove SpecCraft from Claude Code
  start           Start the MCP server directly
  help            Show this help message

Examples:
  npx @opensaas/speccraft init my-project
  npx @opensaas/speccraft install
  npx @opensaas/speccraft start

After installation, use these commands in Claude Code:
  /speccraft:new "Feature Name" "Description"
  /speccraft:list
  /speccraft:continue <session-id>
`);
}

function getServerPath() {
  // When installed via npm, the main entry is in the package
  const packageDir = path.dirname(require.resolve("../package.json"));
  return path.join(packageDir, "dist/mcp-server/mcp-server/index.js");
}

function getCommandsPath() {
  // Path to the slash commands in the package
  const packageDir = path.dirname(require.resolve("../package.json"));
  return path.join(packageDir, ".claude/commands");
}

async function promptForProjectName() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question('Enter project name: ', (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function copyDirectory(src, dest) {
  try {
    await fs.promises.mkdir(dest, { recursive: true });
    const files = await fs.promises.readdir(src);
    
    for (const file of files) {
      const srcPath = path.join(src, file);
      const destPath = path.join(dest, file);
      const stat = await fs.promises.stat(srcPath);
      
      if (stat.isDirectory()) {
        await copyDirectory(srcPath, destPath);
      } else {
        await fs.promises.copyFile(srcPath, destPath);
      }
    }
  } catch (error) {
    throw new Error(`Failed to copy directory: ${error.message}`);
  }
}

async function initProject() {
  let projectName = process.argv[3];
  
  if (!projectName) {
    console.log('🎯 SpecCraft Project Initialization');
    console.log('');
    projectName = await promptForProjectName();
    
    if (!projectName) {
      console.error('❌ Project name is required');
      process.exit(1);
    }
  }

  const projectPath = path.resolve(projectName);
  const claudeDir = path.join(projectPath, '.claude');
  const commandsDir = path.join(claudeDir, 'commands');
  
  try {
    // Check if project directory already exists
    if (fs.existsSync(projectPath)) {
      console.error(`❌ Directory '${projectName}' already exists`);
      process.exit(1);
    }

    console.log(`🚀 Creating SpecCraft project: ${projectName}`);
    console.log('');

    // Create project directory
    await fs.promises.mkdir(projectPath, { recursive: true });
    
    // Create .claude directory structure
    await fs.promises.mkdir(commandsDir, { recursive: true });
    
    // Copy slash commands
    const sourceCommandsPath = getCommandsPath();
    if (fs.existsSync(sourceCommandsPath)) {
      await copyDirectory(sourceCommandsPath, commandsDir);
      console.log('✅ Copied SpecCraft slash commands');
    } else {
      console.log('⚠️  Warning: SpecCraft commands not found in package');
    }

    // Create initial MCP configuration
    const mcpConfig = {
      mcpServers: {
        speccraft: {
          command: "npx",
          args: ["@opensaas/speccraft", "start"]
        }
      }
    };
    
    const configPath = path.join(claudeDir, 'claude_desktop_config.json');
    await fs.promises.writeFile(configPath, JSON.stringify(mcpConfig, null, 2));
    console.log('✅ Created Claude MCP configuration');

    // Create basic settings
    const settings = {
      permissions: {
        allow: [
          "mcp__speccraft__spec_new",
          "mcp__speccraft__spec_continue",
          "mcp__speccraft__spec_answer", 
          "mcp__speccraft__spec_generate",
          "mcp__speccraft__spec_validate",
          "mcp__speccraft__spec_status",
          "mcp__speccraft__spec_list",
          "mcp__speccraft__spec_follow_up"
        ],
        deny: [],
        ask: []
      }
    };
    
    const settingsPath = path.join(claudeDir, 'settings.local.json');
    await fs.promises.writeFile(settingsPath, JSON.stringify(settings, null, 2));
    console.log('✅ Created permissions configuration');

    // Create README
    const readme = `# ${projectName}

A SpecCraft-enabled project for AI-powered specification creation.

## Getting Started

1. **Open in Claude Code**: Navigate to this directory and open Claude Code
2. **Install SpecCraft MCP**: Run \`npx @opensaas/speccraft install\`
3. **Start creating specs**: Use \`/speccraft:new "Feature Name" "Description"\`

## Available Commands

- \`/speccraft:new\` - Start a new specification session
- \`/speccraft:list\` - List all active sessions
- \`/speccraft:continue\` - Continue an existing session
- \`/speccraft:answer\` - Answer the current question
- \`/speccraft:generate\` - Generate markdown specification
- \`/speccraft:validate\` - Validate specification completeness
- \`/speccraft:status\` - Get session status
- \`/speccraft:follow-up\` - Generate AI follow-up questions

## Specifications

Generated specifications will be saved in \`./specs/\` with numbered folders:
- \`./specs/001_feature_name/\`
- \`./specs/002_another_feature/\`
- etc.

## Learn More

Visit [SpecCraft documentation](https://github.com/opensaas/speccraft) for more information.
`;

    const readmePath = path.join(projectPath, 'README.md');
    await fs.promises.writeFile(readmePath, readme);
    console.log('✅ Created README.md');

    console.log('');
    console.log(`🎉 Project '${projectName}' created successfully!`);
    console.log('');
    console.log('Next steps:');
    console.log(`  cd ${projectName}`);
    console.log('  npx @opensaas/speccraft install');
    console.log('  # Open Claude Code and use /speccraft:new');
    console.log('');

  } catch (error) {
    console.error(`❌ Failed to create project: ${error.message}`);
    process.exit(1);
  }
}

function install() {
  const serverPath = getServerPath();

  if (!fs.existsSync(serverPath)) {
    console.error(
      "❌ Error: MCP server not found. Please run npm install first.",
    );
    process.exit(1);
  }

  console.log("🚀 Installing SpecCraft to Claude Code...");
  console.log("");

  const claudeCommand = [
    "claude",
    "mcp",
    "add",
    "speccraft",
    "--",
    "node",
    serverPath,
  ];

  console.log("Running:", claudeCommand.join(" "));
  console.log("");

  const child = spawn(claudeCommand[0], claudeCommand.slice(1), {
    stdio: "inherit",
  });

  child.on("close", (code) => {
    if (code === 0) {
      console.log("");
      console.log("✅ SpecCraft installed successfully!");
      console.log("");
      console.log("🎯 Quick start:");
      console.log('  /speccraft:new "Test Feature" "A simple test feature"');
      console.log("");
      console.log("📚 All commands:");
      console.log("  /speccraft:list         - List active sessions");
      console.log("  /speccraft:continue     - Resume a session");
      console.log("  /speccraft:answer       - Answer current question");
      console.log("  /speccraft:generate     - Create specification");
      console.log("  /speccraft:validate     - Validate quality");
      console.log("  /speccraft:status       - Check progress");
      console.log("  /speccraft:follow-up    - AI enhancement");
    } else {
      console.error(
        "❌ Installation failed. Make sure Claude Code is installed.",
      );
      process.exit(1);
    }
  });
}

function uninstall() {
  console.log("🗑️  Removing SpecCraft from Claude Code...");

  const child = spawn("claude", ["mcp", "remove", "speccraft"], {
    stdio: "inherit",
  });

  child.on("close", (code) => {
    if (code === 0) {
      console.log("✅ SpecCraft removed successfully!");
    } else {
      console.error("❌ Removal failed.");
      process.exit(1);
    }
  });
}

function startServer() {
  const serverPath = getServerPath();

  if (!fs.existsSync(serverPath)) {
    console.error("❌ Error: MCP server not found.");
    process.exit(1);
  }

  console.log("🚀 Starting SpecCraft MCP server...");
  const child = spawn("node", [serverPath], {
    stdio: "inherit",
  });

  child.on("close", (code) => {
    console.log(`Server exited with code ${code}`);
  });
}

switch (command) {
  case "init":
    initProject();
    break;
  case "install":
    install();
    break;
  case "uninstall":
    uninstall();
    break;
  case "start":
    startServer();
    break;
  case "help":
  case "--help":
  case "-h":
    showHelp();
    break;
  default:
    if (!command) {
      showHelp();
    } else {
      console.error(`Unknown command: ${command}`);
      showHelp();
      process.exit(1);
    }
}
