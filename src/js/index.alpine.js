import { SrdTipTapEditor } from './core/editeur.js';

// x-load-src de Filament (AsyncAlpine) charge ce fichier via import() dynamique -- jamais
// via une balise <script> classique. Un module ES execute son code au top-level dans SA
// PROPRE portee : un `var X = ...` de premier niveau ne fuite jamais sur `window`, meme
// entoure d'une IIFE. La version precedente exposait la classe via
// `window.SrdTipTapEditor = window.SrdTipTapEditor.default` en pariant sur un chargement
// via <script> classique -- ca ne marche jamais avec import(), d'ou l'erreur reelle
// observee en prod (2026-08-18) : "window.SrdTipTapEditor is not a constructor".
//
// AsyncAlpine lit le nom du composant AVANT le "(" ou le "{" de l'attribut x-data
// (`_parseName`, vendor/filament/support/dist/async-alpine.js), telecharge le module,
// puis appelle `Alpine.data(nomLu, module.default)` -- c'est le mecanisme natif de
// Filament (voir rich-editor.blade.php : x-data="richEditorFormComponent({...})").
// field.blade.php doit donc ecrire x-data="srdTiptapEditor({...})" et cette fonction
// EST cet export par defaut : une factory qui retourne l'objet Alpine, pas la classe brute.
export default function ({ state, statePath }) {
    return {
        state,
        editeur: null,
        init() {
            this.editeur = new SrdTipTapEditor({
                monter: this.$refs.monter,
                barreOutils: this.$refs.barreOutils,
                contenuInitial: this.state || '',
                onChange: (html) => { this.state = html; },
                rubanTableau: this.$refs.rubanTableau,
                telechargerImage: (fichier) => new Promise((resolve, reject) => {
                    this.$wire.upload(
                        `componentFileAttachments.${statePath}`,
                        fichier,
                        () => {
                            this.$wire.getFormComponentFileAttachmentUrl(statePath)
                                .then((url) => resolve({ url }))
                                .catch(reject);
                        },
                        () => reject(new Error('Échec de l\'envoi au serveur')),
                    );
                }),
                controles: {
                    taillepolice: this.$refs.taillepolice,
                    police: this.$refs.police,
                    interligne: this.$refs.interligne,
                    couleurTexte: this.$refs.couleurTexte,
                    couleurSurlignage: this.$refs.couleurSurlignage,
                    boutonSansSurlignage: this.$refs.boutonSansSurlignage,
                    bordures: this.$refs.bordures,
                    grilleTableau: { bouton: this.$refs.grilleBouton, popup: this.$refs.grillePopup },
                },
            });
        },
        destroy() {
            if (this.editeur) this.editeur.detruire();
        },
    };
}
