import { TableMap, columnResizingPluginKey } from '@tiptap/pm/tables';

// Fige la largeur de TOUTES les colonnes du tableau ciblé à leur largeur actuellement rendue (sauf
// celles qui ont déjà une largeur explicite). Sans ce figeage préalable, glisser la bordure d'UNE
// colonne ayant beaucoup de "marge" (ex: une cellule avec du texte long) donne bien la largeur à la
// bonne colonne mais le tableau n'étant pas figé, le navigateur va chercher l'espace manquant en
// rétrécissant une AUTRE colonne flexible (celle qui a le plus de marge, pas forcément la voisine
// directe) — tandis qu'une colonne déjà à son minimum de contenu ne bouge jamais. En figeant toutes
// les colonnes à l'avance, seule celle qu'on glisse reste libre de changer — comportement prévisible
// façon Word/Excel.
//
// Volontairement PAS figé à l'insertion du tableau ni après chaque changement de structure : un
// tableau fraîchement inséré compte sur ses cellules VIDES pour s'étirer naturellement via CSS
// (ex: td:last-child en width:1%) au fur et à mesure que l'utilisateur tape — le figer trop tôt
// aurait bloqué la première colonne à sa largeur quasi nulle. On fige seulement au moment où
// l'utilisateur MONTRE une intention de redimensionner (survol d'une poignée), jamais avant.
//
// Et volontairement PAS figé en réaction au mousedown lui-même : dispatcher la transaction de
// figeage depuis le handler mousedown se produit dans le MÊME cycle d'événement natif que celui que
// la bibliothèque de redimensionnement s'apprête à traiter juste après (capture puis bubble du même
// mousedown) — la toute PREMIÈRE tentative de glissement suivant un tel figeage échoue alors
// silencieusement, un problème de réentrance entre les deux dispatches plutôt qu'un souci de
// ciblage. Figer au SURVOL (une transaction séparée, son propre cycle d'événement, réglée bien avant
// qu'un mousedown n'arrive) évite le problème à la racine.
function figerColonnesDuTableau(ed, table, tableStart) {
    const map = TableMap.get(table);
    let tr = ed.state.tr;
    let modifie = false;

    for (let col = 0; col < map.width; col++) {
        const posRelative = map.map[col];
        // Cellule fusionnée (colspan/rowspan) déjà rencontrée à une colonne précédente : ignorer.
        if (map.map.indexOf(posRelative) !== col) continue;
        const noeud = table.nodeAt(posRelative);
        if (!noeud || (noeud.attrs.colwidth && noeud.attrs.colwidth.some((l) => l))) continue;
        const pos = tableStart + posRelative;
        const dom = ed.view.nodeDOM(pos);
        if (!(dom instanceof HTMLElement) || !dom.offsetWidth) continue;
        const largeurs = new Array(noeud.attrs.colspan).fill(0);
        largeurs[0] = dom.offsetWidth;
        tr = tr.setNodeMarkup(pos, undefined, { ...noeud.attrs, colwidth: largeurs });
        modifie = true;
    }

    if (modifie) ed.view.dispatch(tr);
    return modifie;
}

// Détecte la transition "curseur vient de s'approcher d'une poignée de redimensionnement" (classe
// resize-cursor qui apparaît sur la vue) et fige alors le tableau concerné — une seule fois par
// approche, pas à chaque transaction tant que le curseur reste à proximité.
export function creerDetecteurApprocheRedim() {
    let etaitEnApproche = false;

    return function figerAuSurvolRedimensionnement(ed) {
        const enApproche = ed.view.dom.classList.contains('resize-cursor');
        if (enApproche && !etaitEnApproche) {
            const pluginState = columnResizingPluginKey.getState(ed.state);
            if (pluginState && pluginState.activeHandle > -1) {
                const $cell = ed.state.doc.resolve(pluginState.activeHandle);
                figerColonnesDuTableau(ed, $cell.node(-1), $cell.start(-1));
            }
        }
        etaitEnApproche = enApproche;
    };
}
