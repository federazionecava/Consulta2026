import { existsSync } from 'node:fs';
import { join } from 'node:path';
import data from '../data/proposte.json';

export type AreaId = keyof typeof data.aree;

export interface Proposta {
  slug: string;
  numero: number;
  area: AreaId;
  titolo: string;
  sintesi: string;
  testo: string[];
  video?: string;
  poster?: string;
}

/** Prefixes a root-relative path with the configured `base` (needed on GitHub Pages). */
export const url = (path: string) =>
  /^https?:\/\//.test(path)
    ? path
    : `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;

// Resolved from the project root: import.meta.url points into the build output at build time.
const inPublic = (path: string) => existsSync(join(process.cwd(), 'public', path));

/** Uses `video`/`poster` from the JSON if set; otherwise picks up public/video/<slug>.mp4 and .jpg/.webp by convention. */
function withMedia(p: Proposta): Proposta {
  const video = p.video ?? (inPublic(`video/${p.slug}.mp4`) ? `video/${p.slug}.mp4` : undefined);
  const poster =
    p.poster ?? ['jpg', 'webp'].map((ext) => `video/${p.slug}.${ext}`).find(inPublic);
  return { ...p, video: video && url(video), poster: poster && url(poster) };
}

export const proposte: Proposta[] = (data.proposte as Proposta[])
  .map(withMedia)
  .sort((a, b) => a.numero - b.numero);

export const areaNome = (id: AreaId) => data.aree[id].nome;

export const ragioni = data.ragioni;
export const rete = data.rete;
