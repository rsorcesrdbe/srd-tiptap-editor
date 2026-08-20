import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle, FontSize, FontFamily, Color, LineHeight } from '@tiptap/extension-text-style';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import { Table, TableRow, TableHeader } from '@tiptap/extension-table';

import { ImageAvecLargeur } from '../extensions/image-avec-largeur.js';
import { TableCellAvecBordure } from '../extensions/table-cellule-avec-bordure.js';
import { appliquerBordures } from '../tableau/appliquer-bordures.js';
import { creerPositionneurRuban } from '../tableau/ruban-positionnement.js';
import { creerDetecteurApprocheRedim } from '../tableau/figer-colonnes.js';
import { attacherCommandes } from '../toolbar/dispatch-commandes.js';
import { attacherGrilleTableau } from '../toolbar/grille-tableau.js';
import { creerGestionnaireLargeurPage } from '../zoom/largeur-page.js';
import { normaliserConfig } from './config.js';

export class SrdTipTapEditor {
    constructor(config) {
        this.config = normaliserConfig(config);
        this._construireEditeur();
        this._cablerRubanTableau();
        this._cablerCommandes();
        this._cablerControles();
        this._cablerUpload();
        this._cablerLargeurPage();
    }

    // API publique minimale : le reste (mise en forme, tableaux...) passe par la barre d'outils ou
    // les controles cables au montage, pas par des methodes exposees supplementaires.
    get html() {
        return this.editor.getHTML();
    }

    detruire() {
        this.editor.destroy();
    }

    _construireEditeur() {
        const { monter, contenuInitial, onChange } = this.config;

        // TableHeader enregistree meme si jamais utilisee : le schema de TableRow reference
        // "tableHeader" dans son expression de contenu et leve une erreur au montage si le node
        // type est absent. StarterKit v3 embarque deja Underline et Link — ne pas les redeclarer
        // separement (avertissement TipTap "Duplicate extension names found").
        this.editor = new Editor({
            element: monter,
            extensions: [
                StarterKit.configure({ link: { openOnClick: false } }),
                ImageAvecLargeur,
                TextStyle,
                FontSize,
                FontFamily,
                Color,
                LineHeight,
                TextAlign.configure({ types: ['paragraph'] }),
                Highlight.configure({ multicolor: true }),
                Table.configure({ resizable: true }),
                TableRow,
                TableHeader,
                TableCellAvecBordure,
            ],
            content: contenuInitial,
            onUpdate: ({ editor }) => onChange(editor.getHTML()),
            onSelectionUpdate: ({ editor }) => this._surTransaction(editor),
            onTransaction: ({ editor }) => this._surTransaction(editor),
            editorProps: {
                // Colle une image directement depuis le presse-papier (capture d'ecran, copie
                // depuis une autre appli) sans passer par le bouton "Image" -- meme circuit
                // d'upload (telechargerImage), juste declenche autrement. Demande utilisateur
                // (2026-08-20) : "coller des schemas".
                handlePaste: (view, event) => this._gererCollageImage(event),
            },
        });
    }

    _gererCollageImage(event) {
        const { telechargerImage } = this.config;
        if (!telechargerImage || !event.clipboardData) return false;

        const item = Array.from(event.clipboardData.items)
            .find((it) => it.kind === 'file' && it.type.startsWith('image/'));
        const fichier = item?.getAsFile();
        if (!fichier) return false;

        // handlePaste doit repondre de façon synchrone (ProseMirror) ; l'upload lui reste
        // asynchrone, lance ici sans attendre, l'insertion arrive quand il aboutit.
        event.preventDefault();
        telechargerImage(fichier, 'standard')
            .then(({ url, largeurAffichage }) => {
                this.editor.chain().focus().setImage({ src: url, width: largeurAffichage }).run();
            })
            .catch((erreur) => {
                window.alert("Échec de l'envoi de l'image : " + erreur.message);
            });

        return true;
    }

    _surTransaction(editor) {
        this._synchroniserControles(editor);
        if (this._repositionnerRuban) this._repositionnerRuban(editor);
        if (this._figerAuSurvolRedimensionnement) this._figerAuSurvolRedimensionnement(editor);
    }

    _cablerRubanTableau() {
        const { rubanTableau, zonePage } = this.config;
        if (!rubanTableau) return;
        this._repositionnerRuban = creerPositionneurRuban(rubanTableau, zonePage);
        this._figerAuSurvolRedimensionnement = creerDetecteurApprocheRedim();

        const { bordures } = this.config.controles;
        if (bordures) {
            bordures.addEventListener('change', () => {
                const valeur = bordures.value;
                bordures.value = '';
                if (!valeur) return;
                const cotesParValeur = { top: ['top'], bottom: ['bottom'], left: ['left'], right: ['right'] };
                appliquerBordures(this.editor, cotesParValeur[valeur] || valeur);
            });
        }
    }

    _cablerCommandes() {
        attacherCommandes(this.config.barreOutils, this.editor);
        attacherCommandes(this.config.rubanTableau, this.editor);

        const { grilleTableau } = this.config.controles;
        if (grilleTableau) {
            attacherGrilleTableau(grilleTableau.bouton, grilleTableau.popup, this.editor);
        }
    }

    _cablerControles() {
        const { taillepolice, police, interligne, couleurTexte, couleurSurlignage, boutonSansSurlignage } = this.config.controles;

        if (taillepolice) {
            taillepolice.addEventListener('change', () => {
                const valeur = taillepolice.value;
                if (valeur === '') this.editor.chain().focus().unsetFontSize().run();
                else this.editor.chain().focus().setFontSize(valeur + 'pt').run();
            });
        }
        if (police) {
            police.addEventListener('change', () => {
                const valeur = police.value;
                if (valeur === '') this.editor.chain().focus().unsetFontFamily().run();
                else this.editor.chain().focus().setFontFamily(valeur).run();
            });
        }
        if (interligne) {
            interligne.addEventListener('change', () => {
                const valeur = interligne.value;
                if (valeur === '') this.editor.chain().focus().unsetLineHeight().run();
                else this.editor.chain().focus().setLineHeight(valeur).run();
            });
        }
        if (couleurTexte) {
            couleurTexte.addEventListener('input', () => {
                this.editor.chain().focus().setColor(couleurTexte.value).run();
            });
        }
        if (couleurSurlignage) {
            couleurSurlignage.addEventListener('input', () => {
                this.editor.chain().focus().setHighlight({ color: couleurSurlignage.value }).run();
            });
        }
        if (boutonSansSurlignage) {
            boutonSansSurlignage.addEventListener('click', () => {
                this.editor.chain().focus().unsetHighlight().run();
            });
        }
    }

    _synchroniserControles(editor) {
        const { taillepolice } = this.config.controles;
        if (taillepolice) {
            const tailleActuelle = editor.getAttributes('textStyle').fontSize;
            taillepolice.value = tailleActuelle ? tailleActuelle.replace('pt', '') : '';
        }
    }

    _cablerUpload() {
        const { barreOutils, telechargerImage } = this.config;
        if (!barreOutils || !telechargerImage) return;

        // Insertion d'image : selection fichier -> upload (delegue entierement au consommateur via
        // telechargerImage, le coeur ne connait ni URL ni jeton CSRF ni contrat serveur) -> insertion
        // a la position du curseur avec la largeur d'affichage renvoyee.
        barreOutils.querySelectorAll('[data-profil-image]').forEach((bouton) => {
            bouton.addEventListener('click', () => {
                const profil = bouton.dataset.profilImage;
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = async () => {
                    const fichier = input.files[0];
                    if (!fichier) return;
                    try {
                        const { url, largeurAffichage } = await telechargerImage(fichier, profil);
                        this.editor.chain().focus().setImage({ src: url, width: largeurAffichage }).run();
                    } catch (erreur) {
                        window.alert("Échec de l'envoi de l'image : " + erreur.message);
                    }
                };
                input.click();
            });
        });
    }

    _cablerLargeurPage() {
        const { zonePage, largeurPageInitiale, facteurZoomConfort, controles } = this.config;
        const gestionnaire = creerGestionnaireLargeurPage({
            conteneurEditeur: this.config.monter,
            zonePage,
            facteurZoomConfort,
        });

        if (largeurPageInitiale) {
            gestionnaire.appliquerLargeurCible(largeurPageInitiale.largeurPx, largeurPageInitiale.fraction ?? 1);
        }

        if (controles.zoom) {
            controles.zoom.addEventListener('change', () => gestionnaire.appliquerZoom(controles.zoom.value));
            gestionnaire.appliquerZoom(controles.zoom.value);
        }

        this._gestionnaireLargeurPage = gestionnaire;
    }
}
