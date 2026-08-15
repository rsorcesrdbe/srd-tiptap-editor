import { selectedRect } from '@tiptap/pm/tables';

// Applique/retire des bordures sur la sélection courante — "cotes" est soit un tableau de côtés
// littéraux ('top'/'bottom'/'left'/'right'), soit 'aucune'/'toutes'/'exterieures'/'interieures'.
// Bord "extérieur" = périmètre de la sélection, "intérieur" = entre deux cellules sélectionnées —
// calculé via la grille réelle du tableau (TableMap, par selectedRect), pas une estimation DOM.
export function appliquerBordures(editeur, cotes) {
    const { state } = editeur;
    const rect = (() => {
        try {
            return selectedRect(state);
        } catch (e) {
            return null;
        }
    })();
    if (!rect) return;

    // TableMap.map contient des positions RELATIVES au début du contenu du tableau (tableStart),
    // pas des positions absolues dans le document — oubli initial qui faisait échouer silencieusement
    // tr.setNodeMarkup (nodeAt tombait sur un tout autre nœud, souvent aucun).
    const { map, left, right, top, bottom, tableStart } = rect;
    let tr = state.tr;

    for (let ligne = top; ligne < bottom; ligne++) {
        for (let col = left; col < right; col++) {
            const posRelative = map.map[ligne * map.width + col];
            // Une cellule avec colspan/rowspan apparaît plusieurs fois dans la grille — ne la
            // traiter qu'une fois (à sa position d'origine, première rencontre).
            if (map.map.indexOf(posRelative) !== ligne * map.width + col) continue;
            const pos = tableStart + posRelative;

            const estHaut = ligne === top;
            const estBas = ligne === bottom - 1;
            const estGauche = col === left;
            const estDroite = col === right - 1;

            const node = state.doc.nodeAt(pos);
            if (!node) continue;
            const attrs = { ...node.attrs };

            if (cotes === 'aucune') {
                attrs.bordureTop = false;
                attrs.bordureBottom = false;
                attrs.bordureLeft = false;
                attrs.bordureRight = false;
            } else if (cotes === 'toutes') {
                attrs.bordureTop = true;
                attrs.bordureBottom = true;
                attrs.bordureLeft = true;
                attrs.bordureRight = true;
            } else if (cotes === 'exterieures') {
                if (estHaut) attrs.bordureTop = true;
                if (estBas) attrs.bordureBottom = true;
                if (estGauche) attrs.bordureLeft = true;
                if (estDroite) attrs.bordureRight = true;
            } else if (cotes === 'interieures') {
                if (!estHaut) attrs.bordureTop = true;
                if (!estBas) attrs.bordureBottom = true;
                if (!estGauche) attrs.bordureLeft = true;
                if (!estDroite) attrs.bordureRight = true;
            } else if (Array.isArray(cotes)) {
                // Bouton "un seul côté" (ex: Bordure inférieure) : s'applique au bord de la
                // sélection dans son ensemble, comme Word — pas à chaque cellule individuellement.
                if (cotes.includes('top') && estHaut) attrs.bordureTop = true;
                if (cotes.includes('bottom') && estBas) attrs.bordureBottom = true;
                if (cotes.includes('left') && estGauche) attrs.bordureLeft = true;
                if (cotes.includes('right') && estDroite) attrs.bordureRight = true;
            }

            tr = tr.setNodeMarkup(pos, undefined, attrs);
        }
    }

    editeur.view.dispatch(tr);
}
