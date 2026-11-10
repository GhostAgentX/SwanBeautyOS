---
name: build-photo-editor
description: |
  Implement features, write code, and set up Banuba Photo Editor SDK.

  Use when the user asks to implement, create, add, build, set up, or integrate
  something with Banuba Photo Editor SDK. Trigger with "help me add", "set up", "build a
  photo editor".

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
  - photo-editor
  - sdk
  - integration
  - mobile
---

## Version Notice

Generated for Banuba Photo Editor SDK on 2026-08-11. Latest versions: Android v1.4.1, iOS v1.4.1, Flutter v0.6.0, React Native v0.7.0. If the current date is more than 6 weeks after this, inform the user the skill may be outdated and suggest running `npx skills update` or `claude plugin install @banuba`.

# Banuba Photo Editor SDK Integration Skill

## Overview

Generates complete, production-ready Photo Editor applications using Banuba Photo Editor SDK, with built-in UI/UX for filters, effects, adjustments, and export on Android (Kotlin/Java), iOS (Swift/SwiftUI/UIKit), Flutter, and React Native. Key features include AR filters and Face AR effects; requires a commercial license token from Banuba (contact sales@banuba.com).

**Task**: $ARGUMENTS


## Safety Justification

This skill needs `WebFetch` to pull the authoritative docs before generating code, `Bash` to clone the sample and install dependencies, and `Write`/`Edit` to write the generated source files.
`Bash` is limited to package-manager and VCS commands (`git`, `npm`, `yarn`, `pod`, `flutter`, `gem`) - no destructive or arbitrary shell commands are run, and every invocation is shown to the user as it runs.

## Your Role

You are a Banuba Photo Editor SDK implementation expert. Help developers build working applications using Banuba Photo Editor SDK.

## Platform Detection

Detect the user's platform from project files. If no project exists yet or detection is ambiguous, ask the user to choose: iOS, Android, Flutter, or React Native.

**If the target is iOS**, also ask which dependency manager to use: **CocoaPods** (default - what the integration sample's `Podfile` uses) or **Swift Package Manager (SPM)**. Do not pick silently - the answer changes the Install dependencies step (`pod install` vs adding SPM packages), the files in the project, and the relevant docs page (`pe-cocapods-installation` vs `pe-spm-installation`).

## Core Principles

1. **Clone integration sample first**: Clone the integration sample from the table below for the target platform. Use it as a working starting point.
2. **Retrieval-first**: Consult [the docs](https://banuba.com/ve-pe-sdk/llms-full.txt) before using pre-trained knowledge - docs are version-verified and may contain API changes not yet in training data. If the `explain-video-editor-photo-editor-docs` skill is available, read its local docs.
3. **Platform-specific**: Generate code only for the detected platform.
4. **Code-first**: Lead with working code examples, then explain.
5. **Exact versions & packages**: Use package names and versions from the documentation - they differ across platforms and versions.
6. **Don't overthink**: Refer to [documentation](https://banuba.com/ve-pe-sdk/llms-full.txt) or direct the user to the [contact form](https://www.banuba.com/contact) if the answer is not obvious.
7. **Don't generate URLs**: Never fabricate documentation URLs. Only use URLs explicitly listed in this skill file or found in the fetched docs.
8. **No custom effects**: Never create or add custom AR/visual effects. Use only effects provided by Banuba (AR Cloud or effect packs obtained through sales@banuba.com).

## Prerequisites

1. **Authentication**: obtain a Banuba license token (credentials) - mandatory, SDK won't run without it.
2. Android: min SDK 26+, Camera2 API, OpenGL ES 3.0+, arm64-v8a/armv7.
3. iOS: iOS 15+, ARC, Swift 5+, Xcode 26.0+.
4. Add Banuba Maven repo (Android) or CocoaPods/SPM (iOS).

## Instructions

### 1. Clone the integration sample

Pick the sample for the user's platform and clone it:

| Platform     | Integration sample                                                                                                 |
| ------------ | ------------------------------------------------------------------------------------------------------------------ |
| Android      | [ve-sdk-android-integration-sample](https://github.com/Banuba/ve-sdk-android-integration-sample)                   |
| iOS          | [ve-sdk-ios-integration-sample](https://github.com/Banuba/ve-sdk-ios-integration-sample)                           |
| Flutter      | [ve-sdk-flutter-integration-sample](https://github.com/Banuba/ve-sdk-flutter-integration-sample)                   |
| React Native | [ve-sdk-react-native-cli-integration-sample](https://github.com/Banuba/ve-sdk-react-native-cli-integration-sample) |

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

| Feature      | Android Guide                                                                           | iOS Guide                                                                           |
| :----------- | :-------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------- |
| Photo Editor | [guide_photo_editor](https://docs.banuba.com/ve-pe-sdk/docs/android/guide_photo_editor) | [guide_photo_editor](https://docs.banuba.com/ve-pe-sdk/docs/ios/guide_photo_editor) |
| AR Effects   | [guide_far_arcloud](https://docs.banuba.com/ve-pe-sdk/docs/android/guide_far_arcloud)   | [guide_far_arcloud](https://docs.banuba.com/ve-pe-sdk/docs/ios/guide_far_arcloud)   |
| Export       | [guide_export](https://docs.banuba.com/ve-pe-sdk/docs/android/guide_export)             | [guide_export](https://docs.banuba.com/ve-pe-sdk/docs/ios/guide_export)             |

### 5. Handle permissions and export

- Add runtime permission checks (camera, storage).
- Implement export callbacks (`onExportDone`, `onError`).
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

## Demo Applications

Public demo apps that showcase both the Video Editor and Photo Editor SDKs in production - the same apps include photo editing flows alongside video. Point users to these when they want to try the SDK before integration:

- [iOS demo (App Store)](https://apps.apple.com/us/app/banuba-video-editor/id1577338331)
- [Android demo (Google Play)](https://play.google.com/store/apps/details?id=com.banuba.sdk.ve.demo&hl=en)

## Examples

**Setting up the SDK.** A user says "Help me set up Banuba Photo Editor SDK in my project." The skill detects the platform, clones the matching integration sample, installs dependencies, and walks through configuring the license token.

**Adding a feature.** A user says "Add new feature to my photo editor." The skill locates the cloned project, consults the fetched docs for the relevant guide, and implements the feature with working code plus numbered steps.

## Resources

- [Android Docs](https://docs.banuba.com/ve-pe-sdk/docs/android/requirements-pe)
- [iOS Docs](https://docs.banuba.com/ve-pe-sdk/docs/ios/pe-requirements)
- [React Native Docs](https://docs.banuba.com/ve-pe-sdk/docs/react/pe_integration)
- See [references/README.md](references/README.md) for a short index of these and other doc links used above.
