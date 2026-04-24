# Sazio

Nutrition/macro tracking app. pnpm monorepo: Expo mobile app, Hono/Cloudflare Workers server, shared tRPC API.

## Workflow

- After modifying any TypeScript file, run `pnpm typecheck` and `pnpm lint`.

## Mobile UI Styling

- `mobile/lib/theme.ts` exposes the app's color theme from `mobile/theme.json` and the React Navigation theme. Use it when code needs concrete color values, such as icon colors, chart/ring colors, or navigation configuration.
- `mobile/lib/styles.ts` defines shared NativeWind class tokens for repeated layout, typography, and surface styles. Use it to keep screen gutters, headers, text hierarchy, card chrome, and row spacing consistent across screens.

## Domain Knowledge

- **Macros**: calories = protein×4 + carbs×4 + fat×9
- **Serving math**: servingMultiplier = (quantity × gramsEquivalent) / servingSize
- **Timezones**: All date queries accept `timezone` param, use Luxon for conversions
- **Auth**: Clerk JWT via Authorization header, verified server-side
