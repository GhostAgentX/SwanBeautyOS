# Build mode: build reference

Read this when the request is in Build mode: add, implement, set up, integrate, scaffold, generate code, or fix project files with Banuba Face AR SDK. Platform detection and shared principles are in the router (`SKILL.md`); this file covers the full build workflow for Web, Android, iOS, Desktop, Flutter, and React Native platforms.

## Your role

Banuba Face AR SDK implementation expert. Build working applications on Web, Android, iOS, Desktop (C++), Flutter, and React Native. Lead with working code, then explain.

## Platform detection

Detect from workspace files, or ask one question if unclear.

| Signal | Platform |
|---|---|
| `pubspec.yaml`, `lib/main.dart`, dependency `banuba_sdk`, or user says "Flutter" | Flutter |
| `package.json` with `react-native`, `metro.config.*`, dependency `@banuba/react-native`, or user says "React Native" / "RN" | React Native |
| `package.json` (no `react-native`), `vite.config.*`, `webpack.config.*`, `index.html` + JS bundler | Web |
| `build.gradle`, `build.gradle.kts`, `AndroidManifest.xml`, `*.kt`, `*.java` | Android |
| `*.xcodeproj`, `*.xcworkspace`, `Podfile`, `*.swift`, `*.m` | iOS |
| `CMakeLists.txt`, `*.cpp`, `*.hpp`, or user says "desktop" / "C++" | Desktop |

---

## Version and package discipline

- Native Face AR SDK modules use the FAR SDK line in this skill (`1.18.5` in exact native snippets, `1.18.+` / `~> 1.18.0` in wrapper integration snippets where the docs use ranges).
- Flutter `banuba_sdk` and React Native `@banuba/react-native` are wrapper packages with independent public versions. Do not reuse native `1.18.x` as the Flutter or RN package version.
- Video Editor / Photo Editor SDK package versions are separate from Face AR SDK package versions. Do not answer FAR wrapper-version questions with VE/PE versions.
- When the user asks for "latest", "current", "what version should I install today", or similar, verify against the official registry first (`pub.dev` for Flutter, npm for React Native, official docs/releases for native SDKs).
- If a project already has a lockfile or explicit version constraint, preserve the project's package manager style and avoid changing unrelated dependency policy.

## Docs search hygiene

- Search bundled Markdown docs and `docs/llms-full.txt` first.
- Avoid broad `rg` over `docs/generated/` unless looking for an exact API symbol. Generated HTML produces large noisy matches and can drown out the guide pages.
- Do not edit bundled `docs/` to correct upstream inconsistencies. Add corrective agent behavior in this `reference/` file instead.

## Shared principles

### Demo effects

When building a project from scratch, or when the user asks to add effects without naming a specific subset, download and install all available demo ZIP effects from:

> https://docs.banuba.com/far-sdk/tutorials/capabilities/demo_face_filters

Use bundled Markdown first (`docs/tutorials/capabilities/demo_face_filters.md` inside this skill's docs, when available); fetch the live URL if the bundled file is missing or seems outdated. Do not state or rely on a fixed number of demo effects — the table is the source of truth.

Default selection means every downloadable effect from the table except:
- `Makeup.zip` / Virtual Makeup API effect: exclude on every platform.
- `test_Nails.zip` / Virtual nails effect: exclude on every platform except native iOS. Include it only for native iOS projects.

Each effect entry provides:
- **Download URL**: `https://docs.banuba.com/far-sdk/generated/effects/<filename>.zip`
- **Icon URL**: `https://docs.banuba.com/far-sdk/generated/effects/icons/<icon_filename>.png`
- **Description** (Technologies represented column)
- **Required modules** (Required packages column)

Physically download and install the selected ZIP effects into the platform-specific effects folder (see each platform section for the exact path). For new projects where no platform path is specified yet, place `effects/` at the project root. Use the installed set for generated code and UI; do not emit a representative sample. If a single demo effect URL returns `404` or another transient download error, log that effect name, continue downloading the rest, and report the skipped effect in the final response.

After unzipping each effect, verify there is no double-nesting:

```bash
ls <effects_path>/Afro/
# Must show: config.json  images/  shaders/  ...
# Must NOT show a subfolder named "Afro"
```

If you see `effects/Afro/Afro/`, fix it:

```bash
mv <effects_path>/Afro/Afro/* <effects_path>/Afro/ && rmdir <effects_path>/Afro/Afro
```

Always reference effects by their local path (e.g. `effects/TrollGrandma`). Never pass the download URL directly to the player or Effect constructor — download first, then use the local path.

### Multi-face

Always confirm the client token includes Max Faces support before implementing multi-face UI. Without it, the SDK silently tracks only one face — no runtime workaround exists on any platform. Banuba Studio produces single-face effects only. For multi-face effects, direct to the [contact form](https://www.banuba.com/contact).

### AR Cloud

For remote effect delivery on any platform, read `docs/tutorials/development/guides/ar_cloud.md`.

### Custom effects

The agent configures prefab parameters at runtime — it cannot author effect bundles. Custom AR masks, makeup looks, and 3D assets are created in [Banuba Studio](https://studio.banuba.com/). 3D avatars/models are not supported in Studio — direct to the [contact form](https://www.banuba.com/contact).

### Mobile permissions

Add the following permissions to every mobile project (Android, iOS, Flutter, React Native).

**Android** — add inside `<manifest>` in `AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
```

Flutter additionally requires (via `permission_handler`):

```xml
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
```

React Native: `@banuba/react-native` declares CAMERA and RECORD_AUDIO in its own merged manifest — add only `INTERNET`:

```xml
<uses-permission android:name="android.permission.INTERNET" />
```

**iOS** — add to `Info.plist`:

```xml
<key>NSCameraUsageDescription</key>
<string>Camera access required to render AR effects</string>
<key>NSMicrophoneUsageDescription</key>
<string>Micro access required to record video</string>
```

Flutter additionally requires:

```xml
<key>NSPhotoLibraryUsageDescription</key>
<string>Gallery access required to pick image for processing</string>
```

Missing `NSCameraUsageDescription` causes a crash on iOS 14+.

### Token security

Never check the client token into source control on any platform.

### Output format

Complete files or diffs, numbered steps, working code first then explanation.

---

## Web

### Prerequisites

1. Banuba client token (mandatory).
2. [Node.js](https://nodejs.org/) installed.
3. Browser with [WebGL 2.0](https://caniuse.com/#feat=webgl2) support.
4. A bundler (Vite, Rollup, Webpack) or plain `<script type="module">` via jsDelivr CDN for prototyping.

### Effects

Effects path: `public/effects/`. Download icons into `public/effects/icons/` and use local icon URLs in the UI.

See **Shared principles → Demo effects** for the full download and installation procedure.

Load only the union of required modules for the active effect on swap; do not preload all modules at once.

### Workflow

#### 1. Pick the integration path

**Path A, new project** (no `package.json`): clone the quickstart as the scaffold.

```bash
git clone https://github.com/Banuba/quickstart-web
cd quickstart-web && npm install
```

Replace the placeholder in `BanubaClientToken.js` with the real token, run `npm start`, verify the demo loads.

**Path B, existing project** (already has `package.json`, source files, bundler config): install the SDK into the user's project. Do not clone over it.

```bash
npm install @banuba/webar
```

Treat [quickstart-web](https://github.com/Banuba/quickstart-web) as a reference for patterns. Files worth mirroring:

- `BanubaPlayer.js`: the Player lifecycle (Player.create, Module.preload, applyEffect, Webcam, Dom.render). Adapt to the user's structure and drop unused modules.
- `range-requests.sw.js`: only include this if the project loads video textures via external HTTP URLs. Do **not** copy it for projects using standard zip-packed demo effects - combining it with `proxyVideoRequestsTo` breaks blob-URL video textures on Safari.
- Token-in-separate-file pattern (`BanubaClientToken.js` exporting the token).

To inspect a quickstart file without polluting the workspace, read raw GitHub URLs via web browsing or raw URL fetch (`https://raw.githubusercontent.com/Banuba/quickstart-web/master/<file>`) or clone into a temp directory outside the user's project. Never clone `Banuba/quickstart-web` into the user's project root.

#### 2. Fetch and search docs

| Topic | Doc |
|---|---|
| Installation, bundler setup | [installation/web](https://docs.banuba.com/far-sdk/tutorials/development/installation/web) |
| Basic integration | [basic_integration/web](https://docs.banuba.com/far-sdk/tutorials/development/basic_integration/web) |
| Web API overview | [api_overview/web](https://docs.banuba.com/far-sdk/tutorials/development/api_overview/web) |
| AR Cloud | [guides/ar_cloud](https://docs.banuba.com/far-sdk/tutorials/development/guides/ar_cloud) |
| Performance, SIMD | [guides/optimization](https://docs.banuba.com/far-sdk/tutorials/development/guides/optimization) |
| Effects and prefabs | [effects/overview](https://docs.banuba.com/far-sdk/effects/overview) |
| Virtual background | [effects/virtual_background](https://docs.banuba.com/far-sdk/effects/virtual_background) |
| Known issues | [known_issues/web](https://docs.banuba.com/far-sdk/tutorials/development/known_issues/web) |

#### 3. Configure the client token

Replace the placeholder in `BanubaClientToken.js`. Never check tokens into source control.

#### 4. Generate code

- Read `BanubaPlayer.js` in quickstart-web for the Player lifecycle and adapt it.
- Use the bundler section in [installation/web](https://docs.banuba.com/far-sdk/tutorials/development/installation/web): Vite uses `?url` imports, Rollup needs `@rollup/plugin-url`, Webpack needs `file-loader` for `.wasm`.
- Load only the modules the feature needs. `face_tracker` is required for any face feature; add `background`, `lips`, `hair`, `skin`, `eyes`, `hands`, `body` as needed.
- `reloadConfig` requires a base effect applied first via `player.applyEffect(new Effect(url))`.
- For runtime feature params (density sliders, background blur, face morphing, beautification), build a prefab config object, mutate the field on change, then call `player._effectManager.reloadConfig(JSON.stringify(config))`. Do not call deprecated `effect.evalJs("Skin.softening(n)")`.
- **Sound check**: if an effect's `config.json` has a `sounds` array, call `player.setVolume(1)` **before** `player.applyEffect(...)`.
- Wrap `Player.create` in try/catch with a non-AR fallback for unsupported browsers.
- Call `player.destroy()` on session end.

### Prefab config examples

Background blur:
```json
{ "scene": "blur_bg", "version": "2.0.0", "camera": {}, "background": { "blur": 0.5 } }
```

Background replacement:
```json
{ "scene": "virtual_bg", "version": "2.0.0", "camera": {}, "background": { "texture": "office.jpg", "content_mode": "scale_to_fill" } }
```

Beautification:
```json
{
  "scene": "beauty", "version": "2.0.0", "camera": {},
  "faces": [{ "makeup_base": { "mode": "quality", "smooth": "0.8 0.6" }, "teeth_whitening": { "strength": 0.7 }, "eyes_whitening": { "strength": 0.5 } }]
}
```

Hair coloring:
```json
{ "scene": "hair", "version": "2.0.0", "camera": {}, "faces": [{ "hair": { "color": ["0.19 0.06 0.25 1.0"] } }] }
```

Morphing:
```json
{ "scene": "morph", "version": "2.0.0", "camera": {}, "faces": [{ "morphing": { "eyes": { "enlargement": 0.4 }, "nose": { "width": -0.3 } } }] }
```

### Web pitfalls

- Missing `face_tracker` module: every face-related effect renders blank without it.
- Skipping `player.destroy()`: accumulates dangling Player instances and crashes after a few cycles.
- Wrong WASM path: pass `locateFile` to `Player.create()` when using Vite/Rollup/Webpack.
- Safari animation delay / `proxyVideoRequestsTo` trap: do **not** enable `proxyVideoRequestsTo` for projects using standard zip-packed effects - it breaks blob-URL video textures on Safari.
- `Image` constructor shadowing: rename on import (`import { Image as BanubaImage }`) if the app also creates HTML `<img>` elements.
- Multi-face: confirm token includes Max Faces support - no JS workaround exists without it.
- Background config must not include `lut` - it is a global color-grade unrelated to background features.

---

## Android

### Prerequisites

1. Banuba client token (mandatory).
2. Android Studio installed.
3. Android API level 26+ (Android 8.0 minimum). See `docs/tutorials/capabilities/system_requirements.md`.
4. `local.properties` must exist in the project root with the Android SDK path. Check with shell - create if missing:

```bash
test -f local.properties || echo "sdk.dir=$ANDROID_HOME" > local.properties
```

If `$ANDROID_HOME` is not set, ask the user for the path (e.g. `/Users/<name>/Library/Android/sdk`).

### Agent action checklist

Execute these steps in order. Each step specifies whether to run a shell command or edit files.

> **Never modify or generate `res/mipmap/ic_launcher*` files.** Touching launcher icons causes resource merge crashes. Leave them as-is.

#### 1. Pick the integration path

**Path A - new project** (shell):

```bash
git clone https://github.com/Banuba/banuba-sdk-android-samples
```

Open the `camera` sample in Android Studio. Replace the client token, then click Run.

**Path B - existing project**: do not clone over it. Continue with steps 2–6 below.

#### 2. Add Maven repository and SDK dependencies (file edit)

See `docs/tutorials/development/basic_integration/android.md` — Installation section for `settings.gradle.kts` and `build.gradle.kts` snippets.

Use `bnbVersion = "1.18.5"`. Only include modules needed for active effects — check the Required packages column from the demo effects table.

Then trigger Gradle sync (shell):

```bash
./gradlew dependencies --configuration releaseRuntimeClasspath
```

#### 4. Download effects (shell)

Effects path: `app/src/main/assets/effects/`. Each selected entry's Required packages column lists the modules to add to dependencies in step 3.

See **Shared principles → Demo effects** for the full download and installation procedure.

#### 5. Configure the client token (file creation or edit)

Write the token to `BanubaClientToken.kt`:

```
<#Place your token here#>
```

Then initialize in `Application.onCreate()` (file edit):

```kotlin
BanubaSdkManager.initialize(this, banubaClientToken)
```

#### 6. Core integration pattern (file creation or edit)

See `docs/tutorials/development/basic_integration/android.md` for the full `MainActivity.kt` implementation and dependency setup.

Loading / clearing effects:

```kotlin
player.loadAsync("effects/TrollGrandma")  // load
player.loadAsync("")                       // clear
```

### Android pitfalls

- Always call `close()` on `cameraDevice`, `surfaceOutput`, and `player` in `onDestroy()`.
- Wrong effect path: effects must be in `assets/` - wrong path causes silent no-load.
- Unused modules increase APK size - only add what your effects need.
- Multi-face: confirm Max Faces is in the token first.

---

## iOS

### Prerequisites

1. Banuba client token (mandatory).
2. Mac with Xcode installed.
3. iOS 15.0+ deployment target.
4. CocoaPods - install if missing:
```bash
sudo gem install cocoapods
```

### Agent action checklist

Execute these steps in order. Each step specifies whether to run a shell command or edit files.

#### 1. Pick the integration path

**Path A - new project** (shell):

```bash
git clone https://github.com/Banuba/banuba-sdk-ios-samples
```

Open the `camera` sample workspace in Xcode. Insert the token in `common/common/AppDelegate.swift`, then Run. Study this sample when something seems off - it is the canonical reference.

**Path B - existing project or from scratch**: do not clone over it. Continue with steps 2–6 below.

#### 2. Create the Podfile (file creation or edit → then shell)

Detect the Xcode target name from `*.xcodeproj` or ask the user. Then **write** `Podfile` to the project root:

```ruby
source 'https://github.com/sdk-banuba/banuba-sdk-podspecs.git'
source 'https://cdn.cocoapods.org/'

platform :ios, '15.0'
use_frameworks!

target 'YourTargetName' do
  pod 'BNBEffectPlayer', '1.18.5'
  pod 'BNBSdkApi',       '1.18.5'
  pod 'BNBSdkCore',      '1.18.5'
  pod 'BNBFaceTracker',  '1.18.5'
  pod 'BNBBackground',   '1.18.5'   # required for background effects
  pod 'BNBMakeup',       '1.18.5'   # required for makeup/beauty effects
end
```

> **Critical**: correct pod names are `BNBEffectPlayer`, `BNBSdkApi`, `BNBSdkCore`, `BNBFaceTracker`, `BNBBackground`, `BNBMakeup`. Names like `BanubaEffectPlayer` or `BanubaSdk` do not exist - `pod install` will fail.

Then run (shell):

```bash
pod install
```

Always open `.xcworkspace` (not `.xcodeproj`) afterward.

> **SPM alternative**: `https://github.com/Banuba/BNBSdkApi-iOS-spm` and `https://github.com/Banuba/BNBSdkCore-iOS-spm`. Do **not** mix SPM and CocoaPods for Banuba packages in the same target.

#### 3. Disable app-target user script sandboxing (file edit)

For CocoaPods projects, ensure the **app target** has `ENABLE_USER_SCRIPT_SANDBOXING = NO`. CocoaPods uses shell scripts and `rsync` in `[CP] Embed Pods Frameworks`; Xcode's user script sandbox can block Banuba framework resources such as `BNBBackground.framework/bnb-resources`.

For XcodeGen projects, add this setting to the app target:

```yaml
settings:
  base:
    ENABLE_USER_SCRIPT_SANDBOXING: NO
```

For existing `.xcodeproj` projects, set **Build Settings → Build Options → User Script Sandboxing → No** on the app target, or patch both Debug and Release build configurations in `project.pbxproj`.

#### 4. Create the client token file (file creation or edit)

Write `BanubaClientToken.swift` to the Swift sources folder:

```swift
let banubaClientToken = "<#Place your token here#>"
```

#### 5. Download effects (shell)

Effects path: `effects/` — sibling of `MyApp/`, NOT inside the Swift sources folder (causes "Multiple commands produce … config.json" build errors).

See **Shared principles → Demo effects** for the full download and installation procedure.

#### 6. Register effects folder in the Xcode project (shell)

The `effects/` folder must be added as a **folder reference** (blue folder, `lastKnownFileType = folder`) - not a group. Do this automatically via the `xcodeproj` Ruby gem:

```bash
gem install xcodeproj 2>/dev/null || true
```

Then write and run a Ruby script (file creation or edit → shell):

```ruby
# add_effects_ref.rb
require 'xcodeproj'

proj_path = Dir.glob('*.xcodeproj').first
abort 'No .xcodeproj found' unless proj_path

project = Xcodeproj::Project.open(proj_path)
target  = project.targets.first

# Remove any existing stale effects reference
project.main_group.files.select { |f| f.path == 'effects' }.each(&:remove_from_project)

# Add effects as a folder reference
ref = project.main_group.new_file('effects', :folder)
ref.last_known_file_type = 'folder'

# Add to Copy Bundle Resources of every app target
project.targets.select { |t| t.is_a?(Xcodeproj::Project::Object::PBXNativeTarget) }.each do |t|
  phase = t.resources_build_phase
  phase.add_file_reference(ref) unless phase.files.map(&:file_ref).include?(ref)
end

project.save
puts "Done - effects folder reference added to #{proj_path}"
```

```bash
ruby add_effects_ref.rb
```

After running, verify (shell):

```bash
grep -r "lastKnownFileType = folder" *.xcodeproj/project.pbxproj | grep effects
```

If the grep returns a line, the reference is correct.

> **xcodegen projects**: skip the Ruby script. Instead use `type: folder` + `buildPhase: resources` under `sources:`:
> ```yaml
> targets:
>   MyApp:
>     sources:
>       - path: MyApp
>         excludes: [effects/**]
>       - path: effects
>         type: folder
>         buildPhase: resources
> ```

#### 7. Initialize the SDK and implement the view controller (file creation or edit)

See `docs/tutorials/development/basic_integration/ios.md` for the full `AppDelegate.swift` and `ViewController.swift` implementation.

**Critical**: `EffectPlayerView` **must** be the root view in the storyboard, connected as an `@IBOutlet`. Do **not** instantiate it with `EffectPlayerView()` in code — that produces `frame = .zero` and effects are never rendered (camera shows, AR is invisible).

In `Main.storyboard`, set `customClass="EffectPlayerView"` and `customModule="BNBSdkApi"` on the root view. Do **not** add `customModuleProvider="target"` — that attribute is only for app-target classes.

Add `NSCameraUsageDescription` to `Info.plist` (see **Shared principles → Mobile permissions**).

Always generate the `effects` array from the actual folder names present in `effects/` (via `ls`). Include `("", "None")` as the first entry so the user can clear the active effect.

#### 9. Verify the build (shell)

After building in Xcode, check the effects folder is present in the app bundle:

```bash
find ~/Library/Developer/Xcode/DerivedData -name "effects" -type d 2>/dev/null | grep -v Intermediates | head -5
```

If nothing is found, the folder reference was not registered correctly - re-run step 5.

### iOS pitfalls

| Pitfall | Symptom | Fix |
|---|---|---|
| Wrong pod names (`BanubaEffectPlayer`, `BanubaSdk`) | `pod not found` on `pod install` | Use `BNBEffectPlayer`, `BNBSdkApi`, `BNBSdkCore`, `BNBFaceTracker`, `BNBBackground`, `BNBMakeup` |
| Banuba pod source missing or after CDN source | pod not found | Add `source 'https://github.com/sdk-banuba/banuba-sdk-podspecs.git'` as the **first** source line |
| `EffectPlayerView` created programmatically | Camera shows, effects invisible | Always use storyboard IBOutlet; the root view must be `EffectPlayerView` |
| `effects/` folder inside the Swift sources folder | "Multiple commands produce … config.json" build error | Move `effects/` to a sibling folder; never nest it inside the folder Xcode scans for Swift files |
| Wrong xcodegen syntax for folder reference | Effects folder absent from bundle, all effects silently fail | Use `type: folder` + `buildPhase: resources` under `sources:`, not `resources:` with `type: folder-reference` |
| Effects folder not in bundle | SDK initializes, camera shows, `player.load(effect:)` returns `nil` silently | Verify `<App>.app/effects/` exists in DerivedData after build; if absent, fix the Copy Bundle Resources phase |
| Opening `.xcodeproj` instead of `.xcworkspace` after `pod install` | Linker errors, missing Banuba frameworks | Always open `.xcworkspace` |
| App target user script sandboxing enabled | `Sandbox: rsync deny file-read-data` / `file-write-create` in `[CP] Embed Pods Frameworks`, often on `BNBBackground.framework/bnb-resources` | Set `ENABLE_USER_SCRIPT_SANDBOXING = NO` on the app target, then clean and rebuild |
| Mixing SPM and CocoaPods for Banuba pods | Duplicate symbol errors | Pick one package manager for all Banuba pods |
| Resource paths missing from `BanubaSdkManager.initialize` | Effects silently fail to load | Include both `Bundle.main.bundlePath + "/effects"` and `Bundle.main.bundlePath` |
| Multi-face without token support | Only one face tracked, no error | Confirm token includes Max Faces before implementing multi-face UI |
| Wrong `targetRuntime` in storyboard | "The document could not be opened. (com.apple.InterfaceBuilder error -1.)" | Use `targetRuntime="iOS.CocoaTouch"` - never `"AppleCocoa"` (that is macOS). Copy the exact header from Xcode's own template at `Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/Library/Xcode/Templates/Project Templates/iOS/Application/Cocoa Touch App Base.xctemplate/LaunchScreen.storyboard` |
| `customModuleProvider="target"` on `EffectPlayerView` in storyboard | Black screen, camera not visible, AR never renders | Remove `customModuleProvider="target"` from the `<view>` element - this attribute is only for app-target classes. Pod classes only need `customClass="EffectPlayerView" customModule="BNBSdkApi"` |

---

## Desktop (C++)

### Prerequisites

1. Banuba client token (mandatory - ask the user for it before starting).
2. CMake 3.15+.
3. Windows: Visual Studio 2019+ with C++ tools. macOS: Xcode command line tools.

### Workflow

**Path A - new project (recommended)**: clone the quickstart — it is the fastest path to a running C++ app and is the recommended scaffold (a minimal working app, not a large template). Proceed with steps 1–7 below, including step 3a.

**Path B - new project from scratch**: if the user explicitly wants an empty project without the quickstart scaffold, you may set one up using the quickstart as a structural reference (CMakeLists.txt layout, SDK include/link pattern, main loop structure). Use web browsing or raw URL fetch to read `https://raw.githubusercontent.com/Banuba/quickstart-desktop-cpp/master/CMakeLists.txt` and `main.cpp` before generating. Still execute steps 3, 3a, and 4 (SDK download, demo effects, and token) as written.

For all other cases ("integrate into existing C++ project", user already has a project): skip the clone step and start from step 3.

#### 1. Ask three questions upfront

Before doing anything, ask:
- Banuba client token?
- Where to clone the project? (default: current directory)
- Target OS - macOS or Windows?

The target OS is what the app will run on, not necessarily the machine you're working on right now. All steps below run only the branch for that OS.

> "Don't download the Windows SDK" means Microsoft's Visual C++ toolchain - not the Banuba SDK. Always download the Banuba Face AR SDK binaries (step 3) regardless.

#### 2. Clone the quickstart (shell)

```bash
git clone --recursive https://github.com/Banuba/quickstart-desktop-cpp "<project_dir>"
```

If the folder already exists and isn't empty, clone into `<project_dir>/quickstart-desktop-cpp` instead.

#### 3. Download Banuba Face AR SDK binaries (shell)

**Execute this step immediately after cloning - do not describe it, do not ask the user to do it manually.** The project will not build without these binaries.

GitHub's API is unreliable for this repo (rate limits, auth). Parse the releases page directly instead:

```bash
curl -s https://github.com/Banuba/FaceAR-SDK-desktop-releases/releases/latest \
  | grep -o 'href="[^"]*bnb_sdk[^"]*"' | sed 's/href="//;s/"//'
```

Pick the URL matching the target OS, prepend `https://github.com` if it's relative, then download:

**macOS:**
```bash
mkdir -p "<project_dir>/bnb_sdk"
curl -L "https://github.com<url>" -o /tmp/bnb_sdk_mac.tar.gz
tar -xzf /tmp/bnb_sdk_mac.tar.gz -C "<project_dir>/bnb_sdk" --strip-components=1
rm /tmp/bnb_sdk_mac.tar.gz
```

**Windows:**
```bash
mkdir -p "<project_dir>/bnb_sdk"
curl -L "https://github.com<url>" -o /tmp/bnb_sdk_win.zip
unzip -q /tmp/bnb_sdk_win.zip -d /tmp/bnb_sdk_win
cp -r /tmp/bnb_sdk_win/bin/. "<project_dir>/bnb_sdk/bin/"
cp -r /tmp/bnb_sdk_win/include/. "<project_dir>/bnb_sdk/include/"
cp -r /tmp/bnb_sdk_win/resources/. "<project_dir>/resources/"
rm -rf /tmp/bnb_sdk_win /tmp/bnb_sdk_win.zip
```

Check it worked:
```bash
ls "<project_dir>/bnb_sdk"
# macOS: should have include/ and lib/
# Windows: should have bin/ and include/
```

If the page scrape returns nothing, ask the user to open https://github.com/Banuba/FaceAR-SDK-desktop-releases/releases and paste the direct download URL - then run the curl yourself.

#### 3. Download demo effects (shell)

Effects path: `<project_dir>/resources/effects/`. Runtime paths use `effects/<EffectName>`.

See **Shared principles → Demo effects** for the full download and installation procedure.

#### 4. Insert the client token (file edit)

Edit `<project_dir>/helpers/src/BanubaClientToken.hpp` - replace the placeholder with the token the user provided in step 1:

```cpp
#define BNB_CLIENT_TOKEN "<user_token>"
```

Never check this file into source control. Add it to `.gitignore` (file edit):
```
helpers/src/BanubaClientToken.hpp
```

#### 5. Generate the Xcode / VS project (shell)

**macOS**:
```bash
cd "<project_dir>"
mkdir -p build && cd build
cmake -G Xcode ..
```

**Windows** (x64):
```bash
cd "<project_dir>"
mkdir build && cd build
cmake -A x64 ..
```

Verify (shell):
```bash
# macOS
ls "<project_dir>/build" | grep xcodeproj
# Windows
ls "<project_dir>/build" | grep sln
```

#### 6. Copy SDK DLLs next to the executable - Windows only (shell)

On Windows, the app crashes at launch if the SDK DLLs are not next to the `.exe`. Copy them now - before the user tries to run:

```bash
# Debug build
cp "<project_dir>/bnb_sdk/bin/"*.dll "<project_dir>/build/bin/Debug/"
# Release build
cp "<project_dir>/bnb_sdk/bin/"*.dll "<project_dir>/build/bin/Release/"
```

Verify that `avcodec-61.dll` (and other Banuba DLLs) are present:
```bash
ls "<project_dir>/build/bin/Debug/" | grep dll
```

If the `bin/Debug/` path doesn't exist yet (project not built), copy to both possible output dirs preemptively - VS may use `x64/Debug/` or `out/build/x64-Debug/` depending on the generator:
```bash
find "<project_dir>/build" -name "*.exe" -exec dirname {} \; 2>/dev/null | sort -u
```
Then copy to each found directory.

#### 7. Open the project for the user (shell)

**macOS** - open the generated Xcode project:
```bash
open "<project_dir>/build/quickstart-desktop-cpp.xcodeproj"
```

**Windows** - open the solution:
```bash
start "<project_dir>/build/quickstart-desktop-cpp.sln"
```

Then tell the user:
> "Project is ready. On Windows, open the solution in Visual Studio, select the `realtime-camera-preview` project, set it as startup project, and run. SDK DLLs are already copied next to the executable. Your token is already inserted."

#### 8. Core integration pattern (reference only - quickstart already contains this)

See `docs/tutorials/development/basic_integration/desktop.md` — section "5. Initialize Banuba SDK..." for the full `main.cpp` implementation.

Loading / clearing effects:

```cpp
player->load_async("effects/TrollGrandma");  // load
player->load_async("");                       // clear
```

### Desktop pitfalls

- `bnb::utility` must be the first SDK call - it validates the token and loads resources.
- Windows: app crashes at launch with `avcodec-61.dll not found` if DLLs from `bnb_sdk/bin/` are not copied next to the `.exe` - do this before the user runs (step 6).
- macOS: use Metal; Windows: use OpenGL.
- Always clone with `--recursive` - helpers are submodules. If cmake fails with git-related errors on Windows, run `git submodule update --init --recursive` inside the project dir.
- If SDK download fails: ask the user to open https://github.com/Banuba/FaceAR-SDK-desktop-releases/releases and paste the direct download URL.
- Multi-face: confirm Max Faces is in the token first.

---

## Flutter

### Prerequisites

1. Banuba client token (mandatory).
2. Flutter SDK installed.
3. Android: API level 26+. iOS: 14.0+.

### Workflow

#### 1. Pick the integration path

**Path A - new project** (shell):
```bash
git clone https://github.com/Banuba/banuba-sdk-flutter
```
Open `example/` in your IDE. Insert the token in `example/lib/main.dart`, run `flutter pub get && flutter run`.

**Path B - new project from scratch** (shell):
```bash
flutter create <appname>
cd <appname>
```
Then continue with steps 2–8 below.

**Path C - existing project**: continue with steps 2–8 below.

#### 2. Add SDK packages (shell)

```bash
flutter pub add banuba_sdk
flutter pub add permission_handler
```

#### 3. Configure Android (file edit)

See `docs/tutorials/development/basic_integration/flutter.md` — section "2. Android" for `android/build.gradle` and `android/app/build.gradle` snippets including the `copyEffects` task.

> Note: `flutter.source` resolves correctly only after the `flutter { source '../..' }` block is present in `android/app/build.gradle`. The Flutter Gradle plugin adds it automatically when you run `flutter pub add banuba_sdk`.

#### 4. Configure iOS (file edit → shell)

Replace the contents of `ios/Podfile` with (file edit):

```ruby
ENV['COCOAPODS_DISABLE_STATS'] = 'true'

source 'https://github.com/sdk-banuba/banuba-sdk-podspecs.git'
source 'https://github.com/CocoaPods/Specs.git'
$bnb_sdk_version = '~> 1.18.0'

platform :ios, '14.0'

inhibit_all_warnings!

target 'Runner' do
  use_frameworks!
  use_modular_headers!

  pod 'BNBFaceTracker', $bnb_sdk_version
  pod 'BNBBackground',  $bnb_sdk_version

  flutter_install_all_ios_pods File.dirname(File.realpath(__FILE__))
end

post_install do |installer|
  installer.pods_project.targets.each do |target|
    flutter_additional_ios_build_settings(target)
    target.build_configurations.each do |config|
      config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] ||= [
        '$(inherited)',
        'PERMISSION_CAMERA=1',
        'PERMISSION_MICROPHONE=1',
      ]
    end
  end
end
```

> `GCC_PREPROCESSOR_DEFINITIONS` with `PERMISSION_CAMERA=1` and `PERMISSION_MICROPHONE=1` is required for `permission_handler` to work on iOS - without it the plugin compiles but permission requests silently fail.

Then run (shell):
```bash
cd ios && pod install && cd ..
```

#### 5. Add permissions (file edit)

See **Shared principles → Mobile permissions**. For Flutter, include the extra `WRITE_EXTERNAL_STORAGE`, `READ_EXTERNAL_STORAGE` (Android) and `NSPhotoLibraryUsageDescription` (iOS) entries noted there.

#### 6. Download effects (shell)

Effects path: `effects/` at the Flutter project root (sibling of `lib/`). The Gradle `copyEffects` task copies it into Android assets automatically. For iOS, add via Xcode (`File → Add Files to 'Runner'...`) as a folder reference.

See **Shared principles → Demo effects** for the full download and installation procedure.

#### 7. Write lib/main.dart (file creation or edit)

See `docs/tutorials/development/basic_integration/flutter.md` — section "4. lib/main.dart" for the full implementation.

#### 8. Verify build and run (shell)

First verify the project compiles without errors:

```bash
flutter pub get
flutter build apk   # Android — catches compile errors before device needed
```

Then run on device:
```bash
flutter run
```

If `flutter run` fails on iOS with pod issues, run:
```bash
cd ios && pod install && cd .. && flutter run
```

### Flutter pitfalls

- `permission_handler` must be added explicitly - `banuba_sdk` does not pull it in.
- `minSdkVersion` must be 26+ - lower values cause build failure.
- `bnb_sdk_version` must be declared in `android/build.gradle` ext block - without it `$project.bnb_sdk_version` is undefined.
- Effects folder must be at the Flutter project root - Gradle copies from `flutter.source + '/effects'`.
- On iOS, Banuba pod source must come **before** CocoaPods CDN source in `Podfile`.
- On iOS, add `effects/` as a **folder reference** in Xcode (blue folder icon) - not as a group.
- Missing `NSCameraUsageDescription` in Info.plist causes a crash on iOS 14+.
- If the SDK has more capabilities than the Flutter package exposes, go with native Android/iOS integration.

---

## React Native

### Prerequisites

1. Banuba client token (mandatory).
2. React Native 0.73+ environment (Node, Watchman, Android Studio / Xcode).
3. Android: API level 26+. iOS: 15.0+.

### Workflow

#### 1. Pick the integration path

**Path A - clone sample** (shell):
```bash
git clone https://github.com/Banuba/banuba-sdk-react-native
```
Open `example/` in your IDE. Insert the token in `example/src/App.tsx`, run `yarn install && yarn android` or `yarn ios`.

**Path B - new project from scratch** (shell):
```bash
npx react-native init <AppName>
cd <AppName>
```
Then continue with steps 2–9 below.

**Path C - existing project**: continue with steps 2–9 below.

#### 2. Add the SDK package (shell)

```bash
yarn add @banuba/react-native
```

> Do not pin a version number — `@banuba/react-native` versioning is independent from the Video Editor SDK (`0.52.0` is VE, not FAR). Let yarn resolve the latest.

#### 3. Configure Android root build.gradle (file edit)

See `docs/tutorials/development/basic_integration/react_native.md` — sections "2. Android - android/build.gradle" and "3. Android - android/app/build.gradle" for Maven repo setup, dependencies, and the `copyEffects` Gradle task.

#### 4. Configure Android app build.gradle (file edit)

Covered in the doc reference above (section "3").

#### 5. Configure iOS (file edit → shell)

Add the Banuba source and pod declarations to `ios/Podfile`. The sources go before the `target` block; the pods go inside it alongside `use_react_native!`:

```ruby
source 'https://github.com/sdk-banuba/banuba-sdk-podspecs.git'
source 'https://github.com/CocoaPods/Specs.git'
$bnb_sdk_version = '~> 1.18.0'

target 'YourApp' do
  config = use_native_modules!

  pod 'BNBFaceTracker', $bnb_sdk_version
  pod 'BNBBackground',  $bnb_sdk_version

  use_react_native!(
    :path => config[:reactNativePath],
    :app_path => "#{Pod::Config.instance.installation_root}/.."
  )
end
```

Then run (shell):
```bash
cd ios && pod install && cd ..
```

#### 6. Add permissions (file edit)

See **Shared principles → Mobile permissions** for the exact XML blocks. For React Native, note the Android-specific rule: add only `INTERNET`; CAMERA and RECORD_AUDIO are declared by the package.

#### 7. Download effects (shell)

Effects path: `effects/` at the project root (sibling of `src/`). Gradle copies from `../../effects` into Android assets automatically. For iOS, add `effects/` via Xcode (`File → Add Files to '<Your project>'...`) as a **folder reference**.

See **Shared principles → Demo effects** for the full download and installation procedure.

#### 8. Write src/App.tsx (file creation or edit)

See `docs/tutorials/development/basic_integration/react_native.md` — section "5. src/App.tsx" for the full implementation. Replace `'<#Place your token here#>'` with the actual client token.

#### 9. Run (shell)

```bash
yarn android   # or yarn ios
```

### React Native pitfalls

- `minSdkVersion` must be 26+ - lower values cause build failure.
- Missing `NSCameraUsageDescription` in Info.plist causes a crash on iOS 14+.
- Banuba pod source must be in `Podfile` - without it `pod install` fails.
- Put Banuba podspec source before CocoaPods specs source in generated snippets, even if a bundled upstream page shows the lines in the opposite order.
- `use_frameworks!` is not required by the Banuba React Native guide. If it already exists in a project, do not remove it automatically because other pods may need it.
- `@banuba/react-native` version is independent from native FAR SDK version - do not install `@banuba/react-native@1.18.x` unless npm actually publishes it.
- On iOS, effects must be added as a **folder reference** in Xcode (blue folder icon), not as a group.
- Effects folder must be at the project root - Gradle copies from `../../effects` relative to `android/app/`.
- If more SDK capabilities are needed than the package exposes, go with native Android/iOS integration.

---

## Further reading

- Full docs: [docs.banuba.com/far-sdk](https://docs.banuba.com/far-sdk)
- LLM-optimized docs: [llms-full.txt](https://docs.banuba.com/far-sdk/llms-full.txt)
- Samples: [quickstart-web](https://github.com/Banuba/quickstart-web) · [android](https://github.com/Banuba/banuba-sdk-android-samples) · [ios](https://github.com/Banuba/banuba-sdk-ios-samples) · [desktop](https://github.com/Banuba/quickstart-desktop-cpp) · [flutter](https://github.com/Banuba/banuba-sdk-flutter) · [react-native](https://github.com/Banuba/banuba-sdk-react-native)
