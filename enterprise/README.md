# GenXAI Enterprise (Staging)

This folder is a **staging area** for the enterprise edition (Studio UI + backend).

## Next Steps

1. Extract `enterprise/` into a **private enterprise repository**
2. Move `enterprise/studio/` to the enterprise repo root as `studio/`
3. Add a **commercial license/EULA** to the enterprise repo
4. Update internal CI/CD to publish enterprise artifacts separately

You can use the helper script from the OSS repo root:

```bash
./scripts/export_enterprise_repo.sh /path/to/genxai-enterprise
```

For CI/CD guidance, see:

- `docs/RELEASE_OSS_ENTERPRISE.md`

> The open-source core remains in this repository under the MIT license.