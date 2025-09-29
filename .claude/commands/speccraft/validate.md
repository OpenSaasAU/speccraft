---
description: Validate specification completeness and quality using AI analysis
mcp_server: "speccraft"
args:
  - name: file_path
    description: Path to specification markdown file
    required: true
  - name: session_id
    description: Optional session ID for additional context
    required: false
---

# Validate Specification

Analyzes a specification document using AI to provide comprehensive feedback on completeness, quality, and implementation readiness.

## Usage

```
/speccraft:validate ./specs/my-specification.md
```

## With Session Context

```
/speccraft:validate ./specs/my-specification.md session-id-123
```

## What It Validates

### 📋 **Completeness Analysis**
- All required sections present
- Sufficient detail for implementation
- Clear acceptance criteria
- Missing requirements identification

### 🎯 **Clarity Assessment**
- Requirement clarity and specificity
- Potential ambiguities
- Implementation guidance quality

### ⚙️ **Technical Feasibility**
- Technical complexity assessment
- Resource requirement estimates
- Potential implementation challenges
- Technology stack recommendations

### 🔗 **Integration Considerations**
- Dependencies and relationships
- Data flow validation
- API design completeness
- Security requirement coverage

### 📏 **Quality Metrics**
- Specification completeness score
- Implementation readiness rating
- Risk assessment
- Effort estimation

## Output Format

The validation provides:
- **Overall Quality Score** (1-100)
- **Detailed Analysis** by category
- **Specific Recommendations** for improvement
- **Missing Elements** that should be added
- **Implementation Risks** to consider
- **Next Steps** for specification refinement

## Example Output

```
📊 Specification Validation Report

Overall Quality: 85/100 ✅ Good

Strengths:
✅ Clear user workflows defined
✅ Comprehensive data model
✅ Security requirements specified

Areas for Improvement:
⚠️  Performance requirements need more detail
⚠️  Error handling scenarios incomplete
⚠️  Testing strategy could be expanded

Recommendations:
1. Add specific performance metrics (response times, throughput)
2. Define error handling for edge cases
3. Include integration testing approach
```

## When to Use

### 📝 **Before Implementation**
- Ensure specification is complete before development starts
- Identify potential issues early
- Get confidence in implementation readiness

### 🔄 **During Review Process**
- Team review preparation
- Stakeholder presentation readiness
- Quality assurance checkpoint

### 📈 **Continuous Improvement**
- Learn what makes quality specifications
- Improve specification writing skills
- Build better requirements over time

## Benefits

### 🎯 **Reduce Implementation Risks**
- Catch missing requirements early
- Identify technical challenges upfront
- Ensure all stakeholders have same understanding

### ⚡ **Faster Development**
- Clear, complete specifications lead to faster coding
- Fewer questions and clarifications during development
- Reduced back-and-forth between teams

### 📊 **Quality Assurance**
- Objective quality assessment
- Consistent evaluation criteria
- Measurable improvement tracking

Perfect for ensuring your specifications are implementation-ready! 🎯