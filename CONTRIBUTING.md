# 🤝 Contributing to GensanWorks

Thank you for your interest in contributing to GensanWorks! This document provides guidelines and instructions for contributing.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)
- [Testing](#testing)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for everyone. Please be respectful and constructive in all interactions.

### Expected Behavior

- Be respectful and inclusive
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards others

### Unacceptable Behavior

- Harassment, discrimination, or derogatory comments
- Personal attacks or trolling
- Spam or off-topic discussions
- Any conduct that would be inappropriate in a professional setting

---

## Getting Started

### Prerequisites

- Node.js v18 or higher
- Git
- A GitHub account
- Basic knowledge of TypeScript, React, and Express

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/GensanWorks.git
   cd GensanWorks
   ```

3. Add upstream remote:
   ```bash
   git remote add upstream https://github.com/Ta1kunjms/GensanWorks.git
   ```

### Setup Development Environment

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file:
   ```bash
   cp .env.example .env
   # Edit .env and add your configuration
   ```

3. Initialize database:
   ```bash
   npm run db:push
   npm run db:seed-1232
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

5. Open http://localhost:5000

---

## Development Workflow

### 1. Create a Branch

Always create a new branch for your work:

```bash
# Update your main branch
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/bug-description
```

### Branch Naming Convention

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring
- `test/description` - Adding tests
- `perf/description` - Performance improvements

### 2. Make Changes

- Write clean, readable code
- Follow the coding standards below
- Add comments for complex logic
- Update documentation if needed
- Write/update tests

### 3. Test Your Changes

```bash
# Type check
npm run check

# Run tests
npm test

# Test build
npm run build

# Manual testing
npm run dev
```

### 4. Commit Your Changes

Follow the commit message convention (see below):

```bash
git add .
git commit -m "feat: add user profile photo upload"
```

### 5. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 6. Create Pull Request

- Go to GitHub and create a Pull Request
- Fill in the PR template
- Link related issues
- Wait for review

---

## Coding Standards

### TypeScript

- **Always use TypeScript** - No plain JavaScript files
- **Strict typing** - Avoid `any` type, use proper types
- **Interfaces over types** for object shapes
- **Async/await** over promises chains

```typescript
// ✅ Good
interface User {
  id: string;
  email: string;
  role: 'admin' | 'employer' | 'jobseeker';
}

async function getUser(id: string): Promise<User> {
  const user = await db.query.users.findFirst({ where: eq(users.id, id) });
  return user;
}

// ❌ Bad
function getUser(id: any) {
  return db.query.users.findFirst({ where: eq(users.id, id) }).then(user => user);
}
```

### React Components

- **Functional components** with hooks
- **TypeScript props** - Always type your props
- **Destructure props** in function signature
- **Early returns** for conditional rendering

```typescript
// ✅ Good
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export function Button({ label, onClick, disabled = false }: ButtonProps) {
  if (disabled) return <button disabled>{label}</button>;
  
  return <button onClick={onClick}>{label}</button>;
}

// ❌ Bad
export function Button(props: any) {
  return <button onClick={props.onClick}>{props.label}</button>;
}
```

### File Organization

- **One component per file**
- **Colocation** - Keep related files together
- **Named exports** for components
- **Default export** only for pages

```
components/
├── user-profile/
│   ├── user-profile.tsx       # Main component
│   ├── user-avatar.tsx        # Sub-component
│   ├── user-profile.test.tsx  # Tests
│   └── index.ts               # Barrel export
```

### Styling

- **Tailwind CSS** for all styling
- **Shadcn UI** components as base
- **Mobile-first** responsive design
- **Consistent spacing** using Tailwind scale

```tsx
// ✅ Good
<div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-md">
  <Avatar />
  <div className="flex-1">
    <h3 className="text-lg font-semibold">{name}</h3>
    <p className="text-sm text-gray-600">{email}</p>
  </div>
</div>

// ❌ Bad - inline styles
<div style={{ display: 'flex', padding: '16px' }}>
  ...
</div>
```

### API Routes

- **RESTful conventions**
- **Proper HTTP methods** (GET, POST, PUT, DELETE)
- **Consistent response format**
- **Error handling** with proper status codes

```typescript
// ✅ Good
app.get('/api/users/:id', authMiddleware, async (req, res) => {
  try {
    const user = await storage.getUser(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ❌ Bad
app.get('/api/users/:id', (req, res) => {
  const user = storage.getUser(req.params.id);
  res.send(user);
});
```

### Database Queries

- **Use Drizzle ORM** - Avoid raw SQL
- **Type-safe queries**
- **Proper error handling**
- **Transactions** for multiple operations

```typescript
// ✅ Good
const applicant = await db.query.applicantsTable.findFirst({
  where: eq(applicantsTable.id, applicantId),
  with: {
    applications: true
  }
});

// ❌ Bad
const applicant = await db.execute(
  `SELECT * FROM applicants WHERE id = '${applicantId}'`
);
```

---

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, no code change)
- `refactor` - Code refactoring
- `perf` - Performance improvements
- `test` - Adding or updating tests
- `build` - Build system changes
- `ci` - CI/CD changes
- `chore` - Other changes (dependencies, etc.)

### Examples

```bash
# Feature
git commit -m "feat(auth): add password reset functionality"

# Bug fix
git commit -m "fix(api): resolve application status update error"

# Documentation
git commit -m "docs: update API documentation for job endpoints"

# With body and footer
git commit -m "feat(ai): improve job matching algorithm

- Add skills weighting
- Improve location matching
- Add experience factor

Closes #42"
```

### Rules

- **Use imperative mood** - "add" not "added" or "adds"
- **First line max 72 characters**
- **Lowercase** for type and scope
- **No period** at the end of subject
- **Reference issues** in footer

---

## Pull Request Process

### Before Creating PR

1. ✅ Code compiles (`npm run check`)
2. ✅ Tests pass (`npm test`)
3. ✅ Build succeeds (`npm run build`)
4. ✅ Code follows style guide
5. ✅ Documentation updated
6. ✅ Commits follow convention

### PR Title

Follow commit message format:

```
feat(auth): add OAuth2 login support
fix(ui): resolve mobile menu overflow
docs: add deployment guide
```

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Fixes #123
Closes #456

## Changes Made
- Change 1
- Change 2
- Change 3

## Screenshots (if applicable)
[Add screenshots]

## Testing
How was this tested?

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests added/updated
- [ ] Tests pass locally
- [ ] Dependent changes merged
```

### Review Process

1. **Automated checks** must pass (CI/CD)
2. **At least one approval** required
3. **Address feedback** - respond to all comments
4. **Keep PR updated** - merge main if conflicts
5. **Squash commits** if requested

### After Approval

- Maintainer will merge your PR
- Delete your branch after merge
- Update your fork:
  ```bash
  git checkout main
  git pull upstream main
  git push origin main
  ```

---

## Issue Guidelines

### Before Creating an Issue

1. **Search existing issues** - avoid duplicates
2. **Check documentation** - question might be answered
3. **Verify bug** - can you reproduce it?
4. **Gather information** - logs, screenshots, environment

### Issue Types

Use the appropriate template:

- **Bug Report** - Something isn't working
- **Feature Request** - Suggest a new feature
- **Documentation** - Improve or add documentation
- **Performance** - Performance issues

### Writing Good Issues

**For Bugs:**
- Clear title
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, browser, Node version)
- Screenshots/logs if applicable

**For Features:**
- Clear description
- Use cases
- Proposed solution
- Alternatives considered
- Mockups if applicable

### Issue Labels

Issues will be tagged with:
- `bug` - Something isn't working
- `enhancement` - New feature request
- `documentation` - Documentation improvements
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed
- `priority: high/medium/low` - Priority level

---

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test integration.test.ts

# Generate coverage report
npm test -- --coverage
```

### Writing Tests

```typescript
import { describe, it, expect, beforeAll } from '@jest/globals';
import request from 'supertest';
import { app } from '../server';

describe('User API', () => {
  let authToken: string;

  beforeAll(async () => {
    // Setup
  });

  it('should create a new user', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'test@example.com',
        password: 'Password123!',
        role: 'jobseeker'
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
  });
});
```

### Test Coverage

- Aim for >80% code coverage
- Test critical paths
- Include edge cases
- Test error handling

---

## Questions?

- 💬 **GitHub Discussions**: [Ask questions](https://github.com/Ta1kunjms/GensanWorks/discussions)
- 📧 **Email**: support@gensanworks.com
- 📖 **Documentation**: [DOCUMENTATION.md](DOCUMENTATION.md)

---

## Recognition

Contributors will be:
- Added to CONTRIBUTORS.md
- Mentioned in release notes
- Credited in project documentation

---

Thank you for contributing to GensanWorks! 🎉

Your contributions help make this project better for everyone.
