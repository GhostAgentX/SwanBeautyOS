# Makeup Prefabs

### Basic concepts[​](#basic-concepts "Direct link to Basic concepts")

Each `makeup` prefab represents a specific region of the face and has a similar style of settings:

```
// ...
    {
        "color": "0.95 0.70 0.54",
        "finish": "natural",
        "coverage": "mid"
    }
// ...
```

`color` - Solid color of the region in RGB string format.

`finish` - Type of the finish surface (e.g. `natural`, `matte`). See available options for the specific region below.

`coverage` - Coverage intensity. Can be `low`, `mid`, `high` or float number in the range `[0.0, 1.0]`.

### Makeup Base[​](#makeup-base "Direct link to Makeup Base")

```
"faces": [
    {
        "makeup_base": {
            "mode": "quality",
            "smooth": "0 1",
            "smokey": 0
        }
        // ...
    }
    // ...
]
```

| Parameter | Description                                                                                                                               |                           Optional                           | Default Value |
| :-------- | :---------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------: | :-----------: |
| `mode`    | Can be 'speed' or 'quality' (to use heavy algorithms).                                                                                    | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |   `"speed"`   |
| `smooth`  | Smooths face skin. Contains 2 values of the smoothing strength for corresponding regions: `whole face` and `under eyes`.                  | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |    `"0 1"`    |
| `smokey`  | Smokey eyes index. 0 disables smokey eyes; 1, 2, 3 or 4 selects different set of smokey eyes textures for the first two eyeshadow layers. | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |      `0`      |

### Eyebags[​](#eyebags "Direct link to Eyebags")

**Usage**

```
"faces": [
    {
        "makeup_eyebags": {
            "alpha": 0.8
        },
        // ...
    }
    // ...
]
```

`alpha` *(optional)* - Transparency for eyes circles in the range from `0` to `1`. Default value: `0.8`.

**Preview**

![Right image compare](/assets/images/original-8823b66ca7c9e5a54656f6ee9b77c29f.jpg)![Left image compare](/assets/images/eyebags-9cbd40d2add99adcaa5df79b82b4b3cf.jpg)

Drag

### Foundation[​](#foundation "Direct link to Foundation")

**Usage**

```
"faces": [
    {
        "makeup_foundation": {
            "color": "0.95 0.70 0.54",
            "finish": "natural",
            "coverage": "mid"
        },
        // ...
    }
    // ...
]
```

`finish` - One of: `natural`, `matte`, `radiance`.

**Preview**

![Right image compare](/assets/images/original-8823b66ca7c9e5a54656f6ee9b77c29f.jpg)![Left image compare](/assets/images/foundation-722812ce8d57e2adc8fd9492c47689f1.jpg)

Drag

### Concealer[​](#concealer "Direct link to Concealer")

**Usage**

```
"faces": [
    {
        "makeup_concealer": {
            "color": "0.94 0.73 0.66",
            "finish": "natural",
            "coverage": "mid"
        },
        // ...
    }
    // ...
]
```

`finish` - One of: `natural`, `matte`.

**Preview**

![Right image compare](/assets/images/original-8823b66ca7c9e5a54656f6ee9b77c29f.jpg)![Left image compare](/assets/images/concealer-9f1a17f7cb038d705dce5b41732d744c.jpg)

Drag

### Contour[​](#contour "Direct link to Contour")

**Usage**

```
"faces": [
    {
        "makeup_contour": {
            "color": "1 0 0",
            "finish": "normal",
            "coverage": "mid"
        },
        // ...
    }
    // ...
]
```

`finish` - One of: `normal`.

**Preview**

![Right image compare](/assets/images/original-8823b66ca7c9e5a54656f6ee9b77c29f.jpg)![Left image compare](/assets/images/contour-5841a00c527aea7d50ed6210be0c5705.jpg)

Drag

### Highlighter[​](#highlighter "Direct link to Highlighter")

**Usage**

```
"faces": [
    {
        "makeup_highlighter": {
            "color": "0.9 0.80 0.83",
            "finish": "shimmer",
            "coverage": "mid"
        },
        // ...
    }
    // ...
]
```

`finish` - One of: `shimmer`.

**Preview**

![Right image compare](/assets/images/original-8823b66ca7c9e5a54656f6ee9b77c29f.jpg)![Left image compare](/assets/images/highlighter-bd43a4e867e535aad0d65353762c63a8.jpg)

Drag

### Blush[​](#blush "Direct link to Blush")

**Usage**

```
"faces": [
    {
        "makeup_blush": {
            "color": "0.88 0.65 0.75",
            "finish": "shimmer",
            "coverage": "mid"
        },
        // ...
    }
    // ...
]
```

`finish` - One of: `shimmer`, `matte`, `cream_shine`.

**Preview**

![Right image compare](/assets/images/original-8823b66ca7c9e5a54656f6ee9b77c29f.jpg)![Left image compare](/assets/images/blush-af461e4c729818d407a7233758243c03.jpg)

Drag

### Lipstick[​](#lipstick "Direct link to Lipstick")

**Usage**

```
"faces": [
    {
        "makeup_lipstick": {
            "color": "0.88 0.47 0.61",
            "finish": "shimmer",
            "coverage": "high"
        },
        // ...
    }
    // ...
]
```

`finish` - One of: `shimmer`, `matte_dry`, `matte_cream`, `matte_powder`, `matte_liquid`, `cream_shine`, `glossy_cream_plumping`, `balm`, `balm_light`, `glossy_cream_shimmer`, `cream_vividcolors`, `matte_velvet`, `cream_shine_glitter`, `matte_velvet_sparkling`, `matte_sheer_lightcolors`, `matte_cream_vividcolors`, `metallic_cream`, `matte_velvet_sparkling_lightcolors`, `matte_light`, `metallic_shine`, `metallic_dry_lightcolors`, `satin`, `shine`, `cream`, `clear`, `cream_darkcolors`, `clear_shimmer`, `metallic_sheer`.

**Preview**

![Right image compare](/assets/images/original2-f74f044be90519e96c2b58b2db7ddce2.jpg)![Left image compare](/assets/images/lipstick-4b6bc4d5377a5fb262ad948e7488b9bf.jpg)

Drag

### Lipsliner[​](#lipsliner "Direct link to Lipsliner")

**Usage**

```
"faces": [
    {
        "makeup_lipsliner": {
            "color": "0.99 0.0 0.0",
            "finish": "shimmer",
            "coverage": "high",
            "liner": "3 5"
        },
        // ...
    }
    // ...
]
```

`finish` - One of: `shimmer`.

`liner` *(optional)* - Liner options contain 2 values: `liner width` and `softness`. Default value: `3 5`.

**Preview**

![Right image compare](/assets/images/original2-f74f044be90519e96c2b58b2db7ddce2.jpg)![Left image compare](/assets/images/lipsliner-c446fc27d392e9716288209b30a47e58.jpg)

Drag

### Eyeshadow[​](#eyeshadow "Direct link to Eyeshadow")

**Usage**

```
"faces": [
    {
        "makeup_eyeshadow": [
            {
                "color": "0.21 0.42 0.32",
                "finish": "matte",
                "coverage": "high"
            },
            {
                "color": "0.3 0.58 0.47",
                "finish": "shimmer",
                "coverage": "high"
            },
            {
                "color": "1.00 0.91 0.27",
                "finish": "metallic",
                "coverage": "high"
            }
        ],
        // ...
    }
    // ...
]
```

Can be an object with one eyeshadow definition, or an array of the eyeshadows (**max length 3**) applied one after another.

`finish` - One of: `shimmer`, `matte`, `matte_powder`, `glitter_metallic`, `glitter`, `metallic`, `glitter_sheer`, `cream`.

**Preview**

![Right image compare](/assets/images/original-8823b66ca7c9e5a54656f6ee9b77c29f.jpg)![Left image compare](/assets/images/eyeshadow-ebee6f8b0da993382f550ad5872534a8.jpg)

Drag

### Eyelashes[​](#eyelashes "Direct link to Eyelashes")

**Usage**

```
"faces": [
    {
        "makeup_eyelashes": {
            "color": "0 0 0",
            "finish": "volume",
            "coverage": "high"
        },
        // ...
    }
    // ...
]
```

`finish` - One of: `volume`, `lengthening`, `lengthandvolume`, `natural`, `natural_bottom`

**Preview**

![Right image compare](/assets/images/original-8823b66ca7c9e5a54656f6ee9b77c29f.jpg)![Left image compare](/assets/images/eyelashes-d10119917263609bb8a19279278ebd76.jpg)

Drag

### Eyeliner[​](#eyeliner "Direct link to Eyeliner")

**Usage**

```
"faces": [
    {
        "makeup_eyeliner": {
            "color": "0.0 0.0 0.0",
            "finish": "matte_liquid",
            "coverage": "high"
        },
        // ...
    }
    // ...
]
```

`finish` - One of: `shimmer`, `cream`, `matte_liquid`, `matte_cream`, `matte_dark`, `metallic`, `shimmer`, `glitter`, `cream_lightcolors`.

**Preview**

![Right image compare](/assets/images/original-8823b66ca7c9e5a54656f6ee9b77c29f.jpg)![Left image compare](/assets/images/eyeliner-4d7a9a99580d76059b9d2fbcac49b5b9.jpg)

Drag

### Eyebrows[​](#eyebrows "Direct link to Eyebrows")

**Usage**

```
"faces": [
    {
        "makeup_eyebrows": {
            "color": "0.39 0.26 0.27",
            "finish": "matte",
            "coverage": "mid"
        },
        // ...
    }
    // ...
]
```

`finish` - One of: `matte`, `wet`, `clear`.

**Preview**

![Right image compare](/assets/images/original-8823b66ca7c9e5a54656f6ee9b77c29f.jpg)![Left image compare](/assets/images/eyebrows-80609d099b6ebe704df37dc3d7203c39.jpg)

Drag

### Lipsshine[​](#lipsshine "Direct link to Lipsshine")

**Usage**

```
"faces": [
    {
        "makeup_lipsshine": {
            "color": "1.0 0.0 0.0",
            "finish": "glitter",
            "coverage": "mid"
        },
        // ...
    }
    // ...
]
```

`finish` - One of: `shine`, `glitter`.

**Preview**

![Right image compare](/assets/images/original2-f74f044be90519e96c2b58b2db7ddce2.jpg)![Left image compare](/assets/images/lipshine-71bf9d4d51904c26b6347475215ee75b.jpg)

Drag

### Lips Gloss[​](#lips-gloss "Direct link to Lips Gloss")

**Usage**

```
"faces": [
    {
        "makeup_lipsgloss": {
            "threshold": 0.96,
            "contour": 0.45,
            "weakness": 0.5,
            "multiplier": 1.5,
            "alpha": 0.8
        },
        // ...
    }
    // ...
]
```

| Parameter    | Description                                        |                           Optional                           | Default Value |
| :----------- | :------------------------------------------------- | :----------------------------------------------------------: | :-----------: |
| `threshold`  | Gloss threshold. Higher value - smaller blick.     | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |     `0.95`    |
| `contour`    | Blick contour softness.                            | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |     `0.5`     |
| `weakness`   | Blick mask weakness. Higher value - smaller blick. | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |     `0.5`     |
| `multiplier` | Blick mask multiplier.                             | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |     `1.5`     |
| `alpha`      | Blick mask visibility.                             | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |     `0.7`     |

**Preview**

![Right image compare](/assets/images/lipsgloss1-3552ded6972501314cbd7ec57bf8a502.jpg)![Left image compare](/assets/images/lipsgloss2-81fa5f99c282bfe870937e83c7435bd6.jpg)

Drag

### Lips Chameleon[​](#lips-chameleon "Direct link to Lips Chameleon")

**Usage**

```
"faces": [
    {
        "makeup_lipschameleon": {
            "colors": [
                {
                    "color": "#3342b0",
                    "finish": "metallic_cream",
                    "coverage": "high"
                },
                {
                    "color": "#a028b0",
                    "finish": "metallic_cream",
                    "coverage": "high"
                }
            ],
            "threshold": 0.92,
            "contour": 0.3,
            "weakness": 0.25
        }
        // ...
    }
    // ...
]
```

| Parameter   | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |                           Optional                           | Default Value |
| :---------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------: | :-----------: |
| `colors`    | Array of lipsticks parameters. Must contain 2 elements with color/finish/coverage fields.                                                                                                                                                                                                                                                                                                                                                                                                                                    |                              *+*                             |      *+*      |
| `color`     | Solid color of the region in RGB string format.                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |                              *+*                             |      *+*      |
| `finish`    | Type of the finish surface (shimmer, matte\_dry, matte\_cream, matte\_powder, matte\_liquid, cream\_shine, glossy\_cream\_plumping, balm, balm\_light, glossy\_cream\_shimmer, cream\_vividcolors, matte\_velvet, cream\_shine\_glitter, matte\_velvet\_sparkling, matte\_sheer\_lightcolors, matte\_cream\_vividcolors, metallic\_cream, matte\_velvet\_sparkling\_lightcolors, matte\_light, metallic\_shine, metallic\_dry\_lightcolors, satin, shine, cream, clear, cream\_darkcolors, clear\_shimmer, metallic\_sheer). |                              *+*                             |      *+*      |
| `coverage`  | Lipstick coverage intensity.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |                              *+*                             |      *+*      |
| `threshold` | Chameleon mask threshold. Higher value - smaller mask.                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |     `0.92`    |
| `contour`   | Chameleon mask contour softness                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |     `0.3`     |
| `weakness`  | Chameleon mask weakness. Higher value - smaller mask.                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |     `0.25`    |

**Preview**

![Right image compare](/assets/images/original2-f74f044be90519e96c2b58b2db7ddce2.jpg)![Left image compare](/assets/images/lipschameleon-ba7ea6e56fe0a7e7ecf62493feec9d29.jpg)

Drag

### Eyelids Gloss[​](#eyelids-gloss "Direct link to Eyelids Gloss")

**Usage**

```
"faces": [
    {
        "makeup_eyelidsgloss": {
            "threshold": 0.95,
            "contour": 0.6,
            "weakness": 0.6,
            "multiplier": 1.5,
            "alpha": 1
        }
        // ...
    }
    // ...
]
```

| Parameter    | Description                                        |                           Optional                           | Default Value |
| :----------- | :------------------------------------------------- | :----------------------------------------------------------: | :-----------: |
| `threshold`  | Gloss threshold. Higher value - smaller blick.     | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |     `0.98`    |
| `contour`    | Blick contour softness.                            | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |     `0.5`     |
| `weakness`   | Blick mask weakness. Higher value - smaller blick. | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |     `0.5`     |
| `multiplier` | Blick mask multiplier.                             | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |     `1.5`     |
| `alpha`      | Blick mask visibility.                             | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |     `0.6`     |

**Preview**

![Right image compare](/assets/images/eyelidsgloss1-88a2d06dcc4e82d1fe9212e9a54c3b0c.jpg)![Left image compare](/assets/images/eyelidsgloss2-d0fbc506fb3f1e7024ca6b3e34572a05.jpg)

Drag

### Eyelids Chameleon[​](#eyelids-chameleon "Direct link to Eyelids Chameleon")

**Usage**

```
"faces": [
    {
        "makeup_eyelids_chameleon": {
            "colors": {
                "bottom": [
                    {
                        "color": "#3342b0",
                        "finish": "shimmer",
                        "coverage": "high"
                    },
                    {
                        "color": "#3342b0",
                        "finish": "shimmer",
                        "coverage": "high"
                    },
                    {
                        "color": "#3342b0",
                        "finish": "shimmer",
                        "coverage": "high"
                    }
                ],
                "upper": [
                    {
                        "color": "#a028b0",
                        "finish": "shimmer",
                        "coverage": "high"
                    },
                    {
                        "color": "#a028b0",
                        "finish": "shimmer",
                        "coverage": "high"
                    },
                    {
                        "color": "#a028b0",
                        "finish": "shimmer",
                        "coverage": "high"
                    }
                ]
            },
            "threshold": 0.92,
            "contour": 0.3,
            "weakness": 0.25
        }
        // ...
    }
    // ...
]
```

| Parameter   | Description                                                                                                              |                           Optional                           | Default Value |
| :---------- | :----------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------: | :-----------: |
| `colors`    | Container of bottom and upper colors.                                                                                    |                              *+*                             |      *+*      |
| `bottom`    | Array of bottom colors. May contain up to 3 elements with color/finish/coverage data.                                    |                              *+*                             |      *+*      |
| `upper`     | Array of upper colors. May contain up to 3 elements with color/finish/coverage data.                                     |                              *+*                             |      *+*      |
| `color`     | Solid color of the region in RGB string format.                                                                          |                              *+*                             |      *+*      |
| `finish`    | Type of the finish surface (shimmer, matte, matte\_powder, glitter\_metallic, glitter, metallic, glitter\_sheer, cream). |                              *+*                             |      *+*      |
| `coverage`  | Coverage intensity.                                                                                                      |                              *+*                             |      *+*      |
| `threshold` | Chameleon mask threshold. Higher value - smaller mask.                                                                   | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |     `0.92`    |
| `contour`   | Chameleon mask contour softness                                                                                          | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |     `0.3`     |
| `weakness`  | Chameleon mask weakness. Higher value - smaller mask.                                                                    | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |     `0.25`    |

**Preview**

![Right image compare](/assets/images/original2-f74f044be90519e96c2b58b2db7ddce2.jpg)![Left image compare](/assets/images/eyelidschameleon-2a37c1d6e58bfad1fb2fd1470591e1e4.jpg)

Drag

### Lips Glitter[​](#lips-glitter "Direct link to Lips Glitter")

**Usage**

```
"faces": [
    {
        "makeup_lips_glitter": {
            "color": "0.7 0.3 0.7",
            "alpha": 0.75
        }
        // ...
    }
    // ...
]
```

| Parameter | Description                  |                           Optional                           | Default Value |
| :-------- | :--------------------------- | :----------------------------------------------------------: | :-----------: |
| `color`   | Glitter color in RGB format. | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |   `"0 0 0"`   |
| `alpha`   | Glitter effect visibility.   | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |     `0.0`     |

**Preview**

![Right image compare](/assets/images/lips_glitter_right-220262837fd3b237c9a5e7b8fd06eec0.jpg)![Left image compare](/assets/images/lips_glitter_left-15bb0ecbc4cbc280253f24d1ff3581a7.jpg)

Drag

### Eyelids Glitter[​](#eyelids-glitter "Direct link to Eyelids Glitter")

**Usage**

```
"faces": [
    {
        "makeup_eyelids_glitter": {
            "color": "1.0 0.0 0.5",
            "alpha": 0.75
        }
        // ...
    }
    // ...
]
```

| Parameter | Description                  |                           Optional                           | Default Value |
| :-------- | :--------------------------- | :----------------------------------------------------------: | :-----------: |
| `color`   | Glitter color in RGB format. | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |   `"0 0 0"`   |
| `alpha`   | Glitter effect visibility.   | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |     `0.0`     |

**Preview**

![Right image compare](/assets/images/eyelids_glitter_right-dbeb8a7e5fcff9d94c5c3f8ee7a757ca.jpg)![Left image compare](/assets/images/eyelids_glitter_left-2c0828a3e020f38a87a827dfcc5fc458.jpg)

Drag

## All Features[​](#all-features "Direct link to All Features")

Lets combine all features together:

**Example**

```
{
    "faces": [
        {
            "makeup_base": {
                "smooth": "0 1",
                "mode": "quality"
            },
            "makeup_eyebags": {
                "alpha": 0.8
            },
            "makeup_foundation": {
                "color": "0.95 0.70 0.54",
                "finish": "natural",
                "coverage": "mid"
            },
            "makeup_concealer": {
                "color": "0.94 0.73 0.66",
                "finish": "natural",
                "coverage": 1
            },
            "makeup_contour": {
                "color": "1 0 0",
                "finish": "normal",
                "coverage": "mid"
            },
            "makeup_highlighter": {
                "color": "0.9 0.80 0.83",
                "finish": "shimmer",
                "coverage": "mid"
            },
            "makeup_blush": {
                "color": "0.88 0.65 0.75",
                "finish": "shimmer",
                "coverage": "mid"
            },
            "makeup_lipstick": {
                "color": "0.88 0.47 0.61",
                "finish": "shimmer",
                "coverage": "high"
            },
            "makeup_lipsliner": {
                "color": "0.99 0.0 0.0",
                "finish": "shimmer",
                "coverage": "high",
                "liner": "3 5"
            },
            "makeup_eyeshadow": [
                {
                    "color": "0.21 0.42 0.32",
                    "finish": "matte",
                    "coverage": "high"
                },
                {
                    "color": "0.3 0.58 0.47",
                    "finish": "shimmer",
                    "coverage": "high"
                },
                {
                    "color": "1.00 0.91 0.27",
                    "finish": "metallic",
                    "coverage": "high"
                }
            ],
            "makeup_eyeliner": {
                "color": "0.0 0.0 0.0",
                "finish": "matte_liquid",
                "coverage": "high"
            },
            "makeup_eyebrows": {
                "color": "0.39 0.26 0.27",
                "finish": "matte",
                "coverage": "mid"
            },
            "makeup_lipsshine": {
                "color": "1.0 0.0 0.0",
                "finish": "glitter",
                "coverage": "mid"
            },
            "makeup_eyelashes": {
                "color": "1 0 0",
                "finish": "volume",
                "coverage": "high"
            },
            "makeup_lipsgloss": {
                "threshold": 0.96,
                "contour": 0.45,
                "weakness": 0.5,
                "multiplier": 1.5,
                "alpha": 0.8
            },
            "makeup_eyelidsgloss": {
                "threshold": 0.95,
                "contour": 0.6,
                "weakness": 0.6,
                "multiplier": 1.5,
                "alpha": 1
            }
        }
    ],
    "scene": "test_makeup",
    "version": "2.0.0"
}
```

**Preview**

![Right image compare](/assets/images/original2-f74f044be90519e96c2b58b2db7ddce2.jpg)![Left image compare](/assets/images/all-fa62ce77e0126c7c957ad612dfb34859.jpg)

Drag
