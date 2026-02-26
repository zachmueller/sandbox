# sandbox

A personal sandbox for experimenting with AI-assisted development tools and workflows.

## About

This repo tracks a variety of experimental ideas — mostly revolving around testing AI tools (like [Cline](https://github.com/cline/cline)) — in a way that's easy to share publicly. Each distinct idea or concept lives on its own branch, keeping experiments isolated and self-contained. If an idea grows large enough, it may be extracted into a dedicated repo.

## Repo Structure

The `main` branch is kept intentionally minimal, containing only:

- Shared Cline rules and workflows (`.clinerules/`)
- This README and license

Individual experiments live on separate branches. Check the [branches list](https://github.com/zachmueller/sandbox/branches) to browse available experiments.

## Cline Rules & Workflows

The `.clinerules/` directory contains reusable configuration for [Cline](https://github.com/cline/cline) (an AI coding assistant for VS Code):

**Rules:**
- **`git.md`** — Standardized git workflow rules ensuring AI-generated commits follow a consistent format with full provenance tracking.

**Workflows:**
- **`workflows/new-branch.md`** — Standardized process for creating new experiment branches (handles naming, branching from `main`, and initial README creation).

## License

MIT — see [LICENSE](LICENSE) for details.