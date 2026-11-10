tip

You may also create your own effects with [**Banuba Studio**](https://studio.banuba.com/) or buy some from the [**Banuba Asset Store**](https://assetstore.banuba.net/).

# Effect structure

Every Banuba effect is a folder containing files with special meaning. This is what a typical effect looks like:

```
effect_folder/
 |-- config.json
 |-- config.js
 |-- images/
 |    |
 |   ...
 |-- shaders/
 |    |
 |   ...
 |-- videos/
 |    |
 |   ...
...
```

Only `config.json` is mandatory (see below). So, in order to start, create a folder with one blank file named like this.

Other subfolders have no special meaning and exist only to group related files, which are usually referred from `config.json` or `config.js`.

## config.json[​](#configjson "Direct link to config.json")

This is the basic file that describes the effect itself. It has the following format:

```
{
    "scene": "effect name",
    "version": "2.0.0",

    "camera": {}
}
```

Where

* `scene` - this is the name of your effect.
* `version` - version of this configuration file. Always set it to `"2.0.0"`. The previous version is designed for the complex legacy effects.
* `camera` - tells that you will render camera feed on the screen.

Each effect can be complemented by other features ("prefabs" in our terminology).

tip

**Learn more about prefabs** [here](/effects/prefabs/overview.md)

The basic complete example will look like this (it will render black eyeliner on a face):

```
{
    "scene": "Retouch example",
    "version": "2.0.0",
    "camera": {},
    "faces": [
        {
            "makeup_eyeliner": {
                "color": "0.0 0.0 0.0",
                "finish": "matte_liquid",
                "coverage": "hi"
            }
        }
    ]
}
```

Another good example to start:

[](pathname:///generated/effects/simple_hat_v2.zip)

[Download simple 3D model sample](pathname:///generated/effects/simple_hat_v2.zip)

## config.js[​](#configjs "Direct link to config.js")

This file may contain some business logic written in JavaScript. Refer to other documentation pages in this section. The most important feature related to scripting is probably [Virtual background](/effects/virtual_background.md).
