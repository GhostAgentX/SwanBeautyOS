---
name: explain-video-editor-photo-editor-docs
description: |
  Look up Banuba Video and Photo Editor SDKs reference docs, guides, and configuration pages.

  Use when the user needs Banuba Video and Photo Editor SDKs docs - configuration, UI customization,
  export options, feature guides, or getting-started instructions. Also trigger with "Banuba Video and Photo Editor SDKs", "Video Editor",
  "Photo Editor", "Banuba SDK", or "VE/PE SDK" when the user needs an existing doc page.

  Not for writing code (use build-video-editor or build-photo-editor).
argument-hint: "[search-topic]"
allowed-tools: Read, Glob, Grep, WebFetch
version: 1.0.0
author: Banuba <sales@banuba.com>
license: Apache-2.0
compatibility: Claude Code
model: inherit
effort: medium
tags:
  - banuba
  - video-editor
  - photo-editor
  - sdk
  - documentation
---

## Version Notice

This skill was generated on 2026-05-15 against Banuba VE/PE SDK docs. SDK package versions vary per platform - see README for the per-platform breakdown. If the current date is more than 6 weeks after the generation date above, this skill is likely outdated.

**Inform the user** that a newer version may be available and suggest they update:

```bash
npx skills update
```

# Banuba Video & Photo Editor SDKs - Doc Lookup Skill

## Overview

You are a Banuba Video and Photo Editor SDKs documentation expert. Help developers find answers in the official docs, explain SDK features, and provide platform-specific guidance.

**Query**: $ARGUMENTS

## Prerequisites

- The bundled `./docs/` folder (including `llms-full.txt`) must be readable; no license token or build tooling is needed for lookups.
- Knowing the target platform (Android, iOS, Flutter, React Native) narrows the Doc Map lookup - detect it from project files or ask.

## Instructions

1. **Detect platform** from project files (build.gradle → Android, Podfile → iOS, pubspec.yaml → Flutter, package.json with react-native → React Native). If ambiguous, ask the user.
2. **Find the right doc** using the Doc Map below - pick the file(s) that match the query topic and platform.
3. **Read the local doc file** from `./docs/` relative to this skill's directory.
4. **If local docs are insufficient**, use `Glob`/`Grep` to search `./docs/` more broadly, then fall back to `./docs/llms-full.txt`, then to `WebFetch` on `https://banuba.com/ve-pe-sdk/llms-full.txt`.
5. **Respond** with the relevant section, code examples, and link to the local doc path.

## Core Principles

- **Local docs first**: Always read from `./docs/` before using pre-trained knowledge or fetching remote URLs.
- **Platform-specific**: Tailor answers to the detected platform.
- **Exact versions & packages**: Use package names and versions from the docs - they differ across platforms and versions.
- **Don't generate URLs**: Never fabricate URLs. Refer to local doc files or provide code snippets directly. Send the user to the [contact form](https://www.banuba.com/contact) when the answer isn't in the docs.
- **Don't overthink**: Refer to [documentation](https://banuba.com/ve-pe-sdk/llms-full.txt) or direct the user to the [contact form](https://www.banuba.com/contact) if the answer is not obvious.

## Doc Map

All paths are relative to `./docs/` within this skill's directory.

### Requirements & Getting Started

| Topic                   | Android                               | iOS                                                             |
| ----------------------- | ------------------------------------- | --------------------------------------------------------------- |
| VE requirements         | `android/requirements-ve.md`          | `ios/requirements.md`                                           |
| PE requirements         | `android/requirements-pe.md`          | `ios/pe-requirements.md`                                        |
| VE integration          | `android/integration-ve.md`           | `ios/integration-ve.md`                                         |
| PE installation         | `android/installation-pe.md`          | `ios/pe-cocapods-installation.md`, `ios/pe-spm-installation.md` |
| PE launching            | `android/launching-pe.md`             | `ios/launching-pe.md`                                           |
| PE configuration (iOS)  | -                                     | `ios/pe-configuration.md`                                       |
| Advanced integration    | `android/adv-integration-overview.md` | `ios/adv-integration-overview.md`                               |
| Mandatory modules (iOS) | -                                     | `ios/mandatory-modules.md`                                      |
| FAQ                     | `android/ve-faq.md`                   | `ios/ve-faq.md`                                                 |
| LLM & Vibe Coding       | `vibe-coding.md`                      | `vibe-coding.md`                                                |

| Topic           | Flutter                      | React Native               |
| --------------- | ---------------------------- | -------------------------- |
| VE installation | `flutter/ve_installation.md` | `react/ve_installation.md` |
| VE integration  | `flutter/ve_integration.md`  | `react/ve_integration.md`  |
| PE installation | `flutter/pe_installation.md` | `react/pe_installation.md` |
| PE integration  | `flutter/pe_integration.md`  | `react/pe_integration.md`  |

### Feature Guides (Android & iOS)

| Feature               | Android                               | iOS                            |
| --------------------- | ------------------------------------- | ------------------------------ |
| Camera                | `android/guide_camera.md`             | `ios/guide_camera.md`          |
| Editor screen         | `android/guide_editor.md`             | `ios/guide_editor.md`          |
| Editor V2             | `android/guide_editor_v2.md`          | `ios/guide_editor_v2.md`       |
| Export                | `android/guide_export.md`             | `ios/guide_export.md`          |
| Gallery               | `android/guide_gallery.md`            | `ios/guide_gallery.md`         |
| Cover image           | `android/guide_cover.md`              | `ios/guide_cover.md`           |
| AR effects / AR Cloud | `android/guide_far_arcloud.md`        | `ios/guide_far_arcloud.md`     |
| Green screen          | _(replaced by Camera Layouts in v1.52.0)_ | `ios/guide_green_screen.md`    |
| Stickers              | `android/guide_stickers.md`           | `ios/guide_stickers.md`        |
| Finger drawing        | `android/guide_finger_drawing.md`     | `ios/guide_finger_drawing.md`  |
| Audio content         | `android/guide_audio_content.md`      | `ios/guide_audio_content.md`   |
| Video recording       | `android/guide_video_recording.md`    | `ios/guide_video_recording.md` |
| Share / export video  | `android/guide_share_video.md`        | `ios/guide_share_video.md`     |
| Drafts                | `android/guide_drafts.md`             | `ios/guide_drafts.md`          |
| Weatherman (PiP)      | _(replaced by Camera Layouts in v1.52.0)_ | `ios/guide_weatherman.md`      |
| Camera Layouts        | `android/guide_camera_layouts.md`     | -                              |
| Photo Editor (open)   | `android/guide_open_pe.md`            | `ios/guide_open_pe.md`         |
| AI Clipping           | `android/ai_clipping.md`              | `ios/ai_clipping.md`           |
| Closed Captions       | `android/close_captions.md`           | `ios/close_captions.md`        |
| Video Templates       | `android/video_templates_guide.md`    | `ios/video_templates_guide.md` |
| FFmpeg                | `android/ffmpeg.md`                   | -                              |
| Licenses              | `android/dependencies_licenses_ve.md` | -                              |

### Feature Guides (Flutter & React Native)

| Feature         | Flutter                            | React Native                     |
| --------------- | ---------------------------------- | -------------------------------- |
| Camera screen   | `flutter/camera_screen_guide.md`   | `react/camera_screen_guide.md`   |
| Editor screen   | `flutter/editor_screen_guide.md`   | `react/editor_screen_guide.md`   |
| Editor V2       | `flutter/editor_v2_guide.md`       | `react/editor_v2_guide.md`       |
| Export          | `flutter/export_guide.md`          | `react/export_guide.md`          |
| Cover image     | `flutter/cover_guide.md`           | `react/cover_guide.md`           |
| Audio browser   | `flutter/audio_browser_guide.md`   | `react/audio_browser_guide.md`   |
| Stickers        | `flutter/stickers_guide.md`        | `react/stickers_guide.md`        |
| Drafts          | `flutter/drafts_guide.md`          | `react/drafts_guide.md`          |
| AI Clipping     | `flutter/ai_clipping_guide.md`     | `react/ai_clipping_guide.md`     |
| Captions        | `flutter/captions_guide.md`        | `react/captions_guide.md`        |
| Video Templates | `flutter/video_templates_guide.md` | `react/video_templates_guide.md` |
| Video duration  | `flutter/video_duration_guide.md`  | `react/video_duration_guide.md`  |

### Release Notes & Migration

| Topic                          | File                                                        |
|--------------------------------|-------------------------------------------------------------|
| Latest major release (v1.53.0) | `release-notes/1.53.0.md`                                   |
| VE patch series (1.51.x)       | `release-notes/1.51.x_patches.md` (Android/iOS native only) |
| Full Android changelog         | `release-notes/Android.md`                                  |
| Known issues                   | `release-notes/Known_issues.md`                             |
| Reducing SDK size (Android)    | `release-notes/Reducing_SDK_Size_on_Android.md`             |
| Version-specific notes         | `release-notes/` (file named after the target version, e.g. `1.50.0.md`) |

> For migration between SDK versions, read the target version's release notes file - each contains a **Migration Guide** section with dependency updates, API changes, and links to sample PRs.

## Related Skills

- Use `/build-video-editor` when the user needs Video Editor implementation help, not just docs.
- Use `/build-photo-editor` when the user needs Photo Editor implementation help, not just docs.

## Output

- Quote the relevant section from the local doc, including code examples, and link the local doc path so the user can find it in the bundle.
- Note the platform(s) the answer applies to when a feature differs across Android/iOS/Flutter/React Native.

## Error Handling

- If local docs are insufficient, fall back to `./docs/llms-full.txt`, then to `https://banuba.com/ve-pe-sdk/llms-full.txt`.
- Never fabricate a doc URL or file path - only use paths listed in the Doc Map or found in the fetched docs.
- If the answer isn't in the docs, direct the user to the [contact form](https://www.banuba.com/contact).
- If the platform is ambiguous, ask the user to choose rather than guessing.

## Examples

**Documentation lookup.** A user asks "How do I customize the camera screen in Banuba Video Editor SDK?" The skill looks up the camera guide in the Doc Map and answers with the relevant section from the local docs.

## Resources

- [LLM-optimized docs](https://banuba.com/ve-pe-sdk/llms-full.txt) - remote fallback when local docs don't cover a topic.
- [Contact form](https://www.banuba.com/contact) - when the answer isn't in the docs.
- See `references/README.md` for a short index of the doc sources above and the local Doc Map.
