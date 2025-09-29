---
description: Answer the current question in a specification session
mcp_server: "speccraft"
args:
  - name: session_id
    description: The session ID to answer questions for
    required: true
  - name: answer
    description: Your answer to the current question
    required: true
---

# Answer Specification Question

Provide an answer to the current question in your SpecCraft specification session.

## Usage

```
/speccraft:answer <session-id> "Your detailed answer"
```

## Examples

```
/speccraft:answer session_123 "Users will authenticate using email and password with optional 2FA"
```

```
/speccraft:answer session_456 "The search should support full-text search across product names, descriptions, and categories with autocomplete suggestions"
```

## Answer Guidelines

### Be Specific
- Provide detailed, actionable responses
- Include specific requirements rather than vague descriptions
- Mention exact functionality, constraints, and expectations

### Consider Edge Cases
- Think about error scenarios and validations
- Consider different user types and permissions
- Include performance and scalability requirements

### UI/UX Details
- Describe user interactions and workflows
- Specify form fields, buttons, and navigation
- Include responsive design considerations

## Question Types

The questionnaire covers various categories:
- **Functional**: Core features and business logic
- **Technical**: Performance, security, and architecture
- **UI/UX**: User interface and experience requirements
- **Integration**: External services and data flows

## Next Steps

After answering a question:
- **Continue**: The next question will be presented automatically
- **Generate**: When all questions are answered, generate the specification with `/speccraft:generate <session-id>`
- **Follow-up**: Get AI-powered additional questions with `/speccraft:follow-up <session-id>`
- **Status**: Check progress with `/speccraft:status <session-id>`

## Tips for Better Specifications

- Be as detailed as possible in your answers
- Think from both user and developer perspectives
- Include business requirements and technical constraints
- Consider accessibility and security from the start