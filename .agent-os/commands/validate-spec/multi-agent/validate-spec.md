# Validate Spec

Comprehensive validation of specifications, implementations, and deliverables using orchestrated parallel validation.

## Multi-Agent Mode

This command orchestrates multiple specialist validation agents to provide comprehensive quality assurance across all aspects of your product.

### Usage

Execute comprehensive validation with parallel specialist agents:
- **Specification Validation**: Completeness, technical depth, implementation readiness
- **Browser Testing**: Frontend functionality, accessibility, responsive design
- **System Validation**: Integration, performance, security, architecture
- **Quality Assurance**: Code quality, standards compliance, documentation

### Execution

Refer to the instructions located in this file:
@.agent-os/instructions/core/validate-spec.md

### Orchestrated Validation Agents

This command coordinates the following specialist validation agents in parallel:

#### Quality Assurance Specialist
- **Focus**: Code quality, standards compliance, documentation quality
- **Validates**: Style consistency, maintainability, test coverage, API docs
- **Deliverables**: Quality report with scores and improvement recommendations

#### Browser Testing Specialist  
- **Focus**: Frontend functionality, user experience, accessibility
- **Validates**: Component behavior, responsive design, cross-browser compatibility
- **Deliverables**: Browser test results with accessibility audit reports

#### System Validation Specialist
- **Focus**: System integration, performance, security, architecture
- **Validates**: API integration, database performance, security vulnerabilities
- **Deliverables**: System health report with performance benchmarks

#### Integration Coordinator
- **Focus**: Cross-component validation, end-to-end workflows
- **Validates**: Data flow, error handling, user journey completeness
- **Deliverables**: Integration test results with workflow validation

### Validation Categories

#### Specification Validation
- **Completeness**: All required sections and files present
- **Technical Depth**: Sufficient implementation detail with code examples
- **Implementation Readiness**: Clear file paths, function signatures, requirements
- **Documentation Quality**: Clear explanations, diagrams, examples

#### Implementation Validation  
- **Code Quality**: Style consistency, complexity, maintainability
- **Test Coverage**: Unit tests, integration tests, edge cases
- **Performance**: Efficiency, scalability, resource usage
- **Security**: Vulnerability assessment, best practices compliance

#### System Validation
- **Integration**: Component compatibility, data flow, API contracts
- **Performance**: Load testing, response times, resource utilization
- **Security**: Authentication, authorization, data protection
- **Reliability**: Error handling, recovery, availability

### Deliverable Verification Framework

Every validation includes mandatory verification:
- **100% artifact verification** - All expected deliverables verified to exist
- **Test execution validation** - All tests verified to pass with coverage reports
- **Quality gate validation** - All quality criteria verified with evidence
- **Integration verification** - All integration points verified to work correctly

### Quality Thresholds

#### Default Standards
- **Completeness**: 90% (all required files/sections present)
- **Technical Depth**: 85% (sufficient implementation detail)
- **Code Quality**: 85% (style, maintainability, documentation)
- **Test Coverage**: 80% (unit + integration tests)
- **Performance**: Meeting defined benchmarks and response times

#### Configurable Options
- **Strict Mode**: Enforce higher thresholds (95%+ across all categories)
- **Project-Specific Rules**: Custom validation rules per project type
- **Profile-Specific Standards**: Different thresholds for different profiles
- **Warning Levels**: Control sensitivity of validation warnings

### Validation Workflow

#### Parallel Execution
1. **Validation Planning**: Identify scope and assign specialist validators
2. **Parallel Validation**: All specialists validate their domains simultaneously
3. **Result Aggregation**: Combine results into comprehensive validation report
4. **Issue Prioritization**: Rank issues by severity and impact
5. **Action Planning**: Create specific improvement recommendations

#### Quality Gates
- **Specification Gates**: Must pass before implementation begins
- **Implementation Gates**: Must pass before deployment consideration
- **System Gates**: Must pass before production release
- **Documentation Gates**: Must pass for knowledge transfer readiness

### Profile Support

Different profiles provide specialized validation approaches:

#### default Profile
- Standard full-stack validation workflow
- Balanced focus on all validation domains
- Comprehensive quality assurance across all components

#### fullstack Profile  
- Enhanced frontend and backend integration validation
- Full-stack user journey testing
- Cross-domain compatibility verification

#### frontend Profile
- Deep browser testing and accessibility validation
- Component library validation
- Responsive design and user experience focus

#### backend Profile
- API and database performance validation
- Security and scalability assessment
- Backend architecture and integration validation

### Reporting and Analytics

#### Validation Reports
- **Executive Summary**: Overall health status and key metrics
- **Detailed Findings**: Comprehensive issue analysis with evidence
- **Trend Analysis**: Quality metrics over time
- **Improvement Tracking**: Progress against previous validations

#### Quality Metrics
- **Code Quality Scores**: Maintainability, complexity, documentation
- **Test Coverage Metrics**: Unit, integration, E2E coverage percentages
- **Performance Benchmarks**: Response times, throughput, resource usage
- **Security Assessment**: Vulnerability counts, risk levels, compliance

### Integration with Development Workflow

#### Continuous Validation
- **Pre-commit Hooks**: Automatic quality validation before commits
- **CI/CD Integration**: Validation gates in deployment pipelines
- **Pull Request Validation**: Automatic validation on code changes
- **Scheduled Assessments**: Periodic comprehensive validation

#### Developer Feedback
- **Real-time Validation**: Immediate feedback during development
- **IDE Integration**: Validation results directly in development environment
- **Progressive Enhancement**: Gradual improvement suggestions
- **Learning Resources**: Best practices and improvement guidance

### Performance Benefits

- **60-80% faster validation** through parallel specialist execution
- **Comprehensive coverage** across all validation domains
- **Advanced error detection** with specialist domain expertise
- **Actionable insights** with specific improvement recommendations
- **Continuous improvement** through trend analysis and tracking

### Quality Assurance Guarantee

This validation command ensures:
- **Zero critical issues** reach production
- **All quality standards** are met and maintained
- **Comprehensive test coverage** across all components
- **Documentation completeness** for knowledge transfer
- **System reliability** and performance standards