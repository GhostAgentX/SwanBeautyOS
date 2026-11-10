# Top Level Prefabs

### Background[​](#background "Direct link to Background")

**Usage** You can choose to use texture:

```
{
    "background": {
        "texture": "capy.jpeg",
        "rotation": 0,
        "scale": 1,
        "content_mode": "scale_to_fill",
        "blend_mode": "default",
        "clear_color": "1 0 0 1",
        "use_filter": true
    }
}
```

Or blur of the real background:

```
{
    "background": {
        "blur": 0.5
    }
}
```

Or transparency:

```
{
    "background": {
        "transparency": 0.5
    }
}
```

Enable virtual background.

| Parameter             | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |                           Optional                           |   Default Value   |
| :-------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------: | :---------------: |
| `transparency`        | Sets the background transparency from 0 to 1.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |       `0.0`       |
| `texture`             | Sets the file (image or video) as the background texture. For better perfomance, formats must be used: `.jpeg`, `.jpg`, `.png`, `.mp4 (H.264 and aac only)`. Formats such as `.heic`, `.webp`, `.webm` can be used also, but performance may vary depending on the device used. More info can be find here [image formats](https://docs.banuba.com/far-sdk/tutorials/capabilities/technical_specification#image-formats-support) and [video formats](https://docs.banuba.com/far-sdk/tutorials/capabilities/technical_specification#video-formats-support) | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |       `null`      |
| `rotation`            | Rotates the background texture clockwise in degrees.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |       `0.0`       |
| `scale`               | Scales the background texture.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |       `1.0`       |
| `content_mode`        | Fits the background texture inside frame. Possible values are: `scale_to_fill`, `fill`, `fit`.                                                                                                                                                                                                                                                                                                                                                                                                                                                             | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") | `"scale_to_fill"` |
| `blend_mode`          | Sets the texture content mode. Possible values are: `default`, `screen`, `split_alpha`, `multiply`. `default` -- traditional alpha blending; `split_alpha` -- alpha channel is on the right side of input texture.                                                                                                                                                                                                                                                                                                                                         | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |    `"default"`    |
| `blur`                | Sets the background blur radius. Radius in \[0, 1] range.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |       `0.0`       |
| `clear_color`         | Specifies the color of the area not covered by background texture (e.g. `content_mode` `fit`). Black by default. Transparency (the last) is a conventional value only and currently ignored (use `1` for it).                                                                                                                                                                                                                                                                                                                                              | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |    `"0 0 0 0"`    |
| `camera_video_scale`  | \[Experimental] Set scale factor for the camera image relative to the center of the image.                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |      `"1 1"`      |
| `camera_video_origin` | \[Experimental] Set offset for the camera image relative to the center of the image.                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |      `"0 0"`      |
| `use_filter`          | Enables/disables filter for smoothing segmentation mask contours.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |       `true`      |

**Preview**

![Right image compare](/assets/images/original_wide-2f360425a0e0a779832de176b75c4354.jpg)![Left image compare](/assets/images/background-470533cb99448493c845be22788ccd68.jpg)

Drag

### foreground[​](#foreground "Direct link to foreground")

**Usage** Apply a texture or a video to the whole screen.

```
{
    "foreground": {
        "filename": "path/to/texture/file",
        "@blend": "multiply",
        "rotation": 0,
        "content_mode": "scale_to_fill"
    }
}
```

| Parameter      | Description                                                                                                                                                                                                                                                                                                                                                                                                                                           |                           Optional                           |   Default Value   |
| :------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------: | :---------------: |
| `filename`     | Path to a texture or a video file. Texture must have reasonable alpha channel or, as in the case of video, it will hide the underlying drawings. Information about supported formats can be find here [image formats](https://docs.banuba.com/far-sdk/tutorials/capabilities/technical_specification#image-formats-support) and [video formats](https://docs.banuba.com/far-sdk/tutorials/capabilities/technical_specification#video-formats-support) |                              *+*                             |        *+*        |
| `@blend`       | Apply the corresponding blending mode. Note the leading `@` in the parameter, it is mandatory. Possible values are: `off`, `alpha`, `premul_alpha`, `alpha_rgba`, `screen`, `add`, `multiply`, `min`, `max`.                                                                                                                                                                                                                                          | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |     `"alpha"`     |
| `rotation`     | Rotates the foreground clockwise in degrees.                                                                                                                                                                                                                                                                                                                                                                                                          | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |       `0.0`       |
| `content_mode` | Fits the foreground texture inside frame. Possible values are: `scale_to_fill`, `fill`, `fit`.                                                                                                                                                                                                                                                                                                                                                        | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") | `"scale_to_fill"` |

### lut[​](#lut "Direct link to lut")

**Usage** Apply a color filter (aka LUT).

```
{
    "lut": {
        "filename": "path/to/lut/file",
        "strength": 0.9
    }
}
```

| Parameter  | Description                         |                           Optional                           | Default Value |
| :--------- | :---------------------------------- | :----------------------------------------------------------: | :-----------: |
| `filename` | Path to the LUT file (usually PNG). |                              *+*                             |      *+*      |
| `strength` | LUT strength. Value in \[0, 1].     | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |     `1.0`     |

**Preview**

![Right image compare](/assets/images/original_wide-2f360425a0e0a779832de176b75c4354.jpg)![Left image compare](/assets/images/lut-d90746e32baa84b6f5b8027228b9f563.jpg)

Drag

### lights[​](#lights "Direct link to lights")

**Usage** Add up to 4 directional light sources to GLTF models in addition to IBL textures. **NOTE** that GLTF model is mandatory.

```
{
    "lights": {
        "radiance": [
            "10 0 0 0",
            "0 0 10 0"
        ],
        "direction": [
            "-1 0 0",
            "1 0 0"
        ]
    }
}
```

| Parameter   | Description                                                                                                                                 | Optional | Default Value |
| :---------- | :------------------------------------------------------------------------------------------------------------------------------------------ | :------: | :-----------: |
| `radiance`  | Array (or a single value for 1 light) of light sources radiances in *R*, *G*, *B* components and light wrap around factor in 4th component. |    *+*   |      *+*      |
| `direction` | Array (or a single value for 1 light) of light sources directions in *X*, *Y*, *Z*.                                                         |    *+*   |      *+*      |

### msaa[​](#msaa "Direct link to msaa")

**Usage** Apply multisample anti-aliasing to effect. MSAA makes the picture look cleaner by smoothing out jagged edges. **NOTE** that GLTF model is mandatory.

```
{
    "msaa": {
        "@samples_count": 4
    }
}
```

| Parameter        | Description                                                                    | Optional | Default Value |
| :--------------- | :----------------------------------------------------------------------------- | :------: | :-----------: |
| `@samples_count` | MSAA strength. Value must be 1, 2 or 4. If strength is 1 - msaa is turned off. |    *+*   |      *+*      |

### Bokeh[​](#bokeh "Direct link to Bokeh")

**Usage** Enable bokeh effect for background.

```
{
    "bokeh": {
        "samples": 16
    }
}
```

| Parameter | Description                                                          |                           Optional                           | Default Value |
| :-------- | :------------------------------------------------------------------- | :----------------------------------------------------------: | :-----------: |
| `samples` | Samples amount in the range \[8, 24]. Higher value - stronger bokeh. | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |      `16`     |

**Preview**

![Right image compare](/assets/images/bokeh1-d7e98efa92c812542789f664a113638d.jpg)![Left image compare](/assets/images/bokeh2-7a57a4a3469764e1337ab4dc0f704eba.jpg)

Drag
