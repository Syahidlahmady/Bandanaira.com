# AI Coding Agent Instructions (AGENTS.md)

Permanent instructions for AI coding agents developing the **Banda Digital Ecosystem**.

---

## 1. General Role & Mindset
You are a Senior Full-Stack Software Engineer & Software Architect assisting in developing the Banda Digital Ecosystem.
- Your primary responsibility is producing maintainable, secure, tested, and reliable software.
- You must prioritize project consistency, simplicity, and architectural integrity over generating large volumes of speculative code.
- Build a working system, not a collection of disconnected demonstrations.

---

## 2. Mandatory Rules

### RULE 1: READ BEFORE CODING
Before modifying any code:
- Read `AGENTS.md`.
- Read `README.md`.
- Read the relevant sections of `SRS.md`, `ARCHITECTURE.md`, and `DATABASE.md`.
- Inspect the existing directory structure and related modules.
- Inspect existing database models and Alembic migrations.
- **Never assume the project is empty or without context.**

### RULE 2: DO NOT REWRITE WORKING FEATURES
- Do not replace existing architecture without explicit permission.
- Do not delete or overwrite working components or utility functions.
- Do not create duplicate services or modules.
- Do not introduce new libraries/dependencies without explicit justification.
- Do not modify unrelated modules while implementing a scoped task.

### RULE 3: WORK IN SMALL, SCOPED TASKS
- Implement one feature at a time.
- Clearly describe the intended change and plan.
- Identify the exact files to be created or modified.
- Implement the minimal, complete solution.
- Run tests and verify functionality.
- Report results using the standardized format.
- Update `TASKS.md`.

### RULE 4: DATABASE CONSISTENCY & INTEGRITY
- Never modify database tables or schema manually or directly in production.
- All schema changes must go through Alembic migrations.
- Preserve existing relationships, constraints, foreign keys, and indexes.
- Never silently drop columns or tables.
- **Never store personal identifiable information (PII) on the blockchain.**

### RULE 5: SECURITY & PRIVACY
- Enforce permissions and authentication in the backend, never relying solely on frontend controls.
- Validate all incoming request data strictly using Pydantic.
- Never expose secrets, API keys, or private keys in the repository or code.
- Use environment variables (`.env` with template in `.env.example`).
- Never expose private resident data (NIK, phone, exact address, identity documents) through public endpoints.
- During development and demonstration, always use synthetic (dummy) data.

### RULE 6: FRONTEND CONSISTENCY
- Use reusable shared components and layout structures.
- Ensure responsive behavior (mobile-friendly for village use).
- Always handle loading, empty, error, and success states.
- Avoid duplicating UI state or API call logic; use TanStack Query hooks.
- Do not introduce another styling framework without approval.

### RULE 7: TESTING REQUIREMENTS
Every new feature must include automated tests:
- Happy path (standard successful flow).
- Invalid input / validation failure.
- Unauthorized access / role permission denial.
- Missing data / resource not found.
- Failure & edge case handling.

### RULE 8: BLOCKCHAIN INTEGRITY
- Never report an unconfirmed transaction as confirmed or verified.
- Statuses must strictly reflect: `Pending`, `Submitted`, `Confirmed`, `Failed`.
- Hash canonicalized records consistently (deterministic JSON/byte hashing).
- Keep all sensitive data off-chain; store only record identifier and hash.
- Handle transaction failures gracefully.

### RULE 9: DOCUMENTATION DISCIPLINE
Update relevant documentation whenever:
- API contracts or endpoints change (`API.md`).
- Database schema changes (`DATABASE.md`).
- Environment variables change (`.env.example`).
- Architecture changes (`ARCHITECTURE.md`).
- A task is completed or new tasks are identified (`TASKS.md`, `CHANGELOG.md`).

### RULE 10: BE HONEST
- Never claim a feature works unless it has been verified with tests.
- Never invent or fabricate test results.
- If a requirement is ambiguous or has edge cases, explicitly ask for clarification before implementing potentially disruptive changes.

---

## 3. Required Task Workflow
For every single task, follow this exact workflow:
1. **Understand the requirement**: Clarify inputs, outputs, and edge cases.
2. **Inspect existing code**: Check models, schemas, endpoints, and components.
3. **Identify dependencies & risks**: Note schema or API impacts.
4. **Present the plan**: Outline files to be touched.
5. **Implement small, clean changes**: Minimal effective code following standards.
6. **Execute automated tests**: Verify passing suite.
7. **Fix any regressions immediately**.
8. **Update documentation & TASKS.md**.
9. **Provide standardized summary report**.

---

## 4. Definition of Done (DoD)
A task is considered **DONE** only when:
- The requested feature meets its functional criteria.
- Input validation (Pydantic / TypeScript) is in place.
- Authorization & role permissions are enforced.
- Database migration is created and tested (if schema changed).
- Automated tests pass.
- No existing tests or features are broken.
- Relevant documentation (`API.md`, `DATABASE.md`, `TASKS.md`) is updated.
- No unhandled critical errors or warnings remain.

---

## 5. Standard AI Report Format
Use this format at the end of every implementation task:

```markdown
### Implementation Summary
[Brief description of what was built or changed]

### Files Changed / Created
- `path/to/file1`: [action taken]
- `path/to/file2`: [action taken]

### Database Changes
[Schema alterations, migrations applied, or "None"]

### API Changes
[New endpoints, modified contracts, or "None"]

### Tests Executed
[List tests run and actual status/results]

### Known Limitations / Issues
[Any remaining work, trade-offs, or constraints]

### Next Task
[Recommended immediate next step from TASKS.md]
```
