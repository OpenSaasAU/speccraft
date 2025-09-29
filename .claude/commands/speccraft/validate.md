---
description: Validate specification quality with AI analysis
mcp_server: "speccraft"
args:
  - name: file_path
    description: Path to the markdown specification file
    required: true
  - name: session_id
    description: Optional session ID for additional context
    required: false
---

# Validate Specification Quality

Use AI-powered analysis to assess the completeness and quality of your specification document.

## Usage

```
/speccraft:validate <file-path> [session-id]
```

## Examples

```
/speccraft:validate "user-auth-spec.md"
```

```
/speccraft:validate "features/payment-processing.md" session_123
```

## Analysis Dimensions

### Completeness Assessment
- **Functional Coverage**: Are all core features specified?
- **Technical Requirements**: Performance, security, and architecture details
- **UI/UX Specifications**: User interface and experience requirements
- **Edge Cases**: Error handling and validation scenarios

### Quality Metrics
- **Clarity Score**: How understandable is the specification?
- **Specificity Level**: How actionable are the requirements?
- **Implementation Readiness**: How ready is this for development?
- **Best Practices**: Compliance with industry standards

## AI-Powered Insights

The validation uses advanced LLM analysis to:
- **Identify Gaps**: Missing sections or incomplete requirements
- **Suggest Improvements**: Specific areas that need enhancement
- **Quality Scoring**: Objective assessment of specification quality
- **Actionable Feedback**: Clear recommendations for improvement

## Validation Report

Results include:
- **Overall Score**: Percentage-based quality assessment
- **Status Classification**: Complete ✅ or Needs Improvement ⚠️
- **Critical Issues**: Must-address gaps before development
- **Enhancement Suggestions**: Optional improvements for better quality

## When to Validate

### Optimal Timing
- **Before Development**: Ensure specifications are development-ready
- **During Reviews**: Get objective quality assessment for team discussions
- **After Updates**: Re-validate when specifications change
- **Quality Gates**: Use as part of your development process

### Continuous Improvement
- **Iterative Enhancement**: Multiple validation rounds to improve quality
- **Team Standards**: Maintain consistent specification quality across projects
- **Learning Tool**: Understand what makes a good specification

## Integration with Sessions

When providing a session ID:
- **Context Awareness**: Uses original questionnaire responses for deeper analysis
- **Consistency Check**: Compares generated spec with your answers
- **Gap Identification**: Finds discrepancies or missing information

## Next Steps

Based on validation results:
- **If Complete**: Proceed with confidence to development
- **If Incomplete**: Address critical gaps and missing areas
- **If Unclear**: Refine language and add specificity
- **Re-validate**: Run validation again after improvements

The goal is a specification that developers can implement without ambiguity or missing requirements.