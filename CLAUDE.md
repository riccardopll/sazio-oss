# Sazio

Nutrition/macro tracking app. pnpm monorepo: Expo mobile app, Hono/Cloudflare Workers server, shared tRPC API.

## Commands

```bash
pnpm build                                        # Build all
pnpm lint                                         # Lint and format all
pnpm --filter @sazio-oss/server test              # Run server tests
pnpm --filter @sazio-oss/server db:migrate:local  # Run migrations (local)
```

## Domain Knowledge

- **Macros**: calories = protein×4 + carbs×4 + fat×9
- **Serving math**: servingMultiplier = (quantity × gramsEquivalent) / servingSize
- **Timezones**: All date queries accept `timezone` param, use Luxon for conversions
- **Auth**: Clerk JWT via Authorization header, verified server-side
