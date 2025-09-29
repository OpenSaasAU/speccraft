---
description: Start a new feature specification session
mcp_server: "speccraft"
args:
  - name: title
    description: Feature title
    required: true
  - name: description
    description: Brief feature description
    required: true
---

# Start New Specification

Creates a new SpecCraft specification session with an interactive questionnaire to gather comprehensive feature requirements.

## Usage

```
/speccraft:new "Feature Title" "Brief description of the feature"
```

## Examples

```
/speccraft:new "User Authentication" "Add login and registration functionality"
```

```
/speccraft:new "Search Feature" "Implement full-text search across products"
```

## What it does

1. **Creates Session**: Generates a unique session ID for tracking progress
2. **Initializes Questionnaire**: Sets up the interactive Q&A process
3. **First Question**: Presents the first question to begin specification
4. **Session Storage**: Saves session data to `.speccraft/sessions.json`

## Next Steps

After creating a session, you can:
- Answer questions with `/speccraft:answer <session-id> "your answer"`
- Continue the session with `/speccraft:continue <session-id>`
- Get AI follow-up questions with `/speccraft:follow-up <session-id>`

The questionnaire covers:
- Feature overview and business value
- User interactions and workflows
- Technical requirements and constraints
- UI/UX specifications
- Performance and security considerations