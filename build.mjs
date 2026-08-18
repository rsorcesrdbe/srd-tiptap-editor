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

// ESM (factory Alpine.data) : x-load-src de Filament charge ce fichier via import()
// dynamique -- jamais via un <script> classique, donc format esm ici, pas iife (voir
// index.alpine.js pour le detail du bug que ca corrige, 2026-08-18).
await build({
    entryPoints: ['src/js/index.alpine.js'],
    bundle: true,
    format: 'esm',
    outfile: 'dist/editeur.alpine.js',
    sourcemap: true,
});

copyFileSync('src/css/editeur.css', 'dist/editeur.css');

console.log('Build termine : dist/editeur.js, dist/editeur.alpine.js, dist/editeur.css');
