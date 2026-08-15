// Barre d'outils construite à la main (TipTap est "headless", aucun ruban fourni). Scope volontaire
// à "barreOutils" (et pas document) : un ruban contextuel externe (ex: ruban tableau) peut réutiliser
// les mêmes [data-commande] en étant scopé séparément par son propre appel à cette fonction.
export function attacherCommandes(barreOutils, editeur) {
    if (!barreOutils) return;

    barreOutils.querySelectorAll('[data-commande]').forEach((bouton) => {
        bouton.addEventListener('click', () => {
            const chain = editeur.chain().focus();
            switch (bouton.dataset.commande) {
                case 'gras': chain.toggleBold().run(); break;
                case 'italique': chain.toggleItalic().run(); break;
                case 'souligne': chain.toggleUnderline().run(); break;
                case 'barre': chain.toggleStrike().run(); break;
                case 'aligner-gauche': chain.setTextAlign('left').run(); break;
                case 'aligner-centre': chain.setTextAlign('center').run(); break;
                case 'aligner-droite': chain.setTextAlign('right').run(); break;
                case 'aligner-justifie': chain.setTextAlign('justify').run(); break;
                case 'liste-puces': chain.toggleBulletList().run(); break;
                case 'liste-numerotee': chain.toggleOrderedList().run(); break;
                // Retrait de liste (sinkListItem/liftListItem, fournies par le ListItem de
                // StarterKit) : imbrique/désimbrique l'élément de liste courant — sans effet hors
                // liste, comme Word quand on utilise Tab/Maj+Tab hors contexte de liste.
                case 'augmenter-retrait': chain.sinkListItem('listItem').run(); break;
                case 'reduire-retrait': chain.liftListItem('listItem').run(); break;
                // Insertion/suppression de ligne/colonne — sans effet (silencieux) si le curseur
                // n'est pas dans un tableau, commandes natives fournies par @tiptap/extension-table.
                case 'ajouter-ligne': chain.addRowAfter().run(); break;
                case 'supprimer-ligne': chain.deleteRow().run(); break;
                case 'ajouter-colonne': chain.addColumnAfter().run(); break;
                case 'supprimer-colonne': chain.deleteColumn().run(); break;
                // Fusionne les cellules de la sélection courante (glisser sur plusieurs cellules au
                // préalable) / scinde une cellule précédemment fusionnée — sans effet si la
                // sélection ne s'y prête pas (mergeCells/splitCell renvoient false silencieusement).
                case 'fusionner-cellules': chain.mergeCells().run(); break;
                case 'scinder-cellule': chain.splitCell().run(); break;
                // Ligne horizontale (StarterKit fournit déjà HorizontalRule) — toujours collée sans
                // marge avant/après (cf. CSS), même logique "aucun espace automatique" que les
                // tableaux/paragraphes.
                case 'tracer-ligne': chain.setHorizontalRule().run(); break;
                case 'lien': {
                    const url = window.prompt('URL du lien :', editeur.getAttributes('link').href || 'https://');
                    if (url === null) return;
                    if (url === '') { chain.unsetLink().run(); return; }
                    chain.setLink({ href: url }).run();
                    break;
                }
                default: break;
            }
        });
    });
}
