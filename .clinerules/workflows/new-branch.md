# New Branch Workflow

Creates a new experiment branch in this sandbox repo with a standardized process.

## Prerequisites

- The user must provide at least a brief description of the branch's purpose
- If no description is provided, Cline **MUST** ask for one before proceeding

## Steps

### 1. Gather Branch Name

- If the user explicitly provides a branch name → use it as-is
- If not → propose 2–3 branch name options based on the description and ask the user to pick one (or provide their own)

### 2. Branch from `main`

Regardless of the currently checked-out branch, always branch from `main`:

```bash
git checkout main
git pull
git checkout -b <branch-name>
```

### 3. Create a README

Write a `README.md` on the new branch that captures the user's description. Cline may expand upon the description to provide additional context, goals, or structure — but should preserve the user's original intent. This README must be created **before** the first commit on the new branch.

### 4. Commit the README

Make the initial commit on the new branch containing the README.

### 5. Do NOT Push

Do **not** push the branch to `origin`. Leave that decision to the user.

### 6. Confirm

Summarize what was done:
- Branch name created
- Confirm it was branched from `main`
- Remind the user to push when ready (e.g., `git push -u origin <branch-name>`)