// Grille de sélection de tableau façon Word (survoler pour choisir lignes x colonnes, cliquer pour
// insérer). Le markup (bouton + popup + cellules avec data-ligne/data-col) est fourni par le
// consommateur (ex: une vue Blade) — cette fonction se contente de câbler le comportement, elle ne
// génère aucun DOM elle-même (même philosophie que le reste du package : pas d'ID en dur, pas de
// génération de markup imposée).
export function attacherGrilleTableau(bouton, popup, editeur) {
    if (!bouton || !popup) return;

    const etiquette = popup.querySelector('.grille-tableau-etiquette');
    const cellules = Array.from(popup.querySelectorAll('.grille-tableau-cellule'));

    function surSurvol(ligneMax, colMax) {
        cellules.forEach((cel) => {
            const estDansLaSelection = Number(cel.dataset.ligne) <= ligneMax && Number(cel.dataset.col) <= colMax;
            cel.classList.toggle('survolee', estDansLaSelection);
        });
        if (etiquette) etiquette.textContent = 'Tableau ' + (colMax + 1) + ' x ' + (ligneMax + 1);
    }

    function fermerPopup() {
        popup.hidden = true;
    }

    cellules.forEach((cel) => {
        cel.addEventListener('mouseenter', () => surSurvol(Number(cel.dataset.ligne), Number(cel.dataset.col)));
        cel.addEventListener('click', () => {
            const cols = Number(cel.dataset.col) + 1;
            const rows = Number(cel.dataset.ligne) + 1;
            editeur.chain().focus().insertTable({ rows, cols, withHeaderRow: false }).run();
            fermerPopup();
        });
    });

    bouton.addEventListener('click', (evenement) => {
        evenement.stopPropagation();
        if (popup.hidden) {
            popup.hidden = false;
            surSurvol(0, 0);
        } else {
            fermerPopup();
        }
    });
    document.addEventListener('click', (evenement) => {
        if (!popup.hidden && evenement.target !== bouton && !popup.contains(evenement.target)) fermerPopup();
    });
}
