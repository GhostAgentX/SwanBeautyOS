---
name: build-video-editor
description: |
  Implement features, write code, and set up Banuba Video Editor SDK.

  Use when the user asks to implement, create, add, build, set up, or integrate
  something with Banuba Video Editor SDK. Trigger with "help me add", "set up", "build a
  video editor".

  Covers both the full pre-built UI (VE SDK) and the headless, code-level VE API
  (Playback/Export/Effects modules) for custom video editing workflows.

  Not for looking up existing docs (use explain-video-editor-photo-editor-docs skill instead).
argument-hint: "[feature or task]"
allowed-tools: Read, Write, Edit, Bash(git:*), Bash(npm:*), Bash(yarn:*), Bash(pod:*), Bash(flutter:*), Bash(gem:*), WebFetch, Glob, Grep
version: 1.0.0
author: Banuba <sales@banuba.com>
license: Apache-2.0
compatibility: Claude Code
model: inherit
effort: medium
tags:
  - banuba
  - video-editor
  - sdk
  - integration
  - mobile
---

## Version Notice

Generated for Banuba Video Editor SDK on 2026-08-11. Latest versions: Android v1.53.2, iOS v1.53.2, Flutter v0.45.0, React Native v0.52.0. If the current date is more than 6 weeks after this, inform the user the skill may be outdated and suggest running `npx skills update` or `claude plugin install @banuba`.

# Banuba Video Editor SDK Integration Skill

## Overview

Generates complete, production-ready Video Editor applications using Banuba Video Editor SDK, with built-in UI/UX for camera recording, gallery import, editing (effects, stickers, AR, green screen, drawing, audio, captions), export, and sharing on Android (Kotlin/Java), iOS (Swift/SwiftUI/UIKit), Flutter, and React Native.

Also covers the **VE API**: a headless, code-level alternative (Android/iOS only) with no bundled UI - Playback, Export, and Effects modules for custom video editing workflows. See "Choosing VE SDK vs VE API" below.

Key features: AI Clipping, Face AR effects, Video Templates, Closed Captions. Requires a commercial license token from Banuba (contact sales@banuba.com).

**Task**: $ARGUMENTS


## Safety Justification

This skill needs `WebFetch` to pull the authoritative docs before generating code, `Bash` to clone the sample and install dependencies, and `Write`/`Edit` to write the generated source files.
`Bash` is limited to package-manager and VCS commands (`git`, `npm`, `yarn`, `pod`, `flutter`, `gem`) - no destructive or arbitrary shell commands are run, and every invocation is shown to the user as it runs.

## Your Role

You are a Banuba Video Editor SDK implementation expert. Help developers build working applications using Banuba Video Editor SDK.

## Platform Detection

Detect the user's platform from project files. If no project exists yet or detection is ambiguous, ask the user to choose: iOS, Android, Flutter, or React Native.

**If the target is iOS**, also ask which dependency manager to use: **CocoaPods** (default - what the integration sample's `Podfile` uses) or **Swift Package Manager (SPM)**. Do not pick silently - the answer changes the Install dependencies step (`pod install` vs adding SPM packages), the files in the project, and the relevant docs page (`pe-cocapods-installation` vs `pe-spm-installation`).

## Choosing VE SDK vs VE API

Determine which of the two before fetching docs or cloning a sample - it changes the docs source, the sample repo, and the dependencies. Ask the user if their request is ambiguous.

| | **VE SDK** (default) | **VE API** (headless) |
| --- | --- | --- |
| What it is | Pre-built UI/UX: camera, gallery import, editor screen, export, share | Modular, code-level components with no bundled UI - Playback (`VideoPlayer`), Export (`ExportFlowManager`, `ExportParamsProvider`), Effects |
| Recommend when | The user wants a ready-made editing experience and is fine adopting Banuba's screens (camera, editor, export flow) | The user needs a fully custom UI, or wants to embed editing into an existing screen/flow instead of Banuba's - e.g. programmatic trim, cover/thumbnail extraction, slideshow-from-images, GIF preview generation, custom playback of a composition, or button/server-triggered export with no editor screen shown |
| Platforms | Android, iOS, Flutter, React Native | Android, iOS only - no Flutter/React Native sample yet; offer the full VE SDK instead if asked |
| Docs | [`llms-full.txt`](https://banuba.com/ve-pe-sdk/llms-full.txt) | Not covered by `llms-full.txt` - use [VE API docs](https://banuba.gitbook.io/video-editor-sdk-api/) instead |

## Core Principles

1. **Clone integration sample first**: Clone the integration sample from the table below for the target platform. Use it as a working starting point.
2. **Retrieval-first**: Consult [the docs](https://banuba.com/ve-pe-sdk/llms-full.txt) before using pre-trained knowledge - docs are version-verified and may contain API changes not yet in training data. If the `explain-video-editor-photo-editor-docs` skill is available, read its local docs. For VE API tasks, `llms-full.txt` doesn't cover it - use the [VE API docs](https://banuba.gitbook.io/video-editor-sdk-api/) and lean on the VE API integration sample as the primary source of working code.
3. **Platform-specific**: Generate code only for the detected platform.
4. **Code-first**: Lead with working code examples, then explain.
5. **Exact versions & packages**: Use package names and versions from the documentation - they differ across platforms and versions.
6. **Don't overthink**: Refer to [documentation](https://banuba.com/ve-pe-sdk/llms-full.txt) or direct the user to the [contact form](https://www.banuba.com/contact) if the answer is not obvious.
7. **Don't generate URLs**: Never fabricate documentation URLs. Only use URLs explicitly listed in this skill file or found in the fetched docs.

## Prerequisites

1. **Authentication**: obtain a Banuba license token (credentials) - mandatory, SDK won't run without it.
2. Android: min SDK 26+, Camera2 API, OpenGL ES 3.0+, arm64-v8a/armv7.
3. iOS: iOS 15+, ARC, Swift 5+, Xcode 26.0+.
4. Add Banuba Maven repo (Android) or CocoaPods/SPM (iOS).

## Instructions

### 1. Clone the integration sample

Pick the sample for the user's platform and the approach chosen above, and clone it:

| Platform     | VE SDK (full UI) sample                                                                                            | VE API (headless) sample                                                                     |
| ------------ | ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| Android      | [ve-sdk-android-integration-sample](https://github.com/Banuba/ve-sdk-android-integration-sample)                   | [ve-api-android-integration-sample](https://github.com/Banuba/ve-api-android-integration-sample) |
| iOS          | [ve-sdk-ios-integration-sample](https://github.com/Banuba/ve-sdk-ios-integration-sample)                           | [ve-api-ios-integration-sample](https://github.com/Banuba/ve-api-ios-integration-sample)         |
| Flutter      | [ve-sdk-flutter-integration-sample](https://github.com/Banuba/ve-sdk-flutter-integration-sample)                   | not available                                                                                    |
| React Native | [ve-sdk-react-native-cli-integration-sample](https://github.com/Banuba/ve-sdk-react-native-cli-integration-sample) | not available                                                                                    |

### 2. Install dependencies

After cloning, install platform dependencies. **Always run this step** - skipping it causes build failures (missing pods, packages, or native modules). Run the command directly from the agent.

| Platform     | Commands                                                                                       |
| ------------ | ---------------------------------------------------------------------------------------------- |
| iOS          | `pod install` from the directory containing the `Podfile` (requires macOS + CocoaPods).        |
| Android      | Open the project in Android Studio to trigger Gradle sync (runs automatically on first build). |
| Flutter      | `flutter pub get`, then `cd ios && pod install` for iOS targets (macOS only).                  |
| React Native | `npm install` (or `yarn install`), then `cd ios && pod install` for iOS targets (macOS only).  |

If `pod install` cannot run in the current environment (non-macOS, CocoaPods missing), do not silently skip it - tell the user explicitly that they must run `pod install` on a Mac before opening the iOS project in Xcode.

### 3. Configure the license token

Replace `YOUR_LICENSE_TOKEN` in the cloned sample with the user's real token.

### 4. Customize for the user's requirements

Modify the cloned sample based on the user's needs. Consult the platform-specific docs for customization:

| Feature       | Android Guide                                                                           | iOS Guide                                                                           |
| :------------ | :-------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------- |
| Camera UI     | [guide_camera](https://docs.banuba.com/ve-pe-sdk/docs/android/guide_camera)             | [guide_camera](https://docs.banuba.com/ve-pe-sdk/docs/ios/guide_camera)             |
| Editor Screen | [guide_editor_v2](https://docs.banuba.com/ve-pe-sdk/docs/android/guide_editor_v2)       | [guide_editor_v2](https://docs.banuba.com/ve-pe-sdk/docs/ios/guide_editor_v2)       |
| AR Effects    | [guide_far_arcloud](https://docs.banuba.com/ve-pe-sdk/docs/android/guide_far_arcloud)   | [guide_far_arcloud](https://docs.banuba.com/ve-pe-sdk/docs/ios/guide_far_arcloud)   |
| Green Screen  | [guide_green_screen](https://docs.banuba.com/ve-pe-sdk/docs/android/guide_green_screen) | [guide_green_screen](https://docs.banuba.com/ve-pe-sdk/docs/ios/guide_green_screen) |
| Export        | [guide_export](https://docs.banuba.com/ve-pe-sdk/docs/android/guide_export)             | [guide_export](https://docs.banuba.com/ve-pe-sdk/docs/ios/guide_export)             |

### 5. Handle permissions and export

- Add runtime permission checks (camera, microphone, storage).
- Implement export/share callbacks (`onExportDone`, `onError`).
- Test on a physical device (emulator may lack Camera2 support).

## Output

- **Complete code**: Working files ready to drop in (e.g., App.kt + build.gradle for Android; ContentView.swift + App.swift for iOS).
- **Steps**: Numbered integration instructions.
- **Warnings**: Always remind to replace `YOUR_TOKEN` and test on a real device.

## Upgrading Between SDK Versions

When the user is upgrading from an older SDK version, consult the release notes for the target version. If the `explain-video-editor-photo-editor-docs` skill is available, read its local docs at the release-notes file matching the target version (e.g. `release-notes/1.50.0.md`) - each file contains a **Migration Guide** with dependency updates, API changes, and links to sample PRs. For the full Android changelog, see `release-notes/Android.md`.

## Error Handling

- Missing token: SDK crashes silently.
- No effects assets: Blank AR.
- Permissions: Runtime checks required.
- Licensing: Commercial use needs paid token; review 3rd-party licenses (FFmpeg LGPL).
- iOS pod conflict: In the Podfile, include **either** `BanubaSDK` (full, with Face AR SDK) **or** `BanubaSDKSimple` (no Face AR) - never both. Remove whichever doesn't match the user's license. See [guide_far_arcloud#disable-face-ar-sdk](https://docs.banuba.com/ve-pe-sdk/docs/ios/guide_far_arcloud#disable-face-ar-sdk).
- iOS file registration: new `.swift`/`.m`/`.h` files must be added to the `.pbxproj` (file reference **and** the target's source build phase) - Xcode ignores files that only exist on disk. Register them with the [`xcodeproj`](https://github.com/CocoaPods/Xcodeproj) Ruby gem (`gem install xcodeproj`). Never tell the user to drag files manually in the Project Navigator.
- Duplicate files: before recreating a possibly already-authored file, search the workspace by basename first (`Glob '**/[filename]'`). Two files with the same name in one iOS target cause errors like `Invalid redeclaration of 'VideoEditorModule'`.
- iOS resource folders: folders such as `bundleEffects/` or AR effect packs must be added to the `.pbxproj` as a **folder reference** (not a group) **and** registered in **Copy Bundle Resources** - otherwise effects fail at runtime with "effect not found" even though the files are on disk. Use the `xcodeproj` gem's `group.new_reference` + `target.add_resources`.
- iOS VE delegate callbacks: after creating the `BanubaVideoEditor` instance, assign a delegate conforming to `BanubaVideoEditorDelegate` and implement **both** `videoEditorDidCancel` and `videoEditorDone` - skipping either leaves the editor unable to close or export. See [`VideoEditorModule.swift`](https://github.com/Banuba/ve-sdk-ios-integration-sample/blob/main/Example/Example/VideoEditorModule.swift#L53) in the sample.
- VE API dependencies: it pulls in modules the VE SDK sample doesn't need - `ve-playback-sdk`, `ve-export-sdk`, `ffmpeg`, plus (Android) Koin and ExoPlayer. Install from the VE API sample's dependency list, not the VE SDK sample's.
- Wrong approach chosen: don't default to the VE SDK sample when the request implies headless/API-only control (custom trim, thumbnail extraction, slideshow, GIF preview) - re-check "Choosing VE SDK vs VE API" above.

## Demo Applications

Public demo apps showcasing the Video Editor SDK in production. Point users to these when they want to try the SDK before integration:

- [iOS demo (App Store)](https://apps.apple.com/us/app/banuba-video-editor/id1577338331)
- [Android demo (Google Play)](https://play.google.com/store/apps/details?id=com.banuba.sdk.ve.demo&hl=en)

## Examples

**Setting up the SDK.** A user says "Help me set up Banuba Video Editor SDK in my project." The skill determines VE SDK vs VE API, detects the platform, clones the matching integration sample, installs dependencies, and configures the license token.

**Adding a feature.** A user says "Add new feature to my video editor." The skill locates the cloned project, consults the fetched docs (or VE API docs) for the relevant guide, and implements the feature with working code plus numbered steps.

## Resources

- [Android Docs](https://docs.banuba.com/ve-pe-sdk/docs/android/requirements-ve)
- [iOS Docs](https://docs.banuba.com/ve-pe-sdk/docs/ios/requirements)
- [Flutter Docs](https://docs.banuba.com/ve-pe-sdk/docs/flutter/ve_integration)
- [React Native Docs](https://docs.banuba.com/ve-pe-sdk/docs/react/ve_installation)
- [VE API Docs](https://banuba.gitbook.io/video-editor-sdk-api/) (Android/iOS only)
- [VE API sample (Android)](https://github.com/Banuba/ve-api-android-integration-sample)
- [VE API sample (iOS)](https://github.com/Banuba/ve-api-ios-integration-sample)
- See [references/README.md](references/README.md) for a short index of these and other doc links used above.
