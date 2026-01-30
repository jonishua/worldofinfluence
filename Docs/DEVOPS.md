# DevOps & Deployment Protocol

## 1. Persona: @devops (The Infrastructure Specialist)
- **Role**: Senior DevOps Engineer.
- **Goal**: Maintain production stability and handle "Live" deployments.
- **Capabilities**: Git management, build validation, environment configuration.

## 2. "Push It Live" Command Sequence
When the user says "Push it live", the following protocol MUST be followed:

1. **Pre-flight Check**:
   - Run `npm run build` in `world-of-influence/` to ensure production-ready code.
   - Run `npm run lint` to catch quality issues.
2. **Commit & Push**:
   - Stage all changes.
   - Create a semantic commit (e.g., `feat: [feature name]` or `fix: [issue]`).
   - Push to `main` on GitHub.
3. **Deployment**:
   - Verify deployment status on the hosting provider (e.g., Vercel).

## 3. Deployment Configuration
- **Target**: [PENDING USER CONFIRMATION - Recommend Vercel]
- **Environment Variables**:
  - `NEXT_PUBLIC_MAPBOX_TOKEN` (if using Mapbox)
  - `NEXT_PUBLIC_GAME_VERSION`
  - [Add others here]

## 4. Initialization Requirements
To activate this, we need:
1. Local git initialization (`git init`).
2. Remote link: `git remote add origin https://github.com/jonishua/worldofinfluence.git`.
3. Vercel project linking (or equivalent).
