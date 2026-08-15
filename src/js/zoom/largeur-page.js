// Canevas à largeur réelle d'impression + zoom façon Word : le zoom est purement visuel (CSS zoom
// sur le conteneur), la largeur logique du contenu ne change jamais — c'est ce qui garde la
// correspondance de reflow entre l'éditeur et un éventuel rendu PDF côté consommateur.
//
// Facteur appliqué en plus de la valeur de zoom choisie par l'utilisateur : à largeur réelle égale,
// un rendu à "100%" peut paraître trop petit comparé à un traitement de texte — plutôt que de
// changer la largeur réelle (qui casserait la correspondance de reflow avec un PDF), on multiplie
// uniquement le zoom visuel appliqué. 1.5 est la valeur d'origine retenue dans RAPSRD après retour
// utilisateur ("je voulais 100% qui soit comme le 150%"), surchargeable par le consommateur.
export function creerGestionnaireLargeurPage({ conteneurEditeur, zonePage, facteurZoomConfort = 1.5 }) {
    function appliquerLargeurCible(largeurPagePx, fraction) {
        if (!conteneurEditeur) return;
        conteneurEditeur.style.width = Math.round(fraction * largeurPagePx) + 'px';
    }

    function appliquerZoom(valeur) {
        if (!zonePage) return;
        zonePage.style.zoom = valeur * facteurZoomConfort;
    }

    return { appliquerLargeurCible, appliquerZoom };
}
