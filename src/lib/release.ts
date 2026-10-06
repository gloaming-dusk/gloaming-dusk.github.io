/*
 * The latest Gloam release, read from GitHub when the site is built.
 * Releases are tagged gloam-v<version> on gloaming-dusk/shady. GitHub caps
 * an asset at 2 GiB, so the ISO is attached in parts (<iso>.part0, .part1,
 * ...) next to <iso>.sha256 for the joined image. The site rebuilds on a
 * schedule, so a new release shows up without a deploy.
 */
import { REPO } from './site';

export interface ReleaseAsset {
  name: string;
  url: string;
  size: number;
}

export interface GloamRelease {
  tag: string;
  version: string;
  name: string;
  url: string;
  published: Date;
  iso: string;
  parts: ReleaseAsset[];
  checksum?: ReleaseAsset;
  totalSize: number;
}

interface GitHubAsset {
  name: string;
  browser_download_url: string;
  size: number;
}

interface GitHubRelease {
  tag_name: string;
  name: string | null;
  html_url: string;
  published_at: string;
  draft: boolean;
  prerelease: boolean;
  assets: GitHubAsset[];
}

const PART = /^(.+\.iso)\.part(\d+)$/;

export async function latestRelease(): Promise<GloamRelease | null> {
  // GLOAM_RELEASES_FILE: a saved API response, to try the page without a release.
  const fixture = process.env.GLOAM_RELEASES_FILE;
  if (fixture) {
    const { readFile } = await import('node:fs/promises');
    return pick(JSON.parse(await readFile(fixture, 'utf8')) as GitHubRelease[]);
  }

  const headers: Record<string, string> = { Accept: 'application/vnd.github+json' };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const response = await fetch(`https://api.github.com/repos/${REPO}/releases?per_page=30`, { headers });
    if (!response.ok) {
      console.warn(`release: GitHub answered ${response.status}; building without a release`);
      return null;
    }
    return pick((await response.json()) as GitHubRelease[]);
  } catch (error) {
    console.warn(`release: ${String(error)}; building without a release`);
    return null;
  }
}

function pick(releases: GitHubRelease[]): GloamRelease | null {
  const release = releases.find((r) => !r.draft && r.tag_name.startsWith('gloam-'));
  if (!release) return null;

  const parts = release.assets
    .map((asset) => ({ asset, match: PART.exec(asset.name) }))
    .filter((entry): entry is { asset: GitHubAsset; match: RegExpExecArray } => entry.match !== null)
    .sort((a, b) => Number(a.match[2]) - Number(b.match[2]));
  if (parts.length === 0) return null;

  const iso = parts[0].match[1];
  const checksum = release.assets.find((asset) => asset.name === `${iso}.sha256`);
  const toAsset = (asset: GitHubAsset): ReleaseAsset => ({
    name: asset.name,
    url: asset.browser_download_url,
    size: asset.size,
  });

  return {
    tag: release.tag_name,
    version: release.tag_name.replace(/^gloam-v?/, ''),
    name: release.name || release.tag_name,
    url: release.html_url,
    published: new Date(release.published_at),
    iso,
    parts: parts.map(({ asset }) => toAsset(asset)),
    checksum: checksum ? toAsset(checksum) : undefined,
    totalSize: parts.reduce((sum, { asset }) => sum + asset.size, 0),
  };
}

export function formatSize(bytes: number): string {
  const gib = bytes / 1024 ** 3;
  return gib >= 1 ? `${gib.toFixed(2)} GiB` : `${Math.round(bytes / 1024 ** 2)} MiB`;
}
