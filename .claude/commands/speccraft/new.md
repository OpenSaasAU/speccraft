---
description: Start an interactive feature specification session
mcp_server: "speccraft"
args:
  - name: title
    description: Feature title
    required: true
  - name: description
    description: Brief feature description
    required: true
---

# Interactive Feature Specification

**🚀 For Claude Code: This command starts an interactive specification session. You'll ask the user questions directly and handle all responses within this conversation - no additional slash commands needed.**

Creates a comprehensive feature specification through an interactive conversation. Claude Code will guide the user through all questions and automatically generate the specification when complete.

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

```
/speccraft:new "Product Reviews" "Allow customers to rate and review products"
```

## How It Works

### Interactive Flow
1. **Session Creation**: Creates a new specification session
2. **Guided Questions**: Claude Code asks follow-up questions directly in conversation
3. **Real-time Answers**: User responds naturally in chat - no slash commands needed
4. **Dynamic Follow-ups**: Claude Code asks clarifying questions based on responses
5. **Automatic Generation**: When sufficient information is gathered, automatically generates specification
6. **Implementation Ready**: Provides build instructions for immediate implementation

### Question Categories
The interactive session covers:

**📋 Feature Overview**
- Business value and objectives
- Target users and use cases
- Success criteria and metrics

**👥 User Experience**
- User workflows and interactions
- UI/UX requirements
- Accessibility considerations

**⚙️ Technical Requirements**
- Data models and relationships
- Performance requirements
- Integration needs

**🔒 Security & Compliance**
- Access control requirements
- Data privacy considerations
- Validation rules

**🧪 Testing & Quality**
- Testing requirements
- Quality criteria
- Acceptance criteria

## For Claude Code: Implementation Instructions

When this command is executed:

1. **Start the Session**:
   - Call the `spec_new` MCP tool with title and description
   - Store the session ID returned

2. **Begin Interactive Questioning**:
   - Present the first question from the session
   - Ask the user to respond naturally in conversation
   - DO NOT ask them to use slash commands

3. **Handle User Responses**:
   - For each user response, call `spec_answer` with the session ID and their answer
   - Continue asking follow-up questions returned by the MCP
   - Keep the conversation natural and engaging

4. **Use Follow-up Intelligence**:
   - If clarification is needed, call `spec_follow_up` for AI-generated insights
   - Ask additional questions based on the analysis

5. **Check Completion**:
   - Use `spec_status` to check if specification is complete
   - When ready, call `spec_generate` to create the markdown specification

6. **Automatic Implementation**:
   - After specification is generated, automatically call `spec_build` to provide implementation guidance
   - Present implementation instructions to start coding immediately

## Sample Conversation Flow

```
User: /speccraft:new "Product Reviews" "Allow customers to rate and review products"

Claude Code: I'll help you create a comprehensive specification for your Product Reviews feature. Let me start by gathering some details.

First, I'd like to understand the business context. What's the primary business goal for adding product reviews? Are you looking to:
- Increase customer engagement and trust?
- Improve product discoverability?
- Gather feedback for product improvement?
- Something else?

User: We want to increase customer trust and help other customers make better purchasing decisions.

Claude Code: Perfect! That helps establish the value proposition. Now, let's think about the user experience...

[Conversation continues naturally until specification is complete]

Claude Code: Great! I have all the information needed. Let me generate your specification and set up implementation guidance.

[Automatically generates spec and provides build instructions]
```

## Benefits

### 🎯 **Single Command Workflow**
- One command starts and completes entire specification
- No need to remember multiple slash commands
- Natural conversation flow

### 🤖 **Intelligent Interaction**
- Claude Code guides the entire process
- Dynamic follow-up questions based on responses  
- AI-powered analysis and suggestions

### ⚡ **Immediate Implementation**
- Specification automatically generated when complete
- Implementation guidance provided immediately
- Ready-to-code instructions with live documentation

### 📝 **Complete Documentation**
- Comprehensive specification document created
- All responses and requirements captured
- Ready for development team review

This streamlined approach makes SpecCraft much more user-friendly while leveraging Claude Code's conversational abilities!