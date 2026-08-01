# Photo to ICS

A personal Expo/TypeScript app that turns a photo of an event flyer into a downloadable/shareable `.ics` calendar file using the Claude API's vision capability. Styled to the "Broadsheet" newsprint design system (Source Serif 4, Phosphor duotone icons, cyan/magenta accents).

## Getting started

```bash
npm install
npx expo start
```

On first launch, the app shows a one-screen setup asking for your Anthropic API key — it's stored encrypted on-device via `expo-secure-store` and never leaves the device except when sent directly to the Anthropic API. You can change it later from Settings (gear icon on Home).

## Flow

Setup (first run only) → Home → Scanning → Results → (Event detail/edit | Hand-off sheet → Confirmation)

- **Results** groups extracted events by day, supports a "Select" mode to exclude specific events before export, and flags any field Claude found hard to read on the photo.
- **Event detail** lets you edit every field; a flagged field offers Claude's alternative readings as tappable chips.
- **Hand-off sheet** offers three ways to get the events out:
  - **Add to Calendar** writes events directly into a calendar on the device via `expo-calendar` (the Android/iOS Calendar Provider), preferring a calendar synced from an Outlook/Exchange account if one exists, otherwise the device's default calendar. This is deliberately *not* a share-to-Outlook action — sharing an `.ics` file to the Outlook mobile app via the OS share sheet does not reliably create a calendar event (Outlook treats it as a generic file share, not a calendar import), so there's no reliable way to guarantee something lands specifically inside the Outlook app without this. For events added this way to actually show up *inside* the Outlook app (rather than just the phone's own Calendar app), the Outlook/Microsoft account needs to be added as a system account under the phone's own Settings → Accounts — installing the Outlook app alone isn't enough.
  - **Share the .ics file** and **Save to Files** route through the OS share sheet / Storage Access Framework as before, for anyone who wants the raw file.

## Project layout

```
App.tsx                        # font loading, initial-route check, navigation root
src/
├── screens/                   # Setup, Home, Settings, Scanning, Results, EventDetail, Confirmation
├── navigation/                 # stack navigator + route param types
├── context/ScanSessionContext.tsx  # shared in-memory state for one scan: events, skip/select, handoff method
├── components/                # Button, Tag, ThickThinRule, HandoffSheet
├── theme/broadsheet.ts        # design tokens: colors, spacing, radius, type scale
├── services/
│   ├── claudeApi.ts            # builds the vision request (structured output), sends image, parses JSON
│   ├── icsGenerator.ts         # event[] -> .ics string -> file
│   └── deviceCalendar.ts       # event[] -> written directly into a device calendar via expo-calendar
├── storage/apiKeyStore.ts      # expo-secure-store wrapper
├── types/event.ts              # ExtractedEvent (+ confidence fields) / SessionEvent
└── utils/
    ├── deviceTimezone.ts        # expo-localization wrapper
    └── dateFormat.ts            # day-grouping and date/weekday formatting for Results/Confirmation
```

## Known simplifications vs. the design handoff

- **Home is the menu variant only** (camera icon + library button). The camera-first live-viewfinder variant (corner brackets, shutter animation, in-app Recents sheet) is not built — photo capture still goes through `expo-image-picker`'s native camera/library launcher.
- **Android-specific chrome** (top app bar, card-based rows, FAB, Material ripple) is not built — Android currently renders the same layout as iOS.
- **Date/Start/End on the Event detail screen are plain text inputs**, not a native date/time picker.
- **The captured-photo "halftone" treatment on Scanning** is approximated with a flat dark tint over the real photo, not true halftone dot rendering.

## Build & distribution

- Android: `eas build --profile development --platform android` → sideload the APK
- iOS: `eas build --profile development --platform ios` → ad-hoc install (requires a $99/yr Apple Developer account)
