# Sprites Prefabs

## sprites[​](#sprites "Direct link to sprites")

This array contains sprite-based prefabs like the hint

### Hint[​](#hint "Direct link to Hint")

Text message on the screen.

**Usage**

```
"sprites": [
    {
        "hint": {
            "text": "Simple Text!",
            "font": "path/to/font/file",
            "color": "1 0 0 1",
            "size": "30 10",
            "translation": "0 0",
            "rotation": "0 0 0"
        }
        // ...
    }
    // ...
]
```

| Parameter     | Description                                                                                                 |                           Optional                           |  Default Value |
| :------------ | :---------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------: | :------------: |
| `text`        | Message will be displayed.                                                                                  |                              *+*                             |       *+*      |
| `font`        | Path to the font file. Supported formats: `.otf`, `.otc`, `.ttf`, `.ttc`                                    | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") | `default font` |
| `color`       | Color of the text. Multiple hints support only one color and it must be set manually for each hint.         | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |    `1 1 1 1`   |
| `size`        | Size (in percents of screen size) of the text area \[X, Y].                                                 | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |    `100 100`   |
| `translation` | Translate the center of hint relativly the center of screen along *X*, *Y* axes in percents of screen size. | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |      `0 0`     |
| `rotation`    | Rotation angles (in degrees) **only** over *Z* axes.                                                        | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |     `0 0 0`    |

**Preview**

![Right image compare](/assets/images/original_wide-2f360425a0e0a779832de176b75c4354.jpg)![Left image compare](/assets/images/hint-e7610a1cad3f0facb2590c99cda3058f.jpg)

Drag
