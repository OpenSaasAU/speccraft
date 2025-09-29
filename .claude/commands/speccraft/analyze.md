---
description: Analyze a specification file for complexity and implementation recommendations
mcp_server: "speccraft"
args:
  - name: spec_path
    description: Path to the specification markdown file
    required: true
---

# Analyze Specification

Analyze a SpecCraft specification file to assess complexity, estimate development effort, and provide implementation recommendations.

## Usage

```
/speccraft:analyze <spec-path>
```

## Examples

```
/speccraft:analyze ./specs/001_user_authentication/user_authentication_spec.md
```

```
/speccraft:analyze /path/to/my-feature-spec.md
```

## What it analyzes

### Complexity Assessment
- **Core Features**: Number and complexity of features
- **Integrations**: External system dependencies
- **UI Requirements**: Interface complexity
- **Business Rules**: Logic complexity
- **Overall Score**: 1-10 complexity rating

### Development Estimates
- **Timeline**: Estimated development days
- **Team Size**: Recommended number of developers
- **Risk Factors**: Potential implementation challenges

### Strategic Recommendations
- Implementation approach suggestions
- Technology stack recommendations
- Development phase planning
- Testing strategy guidance

## Output Includes

- **Complexity Breakdown**: Detailed analysis of each aspect
- **Development Timeline**: Realistic effort estimates
- **Implementation Recommendations**: Best practices and approaches
- **Next Steps**: Available code generation options

## Follow-up Actions

After analysis, you can:
- **Create Keystone Project**: `/speccraft:keystone-project <spec-path>`
- **Generate Code**: `/speccraft:generate-code <spec-path>` 
- **Validate Specification**: `/speccraft:validate <spec-path>`

## Best Practices

1. **Run Early**: Analyze specs before starting development
2. **Share Results**: Use analysis for team planning and stakeholder communication
3. **Update Regularly**: Re-analyze as specifications evolve
4. **Consider Recommendations**: Follow the strategic guidance provided

Perfect for project planning, effort estimation, and development strategy decisions! 🎯