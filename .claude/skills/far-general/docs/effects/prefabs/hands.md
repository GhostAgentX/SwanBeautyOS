# On Hands prefabs

### Nails[​](#nails "Direct link to Nails")

**Usage** You can choose a solid color and a gloss to recolor nails. Additionally you may apply textures over the selected color.

```
{
    "nails": {
        "color": "#FFFF49",
        "gloss": 40,
        "textures": [
            "tex1.png",
            "tex2.png",
            "tex3.png",
            "tex4.png",
            "tex5.png"
        ]
    }
}
```

| Parameter  | Description                                                                                        |                           Optional                           | Default Value |
| :--------- | :------------------------------------------------------------------------------------------------- | :----------------------------------------------------------: | :-----------: |
| `color`    | Set nails color                                                                                    |                              *+*                             |      *+*      |
| `gloss`    | Gloss of the nails color in the range of *\[0, 60]* (recommended)                                  | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |      `40`     |
| `textures` | 5-element array of texture's filenames of each nail. They will be applied over the selected color. | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |  `undefined`  |

**Preview**

![Right image compare](/assets/images/Right_before-4fb8bc03b86de05223f45d7c0bebc10f.png)![Left image compare](/assets/images/Right_after-0742345b61bc4398c8c0ff3e5c83f3d3.png)

Drag

note

The nails coloring feature requires the [nails segmentation neural network](/tutorials/capabilities/sdk_features.md). Please, make sure your licence plan includes one by contacting your sales manager or fill in the website form to request it.
