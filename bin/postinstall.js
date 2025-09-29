#!/usr/bin/env node

/**
 * Post-install script to show installation instructions
 */

const path = require("path");

console.log("📦 SpecCraft installed successfully!");
console.log("");

// Check if the MCP server exists
const serverPath = path.join(
  __dirname,
  "..",
  "dist/mcp-server/mcp-server/index.js",
);
console.log("✅ MCP server ready at:", serverPath);
console.log("");
console.log("🚀 To install to Claude Code, run:");
console.log("  npx @opensaas/speccraft install");
console.log("");
console.log("Or manually add with:");
console.log(`  claude mcp add speccraft -- node ${serverPath}`);
console.log("");
console.log("📚 Available commands after installation:");
console.log('  /speccraft:new "Feature Name" "Description"');
console.log("  /speccraft:build <spec-path>");
console.log("  /speccraft:validate <spec-path>");
console.log("  /speccraft:help <topic>");
