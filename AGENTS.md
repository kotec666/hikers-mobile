# Hikers Mobile Monorepo — Agent Notes

## Structure

This is a monorepo with three independent packages plus shared utilities:

- **mobile/** — Expo React Native app (entrypoint: `expo-router/entry`). Uses Yarn 1.22.22, Tailwind via Nativewind, Shadcn UI components. Has native modules directory (`modules`) for custom native code; do not edit generated files under `node_modules/@expo/...` or build artifacts.
- **backend/** — NestJS TypeScript API server with Drizzle ORM migrations (`drizzle-kit push`), Swagger docs, Socket.IO support. Symlinks `../shared` into `src/shared`. Uses Yarn 1.x.
- **frontend/** — Next.js app (uses corepack-enabled Yarn 4.14.1). Tailwind v4, Shadcn UI. No symlink to shared here.

**shared/** contains TypeScript utilities (`constants.ts`, `enums.ts`, `errors.ts`, `helpers.ts`, `lengths.ts`) that are imported by backend and frontend via path aliases.

## Mobile project

- Use `yarn start:dev` to launch the dev client. For remote debugging via SSH tunnel, use `yarn start:withVPN`.
- To build a standalone app bundle run `yarn build`; this executes `expo prebuild` and then runs `node ./scripts/withLocalProperties.js` to inject local environment variables.
- Native modules live in `modules/`. Do not edit generated code under `node_modules/@expo/...` or any build artifacts.

## Build order (CI pattern)

Run in this sequence for each package:

```bash
yarn lint        # eslint with auto-fix where applicable
yarn build       # NestJS compiles to dist/; Next.js runs next build
```

The CI workflow also enables corepack and prepares Yarn 4.14.1 in frontend before installing dependencies — do the same if you clone fresh:

```bash
cd frontend && corepack enable && corepack prepare yarn@4.14.1 --activate
yarn install
```

## Notable quirks / gotchas

- Backend symlinks `../shared` into `src/shared`. If you copy files from shared, preserve the symlink; otherwise imports will break.
- Frontend does **not** symlink shared — it uses path aliases configured in tsconfig.
- Mobile is an Expo managed project with native modules directory (`modules`). Do not edit generated code under `node_modules/@expo/...` or build artifacts.
- The root-level `docker-compose.yaml` runs the backend and frontend services; deployment script (`start.sh`) is invoked via SSH from CI.

## Testing hints

- Backend: `yarn test` runs Jest against `src/**/*.test.ts`. Integration tests may require a running DB — check for `.env` with `DATABASE_URL`.
- Frontend: no dedicated test command in package.json; use Next.js built-in tests if present or run Playwright manually.
- Mobile: Expo's default test runner is Detox/Appium via EAS; see `eas.json` for configured platforms.

## Commands summary

| Package | Lint | Build | Start dev        |
|---------|------|-------|------------------|
| backend | `yarn lint` | `yarn build` | `yarn start:dev` |
| frontend | `yarn lint` | `yarn build` | `yarn dev`       |
| mobile  | `yarn lint` | `yarn build` | `yarn start`     |

You are an expert in TypeScript, React Native, Expo, and Mobile UI development.

Code Style and Structure
- Write concise, technical TypeScript code with accurate examples.
- Use functional and declarative programming patterns; avoid classes.
- Prefer iteration and modularization over code duplication.
- Use descriptive variable names with auxiliary verbs (e.g., isLoading, hasError).
- Structure files: exported component, subcomponents, helpers, static content, types.
- Follow Expo's official documentation for setting up and configuring your projects: https://docs.expo.dev/

Naming Conventions
- Use lowercase with dashes for directories (e.g., components/auth-wizard).
- Favor named exports for components.

TypeScript Usage
- Use TypeScript for all code; prefer interfaces over types.
- Avoid enums; use maps instead.
- Use functional components with TypeScript interfaces.
- Use strict mode in TypeScript for better type safety.

Syntax and Formatting
- Use the "function" keyword for pure functions.
- Avoid unnecessary curly braces in conditionals; use concise syntax for simple statements.
- Use declarative JSX.
- Use Prettier for consistent code formatting.

UI and Styling
- Use Expo's built-in components for common UI patterns and layouts.
- Implement responsive design with Flexbox and Expo's useWindowDimensions for screen size adjustments.
- Use styled-components or Tailwind CSS for component styling.
- Implement dark mode support using Expo's useColorScheme.
- Ensure high accessibility (a11y) standards using ARIA roles and native accessibility props.
- Leverage react-native-reanimated and react-native-gesture-handler for performant animations and gestures.

Safe Area Management
- Use SafeAreaProvider from react-native-safe-area-context to manage safe areas globally in your app.
- Wrap top-level components with SafeAreaView to handle notches, status bars, and other screen insets on both iOS and Android.
- Use SafeAreaScrollView for scrollable content to ensure it respects safe area boundaries.
- Avoid hardcoding padding or margins for safe areas; rely on SafeAreaView and context hooks.

Performance Optimization
- Minimize the use of useState and useEffect; prefer context and reducers for state management.
- Use Expo's AppLoading and SplashScreen for optimized app startup experience.
- Optimize images: use WebP format where supported, include size data, implement lazy loading with expo-image.
- Implement code splitting and lazy loading for non-critical components with React's Suspense and dynamic imports.
- Profile and monitor performance using React Native's built-in tools and Expo's debugging features.
- Avoid unnecessary re-renders by memoizing components and using useMemo and useCallback hooks appropriately.

Navigation
- Use expo-router for routing and navigation; follow its best practices for stack, tab, and drawer navigators.
- Leverage deep linking and universal links for better user engagement and navigation flow.
- Use dynamic routes with expo-router for better navigation handling.

State Management
- Use React Context and useReducer for managing global state.
- Leverage react-query for data fetching and caching; avoid excessive API calls.
- For complex state management, consider using Zustand or Redux Toolkit.
- Handle URL search parameters using libraries like expo-linking.

Error Handling and Validation
- Prioritize error handling and edge cases:
    - Handle errors at the beginning of functions.
    - Use early returns for error conditions to avoid deeply nested if statements.
    - Avoid unnecessary else statements; use if-return pattern instead.
    - Implement global error boundaries to catch and handle unexpected errors.
- Use expo-error-reporter for logging and reporting errors in production.

Testing
- Write unit tests using Jest and React Native Testing Library.
- Implement integration tests for critical user flows using Detox.
- Use Expo's testing tools for running tests in different environments.
- Consider snapshot testing for components to ensure UI consistency.

Security
- Sanitize user inputs to prevent XSS attacks.
- Use expo-secure-store for secure storage of sensitive data.
- Ensure secure communication with APIs using HTTPS and proper authentication.

Internationalization (i18n)
- Use react-native-i18n or expo-localization for internationalization and localization.
- Support multiple languages and RTL layouts.
- Ensure text scaling and font adjustments for accessibility.

Key Conventions
1. Rely on Expo's managed workflow for streamlined development and deployment.
2. Prioritize Mobile Web Vitals (Load Time, Jank, and Responsiveness).
3. Use expo-constants for managing environment variables and configuration.
4. Implement expo-updates for over-the-air (OTA) updates.
5. Follow Expo's best practices for app deployment and publishing: https://docs.expo.dev/distribution/introduction/
6. Ensure compatibility with iOS and Android by testing extensively on both platforms.

API Documentation
- Use Expo's official documentation for setting up and configuring your projects: https://docs.expo.dev/