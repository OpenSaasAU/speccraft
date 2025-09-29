---
description: Get detailed status and progress for a specification session
mcp_server: "speccraft"
args:
  - name: session_id
    description: The session ID to get status for
    required: true
---

# Get Session Status

View detailed progress and status information for a SpecCraft specification session.

## Usage

```
/speccraft:status <session-id>
```

## Examples

```
/speccraft:status session_1704123456_abc123
```

## Detailed Information

### Session Metadata
- **Feature Title**: Name of the feature being specified
- **Description**: Initial feature description provided
- **Session ID**: Unique identifier for the session
- **Created**: When the session was first started
- **Last Updated**: Most recent activity timestamp

### Progress Tracking
- **Completion Status**: Questions answered vs. total questions
- **Progress Percentage**: Visual progress indicator
- **Current State**: In Progress 📝 or Complete ✅
- **Next Question**: What question to answer next (if incomplete)

### Response History
- **All Answers**: Complete list of questions you've answered
- **Answer Content**: Your specific responses to each question
- **Question Categories**: Functional, technical, UI/UX, etc.

## Example Status Output

```
📊 Session Status

Feature: User Authentication System
Description: Add secure login and registration functionality
Session ID: session_1704123456_abc123
Created: 2024-01-01 10:30:00
Updated: 2024-01-01 11:15:00

Progress: 12/20 (60%)
Status: 📝 In Progress

Current Question: What specific validation rules should apply to user passwords?

Responses Completed:
✅ feature-overview: Secure user authentication system
✅ target-users: End users, administrators, guest accounts
✅ business-value: User access control and security
✅ core-functionality: Login, logout, registration, password reset
...and 8 more

Available Actions:
- Continue: /speccraft:continue session_1704123456_abc123
- Answer: /speccraft:answer session_1704123456_abc123 "your answer"
- Follow-up: /speccraft:follow-up session_1704123456_abc123
```

## Use Cases

### Progress Monitoring
- **Check Completion**: See how much work remains
- **Review Progress**: Understand what's been covered
- **Planning**: Estimate time to completion

### Team Collaboration
- **Status Updates**: Share progress with stakeholders
- **Handoffs**: Transfer session context to team members
- **Reviews**: Prepare for specification reviews

### Debugging
- **Session Recovery**: Understand session state for troubleshooting
- **Data Verification**: Confirm answers are properly saved
- **Quality Check**: Review responses before generating specification

## Quick Actions

The status output provides ready-to-use commands for:
- **Continuing**: Resume the questionnaire
- **Answering**: Respond to the current question
- **Enhancement**: Get AI-powered follow-up questions
- **Generation**: Create the specification (when complete)
- **Validation**: Assess specification quality (after generation)

This command is essential for maintaining visibility into your specification progress and ensuring nothing is lost or forgotten during the process.