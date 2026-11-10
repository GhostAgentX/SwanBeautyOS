# Prefabs Overview

Prefab is high level object that represents set of render and SDK features.

Prefabs divided on several types:

* [On Face](/effects/prefabs/face.md) - prefabs that depends on face.
* [Makeup](/effects/prefabs/makeup.md) - represents makeup features. Also depends on face.
* [Top Level](/effects/prefabs/top_level.md) - affects the whole screen and do not attached to any face.
* [On Hands](/effects/prefabs/hands.md) - effects applied on hands.
* [Sprites](/effects/prefabs/sprites.md#sprites) - represents simple 2d sprites
* [Sounds](/effects/prefabs/sounds.md) - represents audio

Scheme of using prefabs:

```
{
    "scene": "effect name",
    "version": "2.0.0",

    "camera": {},
    // Top level prefabs
    "background": {
        // ...
    },
    "foreground": {
        // ...
    },
    "lut": {
        // ...
    },
    "lights": {
        // ...
    },
    "msaa": {
        // ...
    },
    // On Face
    "faces": [
        {
            // first face
            "face_prefab1": {
                //...
            },
            "makeup_prefab1": {
                //...
            }
            // ...
        },
        {
            // second face
        }
        // ..
    ],
    // Sounds
    "sounds": [
        {
            "sound_prefab1": {
                //...
            },
            "sound_prefab2": {
                //...
            }
            // ...
        }
    ],
    // Sprites
    "sprites": [
        {
            "sprite_prefab1": {
                //...
            },
            "sprite_prefab2": {
                //...
            }
            // ...
        }
        // ...
    ]
}
```

Where

* `scene` - this is the name of your effect.
* `version` - version of this configuration file. Always set it to `"2.0.0"`. Previous version is designed for complex legacy effects.
* `camera` - tells that you will render camera feed on the screen.
* `faces` - array of JSON objects describing features you wish to place on each face. So, for each face we will define a JSON object where keys are the names of prefabs and values are the parameters for each prefab.
* `top_level_prefab` - one of the top level prefabs
* `sprites` - array of JSON objects describing sprites features.
* `sounds` - array of JSON objects describing sounds features

tip

You can create effect with any set of prefabs.

tip

You could change effect in runtime calling `reload_config()`/`reloadConfig()` method:

* C++
* Java
* Swift
* JavaScript

```
constexpr auto new_config = R"(
    {
        "camera" : {},
            "background" : {
            // ...
        }
    }
)";
effect_player->effect_manager()->reload_config(new_config);
```

```
import com.banuba.sdk.player.Player

    // ...

    val newConfig =
        "" "
{
    "camera" : {},
               "background" : {
        // ...
    }
}
"" ";
    player.effectPlayer.effectManager()
        .reloadConfig(newConfig)
```

```
import BanubaEffectPlayer

// ...
let newConfig = """
{
  "camera": {},
  "background": {
      // ...
  }
}
""";
player.effectPlayer?.effectManager().reloadConfig(newConfig)
```

```
const new_config = 
`{
    "camera": {},
    "background": {
      // ...
    }
}`
player._effectManager.reloadConfig(new_config)
```

note

Colors are represented as 3- or 4-component string, each component is a value in range *\[0, 1]* or *\[0, 255]* separated by a space. E.g.: `"1 0 0 1"` - red color, etc. HTML-like hex strings are also accepted. E.g.: `"#00FF00"` - green color, alpha `FF` is assumed if missing.
