import { build } from 'esbuild';
import { copyFileSync, mkdirSync } from 'node:fs';

mkdirSync('dist', { recursive: true });

// ESM : pour un futur consommateur passant par un bundler (ex. RAPSRD/Vite).
await build({
    entryPoints: ['src/js/index.js'],
    bundle: true,
    format: 'esm',
    outfile: 'dist/editeur.js',
    sourcemap: true,
});

// IIFE : pour Filament/Alpine (x-load-src charge un simple <script>, pas de bundler cote consommateur).
// footer : esbuild expose { default: ... } sous le nom global vu que l'entree n'a qu'un export
// default -- on deroule explicitement pour que window.SrdTipTapEditor soit la classe elle-meme.
await build({
    entryPoints: ['src/js/index.iife.js'],
    bundle: true,
    format: 'iife',
    globalName: 'SrdTipTapEditor',
    outfile: 'dist/editeur.iife.js',
    sourcemap: true,
    footer: { js: 'window.SrdTipTapEditor = window.SrdTipTapEditor.default;' },
});

copyFileSync('src/css/editeur.css', 'dist/editeur.css');

console.log('Build termine : dist/editeur.js, dist/editeur.iife.js, dist/editeur.css');
