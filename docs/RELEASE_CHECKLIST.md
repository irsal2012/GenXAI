# Release Checklist

Use this checklist before cutting a release tag.

## 1) Code Quality
- [ ] All CI checks green on main
- [ ] Unit + integration tests passing locally
- [ ] Linting (ruff) clean
- [ ] Mypy type checks clean

## 2) Security & Compliance
- [ ] Security workflow green (pip-audit + bandit)
- [ ] License report generated and reviewed

## 3) Versioning
- [ ] Version bumped in pyproject.toml
- [ ] CHANGELOG updated (if applicable)
- [ ] Tag created with format vX.Y.Z

## 4) Build & Publish
- [ ] `python -m build` succeeds
- [ ] PyPI publish workflow verified
- [ ] Docker image built/pushed (latest + version)

## 5) Post-Release
- [ ] GitHub Release created
- [ ] Release notes shared with stakeholders