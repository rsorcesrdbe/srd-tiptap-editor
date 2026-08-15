import Image from '@tiptap/extension-image';

// TipTap Image de base ne connaît que src/alt/title — on ajoute "width" pour pouvoir poser une
// largeur d'affichage en dur sur la balise <img> à l'insertion (pas de classe CSS : certains
// consommateurs rendent ce HTML via DomPDF, au support CSS limité). addNodeView() donne en plus une
// image sélectionnable et redimensionnable à la souris dans l'éditeur (ProseMirror sélectionne déjà
// nativement les nœuds "atom" comme l'image au clic, mais sans retour visuel ni poignée sans ce node
// view custom).
export const ImageAvecLargeur = Image.extend({
    addAttributes() {
        return {
            ...this.parent(),
            width: {
                default: null,
                renderHTML: (attributs) => (attributs.width ? { width: attributs.width } : {}),
            },
        };
    },
    addNodeView() {
        return ({ node, getPos, editor }) => {
            const enveloppe = document.createElement('span');
            enveloppe.classList.add('tiptap-image-enveloppe');

            const img = document.createElement('img');
            img.src = node.attrs.src;
            if (node.attrs.alt) img.alt = node.attrs.alt;
            if (node.attrs.width) img.style.width = node.attrs.width + 'px';
            enveloppe.append(img);

            const poignee = document.createElement('span');
            poignee.classList.add('tiptap-poignee-redim');
            enveloppe.append(poignee);

            poignee.addEventListener('mousedown', (evenement) => {
                evenement.preventDefault();
                const largeurDepart = img.getBoundingClientRect().width;
                const xDepart = evenement.clientX;

                const surDeplacement = (e) => {
                    const nouvelleLargeur = Math.max(20, Math.round(largeurDepart + (e.clientX - xDepart)));
                    img.style.width = nouvelleLargeur + 'px';
                };
                const surRelachement = () => {
                    document.removeEventListener('mousemove', surDeplacement);
                    document.removeEventListener('mouseup', surRelachement);
                    if (typeof getPos !== 'function') return;
                    const largeurFinale = Math.round(parseFloat(img.style.width));
                    editor.chain().setNodeSelection(getPos()).updateAttributes('image', { width: largeurFinale }).run();
                };
                document.addEventListener('mousemove', surDeplacement);
                document.addEventListener('mouseup', surRelachement);
            });

            return {
                dom: enveloppe,
                update(nouveauNode) {
                    if (nouveauNode.type.name !== 'image') return false;
                    img.src = nouveauNode.attrs.src;
                    if (nouveauNode.attrs.width) img.style.width = nouveauNode.attrs.width + 'px';
                    return true;
                },
                selectNode() { enveloppe.classList.add('est-selectionnee'); },
                deselectNode() { enveloppe.classList.remove('est-selectionnee'); },
            };
        };
    },
});
