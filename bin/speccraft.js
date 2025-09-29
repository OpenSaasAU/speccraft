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
  update          Update SpecCraft MCP server and slash commands
  uninstall       Remove SpecCraft from Claude Code
  start           Start the MCP server directly
  help            Show this help message

Examples:
  npx @opensaas/speccraft init my-project
  npx @opensaas/speccraft install
  npx @opensaas/speccraft update
  npx @opensaas/speccraft start

After installation, use these commands in Claude Code:
  /speccraft:new "Feature Name" "Description"
  /speccraft:build spec.md
  /speccraft:validate spec.md
  /speccraft:help text
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
  const commandsPath = path.join(packageDir, ".claude/commands");
  
  // If not found in package (during development), try relative to this script
  if (!fs.existsSync(commandsPath)) {
    const devCommandsPath = path.join(__dirname, "../.claude/commands");
    if (fs.existsSync(devCommandsPath)) {
      return devCommandsPath;
    }
  }
  
  return commandsPath;
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
          "mcp__speccraft__spec_answer", 
          "mcp__speccraft__spec_generate",
          "mcp__speccraft__spec_validate",
          "mcp__speccraft__spec_build",
          "mcp__speccraft__spec_help",
          "mcp__speccraft__spec_fetch_docs",
          "mcp__speccraft__spec_fetch_example"
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

SpecCraft uses just **4 essential commands**:

- \`/speccraft:new\` - **Interactive specification** (handles entire conversation)
- \`/speccraft:build\` - **Implementation guidance** from specification
- \`/speccraft:validate\` - **Quality assessment** and recommendations
- \`/speccraft:help\` - **Documentation & examples** (live Keystone.js docs)

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
      "❌ Error: MCP server not found. Please run pnpm install first.",
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
      console.log("📚 Essential commands (4 total):");
      console.log("  /speccraft:new          - Interactive specification (full conversation)");
      console.log("  /speccraft:build        - Implementation guidance");
      console.log("  /speccraft:validate     - Quality assessment");
      console.log("  /speccraft:help         - Live documentation & examples");
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

async function updateSpecCraft() {
  console.log("🔄 Updating SpecCraft...");
  
  // Show current version
  try {
    const packageJson = require("../package.json");
    console.log(`📦 Current version: ${packageJson.version}`);
  } catch (error) {
    console.log("📦 Version information unavailable");
  }
  console.log("");

  // Check if current project has .claude directory
  const claudeDir = path.resolve('.claude');
  const hasLocalCommands = fs.existsSync(claudeDir);

  if (hasLocalCommands) {
    console.log("📁 Found local .claude directory - updating slash commands...");
    
    try {
      // Backup existing commands
      const backupDir = path.join(claudeDir, 'commands.backup.' + Date.now());
      const commandsDir = path.join(claudeDir, 'commands');
      
      if (fs.existsSync(commandsDir)) {
        await copyDirectory(commandsDir, backupDir);
        console.log(`✅ Backed up existing commands to: ${path.basename(backupDir)}`);
        
        // Remove old commands
        await fs.promises.rm(commandsDir, { recursive: true, force: true });
      }

      // Copy new commands
      const sourceCommandsPath = getCommandsPath();
      if (fs.existsSync(sourceCommandsPath)) {
        await copyDirectory(sourceCommandsPath, commandsDir);
        console.log("✅ Updated slash commands to latest version");
      } else {
        console.log("⚠️  Warning: Latest SpecCraft commands not found in package");
      }

      // Update permissions in settings if they exist
      const settingsPath = path.join(claudeDir, 'settings.local.json');
      if (fs.existsSync(settingsPath)) {
        try {
          const settings = JSON.parse(await fs.promises.readFile(settingsPath, 'utf8'));
          
          // Update with current permissions
          const currentPermissions = [
            "mcp__speccraft__spec_new",
            "mcp__speccraft__spec_answer", 
            "mcp__speccraft__spec_generate",
            "mcp__speccraft__spec_validate",
            "mcp__speccraft__spec_build",
            "mcp__speccraft__spec_help",
            "mcp__speccraft__spec_fetch_docs",
            "mcp__speccraft__spec_fetch_example"
          ];

          settings.permissions = settings.permissions || {};
          settings.permissions.allow = currentPermissions;
          
          await fs.promises.writeFile(settingsPath, JSON.stringify(settings, null, 2));
          console.log("✅ Updated permissions configuration");
        } catch (error) {
          console.log("⚠️  Could not update permissions:", error.message);
        }
      }

    } catch (error) {
      console.error(`❌ Failed to update local commands: ${error.message}`);
    }
  }

  // Update the MCP server
  console.log("🔄 Updating MCP server in Claude Code...");
  
  const serverPath = getServerPath();
  if (!fs.existsSync(serverPath)) {
    console.error("❌ Error: MCP server not found. Please run pnpm install first.");
    process.exit(1);
  }

  // Remove existing MCP server
  console.log("🗑️  Removing old MCP server...");
  const removeChild = spawn("claude", ["mcp", "remove", "speccraft"], {
    stdio: "pipe" // Capture output instead of inherit to avoid noise
  });

  removeChild.on("close", (removeCode) => {
    // Re-add with new server path (don't check remove exit code as it may not exist)
    console.log("➕ Adding updated MCP server...");
    
    const addCommand = [
      "claude",
      "mcp", 
      "add",
      "speccraft",
      "--",
      "node",
      serverPath
    ];

    const addChild = spawn(addCommand[0], addCommand.slice(1), {
      stdio: "inherit"
    });

    addChild.on("close", (addCode) => {
      if (addCode === 0) {
        console.log("");
        console.log("✅ SpecCraft updated successfully!");
        console.log("");
        console.log("🔄 Changes in this update:");
        console.log("  • Latest MCP server with bug fixes and improvements");
        console.log("  • Updated slash commands (4 essential commands)");
        console.log("  • Enhanced error handling and documentation");
        console.log("  • Live Keystone.js documentation fetching");
        console.log("");
        console.log("📚 Available commands:");
        console.log("  /speccraft:new          - Interactive specification creation");
        console.log("  /speccraft:build        - Implementation guidance");  
        console.log("  /speccraft:validate     - Quality assessment");
        console.log("  /speccraft:help         - Live documentation lookup");
        console.log("");
        console.log("🚀 Ready to use! Try: /speccraft:new \"My Feature\" \"Feature description\"");
      } else {
        console.error("❌ Failed to add updated MCP server.");
        console.error("Try running 'npx @opensaas/speccraft install' manually.");
        process.exit(1);
      }
    });
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
  case "update":
    updateSpecCraft();
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
