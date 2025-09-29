---
description: List all active SpecCraft specification sessions
mcp_server: "speccraft"
---

# List Active Sessions

View all active SpecCraft specification sessions with their current progress.

## Usage

```
/speccraft:list
```

## No Parameters Required

This command takes no arguments and shows all sessions stored in your current project.

## Session Overview

For each active session, you'll see:
- **Session ID**: Unique identifier for resuming work
- **Feature Title**: Name of the feature being specified
- **Progress**: Completion percentage (answered/total questions)
- **Status**: Current state of the session

## Example Output

### With Active Sessions
```
📝 Active SpecCraft Sessions

- session_1704123456_abc123: User Authentication (85% complete) ✅
- session_1704123789_def456: Search Feature (45% complete) 📝
- session_1704124012_ghi789: Payment Processing (100% complete) ✅
- session_1704124234_jkl012: Admin Dashboard (20% complete) 📝

Quick Actions:
- Continue: /speccraft:continue <session-id>
- Status: /speccraft:status <session-id>
- Generate: /speccraft:generate <session-id> (for complete sessions)
```

### No Active Sessions
```
📝 No Active Sessions

No specification sessions found. Start a new one with:
/speccraft:new "Feature Title" "Feature description"
```

## Session Status Indicators

- **📝 In Progress**: Questions remaining to be answered
- **✅ Complete**: All questions answered, ready for generation

## Use Cases

### Project Management
- **Overview**: See all features being specified in your project
- **Planning**: Prioritize which specifications to complete first
- **Team Coordination**: Track multiple team members' specification work

### Session Recovery
- **Find Sessions**: Locate session IDs when you forget them
- **Resume Work**: Identify which sessions need attention
- **Cleanup**: See old or completed sessions that can be archived

### Workflow Organization
- **Batch Processing**: Work on multiple specifications systematically
- **Progress Tracking**: Monitor overall specification progress
- **Quality Gates**: Ensure all features are properly specified before development

## Session Storage

Sessions are automatically stored in:
```
.speccraft/
└── sessions.json
```

## Quick Actions from List

After viewing the list, you can immediately:
- **Continue** any in-progress session using its session ID
- **Check status** for detailed progress information
- **Generate specifications** for completed sessions
- **Start new sessions** if none exist

This command is your central hub for managing all specification work in your project and ensures you never lose track of important feature specifications.