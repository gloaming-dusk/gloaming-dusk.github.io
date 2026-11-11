# Gloam website

The project website is a static [Astro](https://astro.build/) site.

The documentation is not duplicated into the site. The site renders
checkouts of the repositories it describes: the Astro content collection
loads Markdown directly from [shady](https://github.com/gloaming-dusk/shady)'s
and [shady-shell](https://github.com/gloaming-dusk/shady-shell)'s `docs/*.md`
and [shady-greeter](https://github.com/gloaming-dusk/shady-greeter)'s README,
and pages import images from [Gloam](https://github.com/gloaming-dusk/gloam)
(Tide), [shady-rice-afterglow](https://github.com/gloaming-dusk/shady-rice-afterglow)
and [shady-rice-horizon](https://github.com/gloaming-dusk/shady-rice-horizon)
through the `@gloam`, `@afterglow` and `@horizon` aliases. Each checkout is
`./<repository name>`, ignored by git; each can be a symlink to a checkout
elsewhere.

## Development

```sh
for r in shady shady-shell shady-greeter gloam shady-rice-afterglow shady-rice-horizon; do
  git clone https://github.com/gloaming-dusk/$r   # or: ln -s ../$r $r
done
nix develop
npm ci
npm run dev
```

Quality checks:

```sh
npm run check
npm run build
```

The static output is written to `dist/`.

## Deployment

The site is served at <https://gloaming-dusk.github.io/> and deploys from this
repository (`.github/workflows/deploy.yml`) on every push to `main`. It builds
against those repositories' `main` branches, so a change to their docs appears on the daily
run, or right away with `gh workflow run deploy.yml`. Pull requests are checked
but not deployed.

## Content

- `src/pages/index.astro` — landing page
- `src/pages/getting-started.astro` — installation and first-run guide
- `src/pages/demo/afterglow.astro` — featured Afterglow demo
- `src/pages/plugins.astro` — available plugins, core modules, and loading instructions
- `src/lib/plugins.ts` — plugin catalog; keep names and build status aligned with `meson.build` and `src/module/builtin.c`
- `src/pages/docs/` — routes backed directly by the repository `docs/` directory

## Plugin screenshots

Every plugin card uses a real 1280×720 capture from Shady's headless backend,
created with `shady.automation.screenshot()` and `grim`. The scenes use live
`foot` Wayland clients, activate the relevant effects, and capture animations
in progress. `hello` and `counter` have no visual effect, so their previews
show actual plugin logs; the counter scene also performs a stateful reload.
Core modules are documented separately and do not have plugin screenshots.

Regenerate all previews against a built Shady checkout, using Shady's
development shell:

```sh
cd shady
nix develop
./tools/build.sh
ninja -C build libshady-plugin-hello.so libshady-plugin-counter.so libshady-plugin-orbit-layout.so
cd ..
python3 scripts/capture-plugin-previews.py
```

Pass plugin names to regenerate only selected previews:

```sh
python3 scripts/capture-plugin-previews.py water-windows fps-cube
```

The capture script creates an isolated runtime directory for each compositor,
uses software GLES2, and writes PNG originals to `src/assets/plugins/`. The
scene configuration and automation are in `scripts/plugin-previews/`.
The OBJ scene loads Shady's `assets/test-room.obj`. Full-size PNGs remain available
by clicking each preview; Astro generates lazy-loaded WebP thumbnails for
the cards. Regenerate captures after changes to plugin rendering or shaders.
