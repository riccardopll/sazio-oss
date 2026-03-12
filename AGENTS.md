# Sazio

Nutrition/macro tracking app. pnpm monorepo: Expo mobile app, Hono/Cloudflare Workers server, shared tRPC API.

## Commands

```bash
pnpm --filter @sazio-oss/shared build               # Build API package
pnpm --filter @sazio-oss/server db:migrate:local    # Run migrations (local)
```

## Workflow

- After modifying any TypeScript file, run `pnpm typecheck` and `pnpm lint`.
- Prefer the simplest and most concise implementation that keeps the code understandable.
- Avoid clever abstractions, over-optimization, and style hacks when a straightforward solution is clearer.
- Prefer NativeWind for styling in the mobile app, but only when it keeps the code simple and readable; use small explicit React Native styles when that is clearly simpler.
- When writing or refactoring Expo code, explore the Expo examples repository for current patterns and implementation guidance: https://github.com/expo/examples

## Domain Knowledge

- **Macros**: calories = protein×4 + carbs×4 + fat×9
- **Serving math**: servingMultiplier = (quantity × gramsEquivalent) / servingSize
- **Timezones**: All date queries accept `timezone` param, use Luxon for conversions
- **Auth**: Clerk JWT via Authorization header, verified server-side
