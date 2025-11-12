# Contributing to Unified Event Analytics Backend

Thank you for considering contributing to this project! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive feedback
- Respect differing viewpoints and experiences

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in Issues
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, Node version, etc.)
   - Relevant logs or screenshots

### Suggesting Features

1. Check if the feature has been suggested
2. Create a new issue with:
   - Clear use case description
   - Proposed solution or implementation
   - Alternative approaches considered
   - Impact on existing functionality

### Pull Requests

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes following the code style guidelines
4. Write or update tests as needed
5. Ensure all tests pass: `npm test`
6. Update documentation if needed
7. Commit with clear messages: `git commit -m "Add feature: description"`
8. Push to your fork: `git push origin feature/your-feature-name`
9. Create a Pull Request with:
   - Clear description of changes
   - Reference to related issues
   - Screenshots if UI changes
   - Test coverage information

## Development Setup

1. Clone your fork
```bash
git clone https://github.com/your-username/unified-event-analytics-backend.git
cd unified-event-analytics-backend
```

2. Install dependencies
```bash
npm install
```

3. Set up environment
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start development environment
```bash
docker-compose up -d
npm run dev
```

## Code Style Guidelines

### JavaScript
- Use ES6+ features
- Use async/await over callbacks
- Use const/let, never var
- Use meaningful variable names
- Keep functions small and focused
- Add comments for complex logic

### File Organization
- Controllers: Business logic
- Routes: Endpoint definitions
- Middleware: Request processing
- Utils: Helper functions
- Tests: Mirror src structure

### Naming Conventions
- Files: lowercase with hyphens (e.g., `api-key.controller.js`)
- Functions: camelCase (e.g., `getUserAnalytics`)
- Classes: PascalCase (e.g., `AnalyticsService`)
- Constants: UPPER_SNAKE_CASE (e.g., `DEFAULT_TTL`)

## Testing Guidelines

### Writing Tests
- Write tests for new features
- Update tests for modified features
- Aim for 70%+ code coverage
- Test both success and error cases
- Use descriptive test names

### Running Tests
```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- tests/auth.test.js

# Watch mode
npm run test:watch
```

## Documentation

### Code Documentation
- Add JSDoc comments for functions
- Document complex algorithms
- Explain non-obvious decisions
- Keep comments up to date

### API Documentation
- Update Swagger annotations for API changes
- Include request/response examples
- Document error responses
- Note authentication requirements

### README Updates
- Update features list for new capabilities
- Add setup instructions for new dependencies
- Document new environment variables
- Update deployment instructions if needed

## Commit Message Guidelines

Format: `type: description`

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Test additions or changes
- `chore`: Build process or auxiliary tool changes

Examples:
```
feat: add user session analytics endpoint
fix: resolve cache invalidation issue
docs: update API examples with batch tracking
test: add integration tests for rate limiting
```

## Review Process

### For Contributors
- Respond to review comments promptly
- Make requested changes in new commits
- Keep PR scope focused and manageable
- Be open to feedback and suggestions

### For Reviewers
- Review code for correctness and style
- Test functionality locally if possible
- Provide constructive feedback
- Approve when satisfied with changes

## Release Process

1. Version bump in package.json
2. Update CHANGELOG.md
3. Create release tag
4. Deploy to staging for testing
5. Deploy to production
6. Announce release

## Getting Help

- Check existing documentation
- Search closed issues
- Ask in issue comments
- Contact maintainers

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

Thank you for contributing!
