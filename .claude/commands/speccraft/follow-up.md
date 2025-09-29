---
description: Generate AI-powered follow-up questions to enhance specification
mcp_server: "speccraft"
args:
  - name: session_id
    description: The session ID to generate follow-up questions for
    required: true
---

# AI-Powered Follow-up Questions

Generate intelligent, contextual follow-up questions to enhance your specification quality using advanced AI analysis.

## Usage

```
/speccraft:follow-up <session-id>
```

## Examples

```
/speccraft:follow-up session_1704123456_abc123
```

## AI Analysis Process

The AI system analyzes your current responses to:
- **Identify Gaps**: Find missing requirements or edge cases
- **Enhance Clarity**: Suggest questions that improve specificity
- **Industry Best Practices**: Apply domain knowledge for better coverage
- **Context Awareness**: Generate questions specific to your feature type

## Question Categories

### Functional Enhancement
- **Edge Cases**: Scenarios you might not have considered
- **User Workflows**: Additional interaction patterns
- **Business Logic**: Missing rules or validations

### Technical Deep-dive
- **Performance**: Scalability and optimization requirements
- **Security**: Authentication, authorization, data protection
- **Architecture**: Integration points and system dependencies

### User Experience
- **Accessibility**: Inclusive design considerations
- **Responsive Design**: Multi-device experience requirements
- **Error Handling**: User-friendly error scenarios

## Example Output

```
🤖 AI-Generated Follow-up Questions

Based on your authentication system responses, here are 4 intelligent follow-up questions:

1. What happens when a user forgets their password?
   💡 Reason: Password recovery is essential for authentication systems
   📝 Type: textarea | Category: functional

2. Should the system support two-factor authentication (2FA)?
   💡 Reason: Security enhancement for sensitive user data
   📝 Type: boolean | Category: security

3. How should concurrent login sessions be handled?
   💡 Reason: Session management affects security and user experience
   📝 Type: textarea | Category: technical

4. What accessibility features are required for the login form?
   💡 Reason: Ensures compliance with accessibility standards
   📝 Type: textarea | Category: ui-ux

💭 These questions are suggestions to enhance your specification.
   You can consider them when continuing your session.
```

## Smart Features

### Context-Aware Analysis
- **Feature Type Recognition**: Adapts to authentication, e-commerce, search, etc.
- **Domain Knowledge**: Applies industry-specific best practices
- **Answer Integration**: Builds on your existing responses

### Quality Enhancement
- **Gap Detection**: Identifies missing critical requirements
- **Specificity Improvement**: Suggests questions that add clarity
- **Best Practice Alignment**: Ensures comprehensive coverage

## When to Use

### Optimal Timing
- **Mid-Session**: After answering core questions to catch gaps
- **Before Generation**: Final quality check before creating specification
- **Iterative Improvement**: Multiple rounds to enhance completeness
- **Domain Expertise**: When you want AI insights for your specific feature type

### Strategic Application
- **First-Time Features**: When implementing something new
- **Complex Systems**: Multi-faceted features with many considerations
- **Team Reviews**: Generate questions for specification discussions
- **Quality Assurance**: Ensure nothing important is missed

## Response Integration

After receiving follow-up questions, you can:
- **Continue Normally**: Proceed with the standard questionnaire
- **Mental Notes**: Consider the insights when answering future questions
- **Discussion Points**: Use questions for team discussions
- **Specification Enhancement**: Apply insights to improve overall quality

## AI-Powered Benefits

- **Expertise Augmentation**: Get insights from AI trained on best practices
- **Blind Spot Detection**: Catch requirements you might have missed
- **Quality Improvement**: Systematic approach to comprehensive specifications
- **Learning Tool**: Understand what makes specifications complete

The goal is to create the most comprehensive, actionable specification possible by leveraging AI to identify areas for improvement and enhancement.