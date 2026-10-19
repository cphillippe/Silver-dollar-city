# Silver City XML packs

Schema **v3**. One file per district area, plus `index.xml` (East porch lessons live in the index).

These files are the Learn / Match / Hold **source of truth**. The play engine adapts them; do not invent conflicting lesson copy here.

See `SCHEMA.md`.

Easy lesson order and the one gold step per screen live in [`golden-path.xml`](./golden-path.xml). How to edit that file: [`GOLDEN-PATH.md`](./GOLDEN-PATH.md). Check `package.json` version and the main commit before you change it, and set `appVersion` on `<goldenPath>` to the app version you are shipping.
