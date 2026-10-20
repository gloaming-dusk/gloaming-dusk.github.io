# gloaming-dusk.github.io

The website of [Gloam](https://gloaming-dusk.github.io/), the NixOS-based
distribution built around the [Shady](https://github.com/gloaming-dusk/shady)
3D Wayland compositor. The ISO is built from
[gloaming-dusk/gloam](https://github.com/gloaming-dusk/gloam). Shady's own
documentation site lives in
[gloaming-dusk/shady-website](https://github.com/gloaming-dusk/shady-website)
and is served at `/shady/`.

```sh
npm ci
npm run dev      # http://localhost:4321
npm run check
npm run build    # static output in dist/
```

The download page reads the latest `gloam-v*` release of
`gloaming-dusk/gloam` (or, for releases up to 0.2.1, `gloaming-dusk/shady`)
from the GitHub API at build time (set `GITHUB_TOKEN`
to avoid rate limits). Without network access, or before the first release,
it shows how to build the ISO instead. The Pages workflow rebuilds the site
every six hours, so new releases appear without a deploy.

Media in `public/media/` comes from Shady's rices and the Gloam greeter VM
test: the hero loop, the hours and `preview.jpg` from Horizon, Gloam's desktop
(`rices/horizon/capture.sh`), `sky.jpg` from Afterglow and `neon-transit.jpg`
from Neon Transit.
