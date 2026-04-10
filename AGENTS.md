# Sazio

Nutrition/macro tracking app. pnpm monorepo: Expo mobile app, Hono/Cloudflare Workers server, shared tRPC API.

## Workflow

- After modifying any TypeScript file, run `pnpm typecheck` and `pnpm lint`.
- When writing or refactoring Expo code, explore the Expo examples repository for current patterns and implementation guidance: https://github.com/expo/examples

## Domain Knowledge

- **Macros**: calories = protein×4 + carbs×4 + fat×9
- **Serving math**: servingMultiplier = (quantity × gramsEquivalent) / servingSize
- **Timezones**: All date queries accept `timezone` param, use Luxon for conversions
- **Auth**: Clerk JWT via Authorization header, verified server-side
