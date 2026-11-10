# Sounds Prefabs

## Sounds[​](#sounds "Direct link to Sounds")

This array contains audio effects bound to the effect. You can enable several audio tracks at once.

### Audio[​](#audio "Direct link to Audio")

Simple audio effect on background, looped by default.

**Usage**

```
"sounds": [
    {
        "audio": {
            "filename": "sound.ogg",
            "loop": true,
            "volume": 0.7
        }
        // ...
    }
    // ...
]
```

| Parameter  | Description                                                            |                           Optional                           | Default Value |
| :--------- | :--------------------------------------------------------------------- | :----------------------------------------------------------: | :-----------: |
| `filename` | Path to audio track. Tracks in `.ogg` and `.wav` format are supported. |                              *+*                             |      *+*      |
| `loop`     | Loop the audio track.                                                  | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |    `false`    |
| `volume`   | This audio track volume. Value from `[0, 1]`.                          | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |      `1`      |

note

To use prefab with sound effect on Web it's **mandatory** to set `player.setVolume(1);` in the code.
