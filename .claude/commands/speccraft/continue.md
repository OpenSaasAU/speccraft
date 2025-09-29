---
description: Resume an existing specification session
mcp_server: "speccraft"
args:
  - name: session_id
    description: The session ID to resume
    required: true
---

# Continue Specification Session

Resume an existing SpecCraft specification session from where you left off.

## Usage

```
/speccraft:continue <session-id>
```

## Examples

```
/speccraft:continue session_1704123456_abc123
```

## What it does

1. **Loads Session**: Retrieves your saved progress from `.speccraft/sessions.json`
2. **Shows Progress**: Displays how many questions you've completed
3. **Next Question**: Presents the next unanswered question
4. **Context Preservation**: Maintains all your previous answers

## Session Information

When you continue a session, you'll see:
- **Feature Title**: The name of the feature being specified
- **Progress**: Questions answered out of total questions
- **Current Question**: The next question to answer
- **Available Actions**: Commands you can use next

## Next Steps

From a continued session, you can:
- Answer the current question with `/speccraft:answer <session-id> "your answer"`
- Get AI-powered follow-up questions with `/speccraft:follow-up <session-id>`
- Check detailed status with `/speccraft:status <session-id>`
- Generate the specification when complete with `/speccraft:generate <session-id>`

## Finding Session IDs

If you don't remember your session ID:
- Use `/speccraft:list` to see all active sessions
- Session IDs are also shown when you create a new session with `/speccraft:new`