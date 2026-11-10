# React Native

[Banuba SDK](https://www.npmjs.com/package/@banuba/react-native) for [React Native](https://reactnative.dev/) is available for iOS and Android and provides the following functionality:

* Load and interact with any Effect (including `Makeup` effect).
* Interaction with camera (open/close).
* Screen recording (screenshots and video).
* Video calls via Agora — requires a **separate fork** [banuba-react-native-agora](https://github.com/Banuba/banuba-react-native-agora), not part of `@banuba/react-native`.

If this is not enough, you should go with native integration.

## Integration guide

### 1. Add the SDK package

```bash
yarn add @banuba/react-native
```

### 2. Android - `android/build.gradle`

```groovy
buildscript {
    ext {
        minSdkVersion = 26
        compileSdkVersion = 35
        targetSdkVersion = 35
        bnb_sdk_version = '1.18.+'
    }
    repositories {
        google()
        mavenCentral()
        maven { url "https://nexus.banuba.net/repository/maven-releases" }
    }
}
```

### 3. Android - `android/app/build.gradle`

```groovy
dependencies {
    implementation "com.banuba.sdk:face_tracker:$project.bnb_sdk_version"
    implementation "com.banuba.sdk:background:$project.bnb_sdk_version"
}

task copyEffects {
    copy {
        from '../../effects'
        into 'src/main/assets/bnb-resources/effects'
    }
}

gradle.projectsEvaluated {
    preBuild.dependsOn(copyEffects)
}
```

### 4. iOS - `ios/Podfile`

Add the Banuba source (order matters - Banuba before CocoaPods CDN):

```ruby
source 'https://github.com/CocoaPods/Specs.git'
source 'https://github.com/sdk-banuba/banuba-sdk-podspecs.git'
$bnb_sdk_version = '~> 1.18.0'

target 'YourApp' do
  pod 'BNBFaceTracker', $bnb_sdk_version
  pod 'BNBBackground',  $bnb_sdk_version
end
```

Then run:
```bash
cd ios && pod install && cd ..
```

For effects on iOS: add the `effects/` folder to the Xcode `Runner` project (`File → Add Files to 'Runner'...`) as a folder reference.

### 5. `src/App.tsx`

```tsx
import React, {useEffect, useRef, useState} from 'react';
import {Button, View} from 'react-native';
import BanubaSdkManager, {EffectPlayerView} from '@banuba/react-native';

const BANUBA_TOKEN = '<#Place your token here#>';
const EFFECT_PATH = 'effects/TrollGrandma';

export default function App() {
  const initializedRef = useRef(false);

  // Initialize SDK once
  useEffect(() => {
    if (!initializedRef.current) {
      BanubaSdkManager.initialize([], BANUBA_TOKEN);
      initializedRef.current = true;
    }
  }, []);

  // Attach view and start player after mount
  useEffect(() => {
    BanubaSdkManager.attachView();
    BanubaSdkManager.openCamera();
    BanubaSdkManager.startPlayer();
    BanubaSdkManager.loadEffect(EFFECT_PATH);

    return () => {
      BanubaSdkManager.stopPlayer();
    };
  }, []);

  return (
    <View style={{flex: 1}}>
      <EffectPlayerView style={{flex: 1}} />
    </View>
  );
}
```

### 6. Effects folder

Place `effects/` at the project root (sibling of `src/`). The Gradle `copyEffects` task copies it into Android assets automatically. For iOS, add via Xcode as described in step 4.
