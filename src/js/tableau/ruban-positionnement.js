// Ruban contextuel façon TinyMCE : n'apparaît que quand le curseur est dans un tableau, juste
// au-dessus de celui-ci — positionné en absolute par rapport au conteneur (son ancêtre positionné le
// plus proche), coordonnées calculées à partir du <table> DOM réellement sous le curseur (pas une
// estimation, via closest('table') depuis la sélection navigateur réelle).
//
// Le conteneur porte potentiellement un zoom CSS : sous zoom, getBoundingClientRect() (espace
// "écran", déjà multiplié par le zoom) et offsetHeight/offsetTop (espace "local", pas multiplié) ne
// sont PAS dans le même référentiel — les mélanger décale le ruban d'exactement le facteur de zoom.
// Calcul entièrement en espace local (offsetTop/offsetLeft en remontant la chaîne offsetParent) pour
// rester cohérent quel que soit le niveau de zoom choisi par le consommateur.
export function creerPositionneurRuban(ruban, conteneur) {
    let tableAncree = null;
    const observeurTaille = new ResizeObserver(() => {
        if (tableAncree) placer(tableAncree);
    });

    function offsetRelatifA(element, ancetre) {
        let top = 0;
        let left = 0;
        let noeud = element;
        while (noeud && noeud !== ancetre) {
            top += noeud.offsetTop;
            left += noeud.offsetLeft;
            noeud = noeud.offsetParent;
        }
        return { top, left };
    }

    function placer(table) {
        if (!ruban || !conteneur) return;
        const position = offsetRelatifA(table, conteneur);
        ruban.style.left = Math.max(0, position.left) + 'px';
        ruban.style.top = (position.top - ruban.offsetHeight - 4) + 'px';
    }

    function cacher() {
        if (!ruban.hidden) {
            ruban.hidden = true;
            observeurTaille.unobserve(ruban);
        }
        tableAncree = null;
    }

    return function repositionner(editeur) {
        if (!ruban) return;

        if (!editeur.isActive('table')) {
            cacher();
            return;
        }

        const selectionNavigateur = window.getSelection();
        let noeud = selectionNavigateur && selectionNavigateur.rangeCount > 0 ? selectionNavigateur.getRangeAt(0).startContainer : null;
        if (noeud && noeud.nodeType === Node.TEXT_NODE) noeud = noeud.parentElement;
        const table = noeud instanceof Element ? noeud.closest('table') : null;
        if (!table) {
            cacher();
            return;
        }

        const vientDapparaitre = ruban.hidden;
        ruban.hidden = false;
        tableAncree = table;
        placer(table);
        if (vientDapparaitre) observeurTaille.observe(ruban);
    };
}
