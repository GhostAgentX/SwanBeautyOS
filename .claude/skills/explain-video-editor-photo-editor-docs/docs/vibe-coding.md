# Agent Skills

> Agent Skills

# Agent Skills

# Build a Banuba Video Editor with AI

**In about an hour, you'll have a working Banuba Video or Photo Editor running in a local demo app on your laptop.**

**You don't need to write code yourself. Instead, you'll use an AI coding agent, tell it what to build, and Banuba's official AI Skills will guide it to set up the SDK correctly.**

**Difficulty:** ●●○○○ Beginner-friendly  
**Time:** ~1 hour  
**You need:** a laptop, a Banuba license key, the terminal app on your computer.

:::tip First time doing something like this?
That's exactly who this guide is for. You'll go through five prep steps and five build steps. Each step has a clear finish line, so you'll always know whether you're ready to move forward.

Stuck? Jump to [Troubleshooting](#troubleshooting).
:::

## What you'll have at the end

By the end of this guide, you'll have a working demo you can show to stakeholders, hand to a developer, or use to sharpen product requirements.

Concretely, you'll have:

- **A starter app** in your `banuba-demo` folder, ready to open in Android Studio or Xcode.
- **A running Banuba editor** on your simulator or emulator, where you can trim clips, apply filters, add AR effects, and export the result.
- **SDK-aligned demo code** generated with Banuba's official AI Skill instructions, which are released with SDK updates to keep the agent aligned with the latest integration flow.

### Two common scenarios

**No app yet?**  
This guide assumes this scenario. You'll create a new starter app from scratch with help from the AI agent.

**Already have an app?**  
You can point the agent to your existing project folder and ask it to add Banuba Video Editor or Photo Editor as a module inside your app.

## Who this guide is for

| If you're a… | This guide helps you… |
|---|---|
| **Application owner** evaluating Banuba | See a working demo before committing engineering resources |
| **Product manager** scoping a video or photo editing feature | Validate the user flow and understand what is required for a working integration |
| **Project manager** planning the integration | Estimate scope, prepare the right inputs, and brief engineering more clearly |
| **Junior developer** with the integration ticket | Get SDK-specific answers faster, avoid long documentation searches, and start from guided integration steps instead of a blank project |

## How it works

Three pieces work together:

1. **Banuba SDK**. The Video Editor or Photo Editor that runs inside your app. It requires a Banuba license key.
2. **AI coding agent**. A tool that can create and edit code based on your instructions. We recommend **Claude Code**. **Codex** and **Qwen Code** can also work; see [Alternative agents](#alternative-agents).
3. **Banuba's AI Skills**. Official instructions that teach the agent how to integrate Banuba SDKs correctly. They are released with SDK updates, so the agent stays aligned with the latest integration flow.

You install the agent once, install Banuba's AI Skills with one command, and then ask in plain English:

> Set up a Banuba Video Editor demo for Android.

---

## Prep - 15 minutes

:::tip Never used Terminal before?
Terminal is the text-window app where you type commands.
- **Mac:** Press `⌘ + Space`, type `Terminal`, press Enter.
- **Windows:** Press the Windows key, type `Terminal` or `PowerShell`, press Enter.

You type a command, press Enter, and the command runs. That's all you need for this guide.
:::

### 1. Get a Banuba license key

Request one on the [Banuba license page](https://www.banuba.com/video-editor-sdk). You'll receive a long alphanumeric token. Save it somewhere safe, you'll need it during setup.

:::tip Project managers
Request the license key early, even if someone else will run the build. License turnaround is one of the most common reasons demos slip.
:::

### 2. Pick your target platform

Choose one platform to start with. You can repeat the process for another platform later.

| Platform | What you need | Pick if… |
|---|---|---|
| **Android** | Android Studio (free), about 30 GB of free disk space | You do not have a Mac, or you want the simplest first setup |
| **iOS** | A Mac and Xcode | You are targeting iPhone or iPad first |
| **Flutter** | Flutter SDK + Android Studio and/or Xcode | You want one codebase for iOS and Android |
| **React Native** | Node.js + Android Studio and/or Xcode | You already have a React Native app |

:::warning Using an older Mac?
Before installing Xcode, confirm Banuba's supported Xcode range. Older Macs can be blocked by version mismatches.
:::

### 3. Install the platform toolchain

Install only the toolchain for the platform you picked.

- **Android Studio:** [https://developer.android.com/studio](https://developer.android.com/studio)
- **Xcode:** Open the App Store on Mac, search for Xcode, and install it
- **Flutter:** [https://docs.flutter.dev/get-started/install](https://docs.flutter.dev/get-started/install)
- **React Native:** [https://reactnative.dev/docs/environment-setup](https://reactnative.dev/docs/environment-setup)

**Done when:** you can run a sample project on a simulator or emulator.

### 4. Install Node.js

Node.js is required to run the Banuba AI Skills installer.

Download the LTS version from [https://nodejs.org](https://nodejs.org), then open Terminal and run:

```bash
node --version
```

Should return `v20.x.x` or higher.

**Done when:** Terminal returns a version number, for example `v20.x.x` or higher.

### 5. Install Claude Code

Claude Code is the AI coding agent that will help generate and modify the demo project.

Install it from [https://docs.claude.com/en/docs/claude-code](https://docs.claude.com/en/docs/claude-code), then open Terminal and run:

```bash
claude --version
```

Should return a version number.

**Done when:** Terminal returns a Claude Code version number.

✅ **You're ready when:**

- `node --version` works
- `claude --version` works
- You have run a sample app on your simulator or emulator at least once
- You have your Banuba license key ready

---

## Build - five steps to a working Video and Photo Editor

### 1. Create a project folder *(1 min)*

Open Terminal and run:

```bash
mkdir banuba-demo && cd banuba-demo
```

The folder name is up to you. In this guide, we'll use `banuba-demo`.

**Done when:** Terminal is inside your new project folder.

### 2. Install Banuba's AI Skills *(2 min)*

:::warning You do not need to open GitHub.
The command below is the installer. Copy the full command, paste it into Terminal, and press Enter.
:::

```bash
npx skills add Banuba/ai-skills -a claude-code
```

This downloads Banuba's official AI Skills into a hidden `.claude/skills/` folder inside your project.

The installed skills include:

- `build-video-editor` - helps set up Banuba Video Editor SDK
- `build-photo-editor` - helps set up Banuba Photo Editor SDK
- `explain-video-editor-photo-editor-docs` - helps the agent answer SDK documentation questions

**Done when:** Terminal prints a list of installed skills.

Optional commands:

```bash
# Install only the Video Editor skill
npx skills add Banuba/ai-skills --skill build-video-editor -a claude-code

# See the available skills first
npx skills add Banuba/ai-skills --list
```

### 3. Start Claude Code *(1 min)*

In the same Terminal window, run:

```bash
claude
```

A chat opens in Terminal. This is where you talk to the AI agent.

**Done when:** you see the Claude Code prompt and can type a message.

### 4. Ask the agent to build *(10–30 min)*

Type one of the prompts below. Replace the bracketed parts with your platform and Banuba license key.

**For Video Editor:**

```
/build-video-editor Set up a Banuba Video Editor demo for [Android].
Banuba license key: [paste your token]
```

**For Photo Editor:**

```
/build-photo-editor Set up a Banuba Photo Editor demo for [iOS] with photo effects and AR filters.
Banuba license key: [paste your token]
```

The agent will choose the right starter setup and generate the code. It may ask follow-up questions, such as which export resolution or default configuration to use.

When in doubt, answer:

> Use the defaults.

Claude Code may also ask for permission to create files, edit files, or run commands. Review the request and approve it if it matches the setup you asked for.

**Done when:** the agent says the build is finished and tells you how to run the app.

### 5. Run it *(5 min)*

Open the generated project in the relevant IDE:

- **Android:** Android Studio
- **iOS:** Xcode
- **Flutter:** Android Studio, VS Code, or Xcode depending on your target
- **React Native:** your usual IDE plus Android Studio or Xcode for running the app

Click **Run**. The agent will tell you which target, simulator, or emulator to use.

🎉 **You now have a working Banuba editor.**  
Try recording or selecting media, applying filters or effects, trimming, and exporting the result.

---

## What to do next

| If you're a… | Do this |
|---|---|
| **Application owner** | Record a short screen capture and align stakeholders on what matters before scoping production work. |
| **Product manager** | Iterate by re-prompting the agent. For example: "Add a music library," "Remove the beauty filters tab," or "Make export the primary action." |
| **Project manager** | Use the [handoff template](#developer-handoff-template) below to brief engineering clearly. |
| **Junior developer** | Use inline docs lookup when needed: `/explain-video-editor-photo-editor-docs How does export work?` Then connect the editor to the real app flow. |

### Developer handoff template

Paste this into a ticket or Slack message:

---

**Banuba Video/Photo Editor demo is ready for engineering review**

**What's done:**  
A working demo was scaffolded with Banuba's `[build-video-editor / build-photo-editor]` AI Skill for `[platform]`.

**Source:**  
`[path or repo link]`

**License key:**  
Stored in `[vault or secure location]`.  
Do not paste the license key directly into the ticket or Slack thread.

**Engineering, please review and complete:**

- Review the generated integration against our app architecture
- Replace the trial license with the correct production token when appropriate
- Wire the editor into `[feature / screen / user flow]`
- Confirm required permissions, media access, and export behavior
- Run our security, privacy, accessibility, and QA review
- Confirm the integration matches Banuba's latest SDK documentation

**References:**

- Banuba SDK documentation: [https://docs.banuba.com/ve-pe-sdk](https://docs.banuba.com/ve-pe-sdk/docs/ios/requirements)
- For inline documentation lookups in Claude Code, use: `/explain-video-editor-photo-editor-docs [your question]`

---

---

## Troubleshooting

Most issues happen because one of three things is missing: Node.js, Claude Code, or the correct project folder.

| Symptom | Cause | Fix |
|---|---|---|
| `npx: command not found` | Node.js is not installed, or Terminal has not refreshed after installation | Install Node.js from [https://nodejs.org](https://nodejs.org). Then close Terminal, reopen it, and run `node --version`. |
| `claude: command not found` | Claude Code is not installed, or Terminal cannot find it | Reinstall Claude Code from the [official Claude Code docs](https://docs.claude.com/en/docs/claude-code). Then close Terminal, reopen it, and run `claude --version`. |
| `/build-video-editor` not recognized | Claude Code was opened outside the folder where Banuba AI Skills were installed | Go back to your project folder with `cd banuba-demo`, then run `claude` again. |
| Skills installed, but the agent does not seem to use them | The skills may be installed in a different folder | Make sure you are in the same folder where you ran `npx skills add Banuba/ai-skills -a claude-code`. |
| Build finished, but the simulator or emulator will not launch | The platform toolchain may not be fully set up | Open the project in Android Studio or Xcode and click **Run** from there. The IDE usually gives clearer error messages. |
| License error at runtime | The platform toolchain may not be fully set up | Request a fresh key if needed. Then tell the agent: "Update the Banuba license key in this project." Paste the key only when the agent asks for it. |
| App builds, but camera or media access does not work | Required permissions may be missing or blocked | Ask the agent: "Check camera, microphone, and media permissions for this Banuba editor demo." |
| Export does not work | Export settings, storage permissions, or simulator limitations may be causing the issue | Ask the agent: "Check why export is not working and verify the export configuration." |

**Still stuck?**  
[Open an issue](https://github.com/Banuba/ai-skills/issues) or [contact Banuba support](https://www.banuba.com/support).

Include:

- Your target platform: Android, iOS, Flutter, or React Native
- Your SDK version, if known
- The command or prompt you used
- The full error message or screenshot
- Whether you are using a simulator, emulator, or real device

Do **not** paste your Banuba license key into public issues, Slack channels, or support screenshots.

---

## Reference

### All available skills

| Skill | What it does | Example prompt |
|---|---|---|
| `build-video-editor` | Sets up Banuba Video Editor SDK end-to-end | "Set up a short-form video editor with trimming, filters, AR effects, and export." |
| `build-photo-editor` | Sets up Banuba Photo Editor SDK end-to-end | "Set up a photo editor with effects, filters, and AR features." |
| `explain-video-editor-photo-editor-docs` | Answers questions using Banuba Video Editor and Photo Editor SDK documentation | "How do I change the export resolution?" |

The build skills include starter templates for **Android, iOS, Flutter, and React Native**. The agent can detect the platform from your prompt or project structure.

The skills run locally inside your AI coding agent. You do not need to paste long SDK documentation into every prompt, and the skills are kept aligned with Banuba SDK releases.

### Alternative agents {#alternative-agents}

| Agent | Install command |
|---|---|
| **Claude Code** *(recommended)* | `npx skills add Banuba/ai-skills -a claude-code` |
| Codex | `npx skills add Banuba/ai-skills -a codex` |
| Qwen Code | `npx skills add Banuba/ai-skills -a qwen-code` |

Skills are installed into the agent-specific skills folder, such as `.claude/skills/`, `.codex/skills/`, or `.qwen/skills/`.

### No agent setup?

**Use the LLM-ready documentation files instead:**

- [llms.txt](../llms.txt) - shorter version for quick context
- [llms-full.txt](../llms-full.txt) - complete version for deeper analysis

You can paste these files into ChatGPT, Claude.ai, Gemini, or another LLM.

This option is slower and will not create or edit files on your computer, but it is useful for a first look, product scoping, or asking documentation questions without setting up an AI coding agent.

### Glossary

- **Agent skill** - Packaged instructions that teach an AI coding agent how to complete a specific task correctly.
- **License key** - The Banuba credential that unlocks the SDK. It is required to run the SDK, including trial builds.
- **npx** - A tool that comes with Node.js. It can run an installer command without permanently installing that installer on your computer. In this guide, you use it to install Banuba AI Skills.
- **Repo (GitHub repo)** - A folder of code hosted on GitHub. For this guide, you do not need to open GitHub manually - the install command fetches the required files for you.
- **Simulator / emulator** - A virtual phone running on your laptop. It lets you test an app without using a real device.
- **Slash command** - A command inside an AI agent starting with `/`, like `/build-video-editor`.
- **Terminal** - The text-window app where you type commands. On Mac, it is called Terminal. On Windows, you can use Terminal or PowerShell.
- **IDE** - An app developers use to open, run, and edit projects. Examples include Android Studio, Xcode, Visual Studio Code, and WebStorm.
