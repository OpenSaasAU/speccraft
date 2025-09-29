---
description: Generate markdown specification from completed session
mcp_server: "speccraft"
args:
  - name: session_id
    description: The session ID to generate specification for
    required: true
---

# Generate Specification Document

Create a comprehensive markdown specification document from your completed SpecCraft session.

## Usage

```
/speccraft:generate <session-id>
```

## Examples

```
/speccraft:generate session_1704123456_abc123
```

## Prerequisites

- **Complete Session**: All required questions must be answered
- **Valid Session**: Session ID must exist and be accessible

## Generated Content

The specification document includes:

### 1. Feature Overview
- Feature title and description
- Business value and objectives
- Target users and use cases

### 2. Functional Requirements
- Core functionality breakdown
- User workflows and interactions
- Business logic and rules

### 3. Technical Specifications
- Architecture requirements
- Performance criteria
- Security considerations
- Integration points

### 4. UI/UX Requirements
- User interface specifications
- Responsive design requirements
- Accessibility considerations
- User experience flows

### 5. Implementation Details
- Development guidelines
- Testing requirements
- Deployment considerations

## File Output

- **Location**: Saved in numbered directory under `./specs/`
- **Directory**: `./specs/<num>_<feature_name>/` (e.g., `./specs/001_user_authentication/`)
- **Format**: Markdown (.md) file
- **Naming**: `<feature_name>_spec.md` (e.g., `user_authentication_spec.md`)
- **Structure**: Professional specification format ready for development

## Quality Assurance

The generated specification:
- Follows industry-standard documentation practices
- Includes all provided answers in organized sections
- Maintains consistency and professional formatting
- Is ready for developer handoff and implementation

## Next Steps

After generation:
1. **Review**: Read through the generated specification in `./specs/<num>_<feature>/`
2. **Validate**: Use `/speccraft:validate <file-path>` to assess quality
3. **Commit**: Add the specification directory to version control
4. **Develop**: Use the specification to guide implementation

The first feature will be saved as `./specs/001_<feature_name>/`, the second as `./specs/002_<feature_name>/`, and so on.

## Integration with Development

Generated specifications serve as:
- **Requirements Documentation**: Single source of truth for the feature
- **Development Guide**: Clear implementation roadmap
- **Quality Gate**: Ensure nothing is missed during development
- **Team Communication**: Shared understanding across stakeholders