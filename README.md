# srd-tiptap-editor

Moteur d'édition TipTap partagé entre les applications SRD (SRDPROJETS, RAPSRD, ERPSRD...). Extrait de l'écran `param_zone_txtrich` de RAPSRD (choix TipTap retenu sur TinyMCE, décision journalisée dans SRDPROJETS, item `260815_INT_RSO_SRDP_0022`).

## Ce que contient le package

- **`src/js/`** — moteur d'édition, sans aucun ID DOM en dur : mise en forme (police, taille, couleur, surlignage, alignement, interligne), tableaux (bordures par côté, redimensionnement de colonne, fusion/scission de cellules), images redimensionnables, zoom/largeur d'impression. Build via esbuild (`npm run build`) vers `dist/editeur.js` (ESM) et `dist/editeur.iife.js` (global `window.SrdTipTapEditor`, pour Filament/Alpine).
- **`src/css/editeur.css`** — copié tel quel dans `dist/editeur.css`.
- **`src/php/`** — package Composer `srd/tiptap-editor`, champ Filament (`Srd\TiptapEditor\Filament\TiptapEditor`), enregistre les assets via `FilamentAsset::register()` (même mécanisme que les champs natifs Filament).

## Ce qui n'est PAS encore fait

- **Upload d'image non câblé côté Filament** : le cœur JS le supporte (callback `telechargerImage` injectable), mais le brancher sur l'upload de fichiers Livewire est un chantier à part. Le bouton d'image n'apparaît pas dans la barre d'outils Filament fournie ici.
- **Migration de RAPSRD vers ce package** : pas faite ici, pilotée séparément (RAPSRD garde son implémentation locale `param-zone-txtrich.js` pour l'instant).
- **Aucun registre npm/Composer privé** : consommation en dépendance locale par chemin relatif (`"repositories": [{"type": "path", "url": "../srd-tiptap-editor"}]`), pas de publication.

## Développement

```
npm install
npm run build   # regenere dist/ -- a faire avant tout commit touchant src/js ou src/css
```

`dist/` est commité dans git (pas de `.gitignore` dessus) : un consommateur du champ Filament n'a pas besoin de Node.js installé.

## API JS

```js
new SrdTipTapEditor({
  monter: HTMLElement,                 // requis : element de montage
  contenuInitial: string,               // HTML initial
  onChange: (html) => void,             // requis

  barreOutils: HTMLElement | null,      // [data-commande] scannes dedans
  rubanTableau: HTMLElement | null,     // ruban contextuel tableau
  zonePage: HTMLElement | null,         // ancetre position:relative (defaut: parent de "monter")

  controles: {                          // tous optionnels
    taillepolice, police, interligne,    // <select>
    couleurTexte, couleurSurlignage,       // <input type=color>
    boutonSansSurlignage,                    // <button>
    zoom,                                      // <select>, valeurs = multiplicateurs
    bordures,                                    // <select> bordures de cellule
    grilleTableau: { bouton, popup },             // picker taille de tableau
  },

  telechargerImage: async (fichier, profil) => ({ url, largeurAffichage }),

  largeurPageInitiale: { largeurPx, fraction },
  facteurZoomConfort: 1.5,
})
```
