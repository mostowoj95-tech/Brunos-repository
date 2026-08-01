# Photo to ICS

A personal Expo/TypeScript app that turns a photo of an event flyer into a downloadable/shareable `.ics` calendar file using the Claude API's vision capability.

## Getting started

```bash
npm install
npx expo start
```

On first launch, open Settings (gear icon on Home) and paste your Anthropic API key — it's stored encrypted on-device via `expo-secure-store` and never leaves the device except when sent directly to the Anthropic API.

## Project layout

```
App.tsx                      # navigation root
src/
├── screens/                 # Home, Settings, Processing, Results
├── navigation/               # stack navigator + route param types
├── services/
│   ├── claudeApi.ts          # builds the vision request, sends image, parses JSON
│   └── icsGenerator.ts       # event[] -> .ics string -> file
├── storage/apiKeyStore.ts    # expo-secure-store wrapper
├── types/event.ts            # shared ExtractedEvent type
└── utils/deviceTimezone.ts   # expo-localization wrapper
```

## Build & distribution

- Android: `eas build --profile development --platform android` → sideload the APK
- iOS: `eas build --profile development --platform ios` → ad-hoc install (requires a $99/yr Apple Developer account)

See the build spec this project was scaffolded from for full details on distribution options.
