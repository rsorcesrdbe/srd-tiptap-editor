@php
    use Filament\Support\Facades\FilamentAsset;

    $statePath = $getStatePath();
    $avecImages = $getAvecImages();
@endphp

<x-dynamic-component :component="$getFieldWrapperView()" :field="$field">
    <div
        x-load
        x-load-src="{{ FilamentAsset::getAlpineComponentSrc('srd-tiptap-editor', 'srd/tiptap-editor') }}"
        x-data="srdTiptapEditor({
            state: $wire.{{ $applyStateBindingModifiers("\$entangle('{$statePath}')", isOptimisticallyLive: false) }},
            statePath: @js($statePath),
        })"
        wire:ignore
    >
        <div x-ref="barreOutils" class="srd-tiptap-barre">
            <div class="srd-tiptap-barre-ligne">
                <select x-ref="police" title="Police du texte sélectionné">
                    <option value="">Police…</option>
                    @foreach (['Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana'] as $police)
                        <option value="{{ $police }}">{{ $police }}</option>
                    @endforeach
                </select>
                <select x-ref="taillepolice" title="Taille du texte sélectionné">
                    <option value="">Taille…</option>
                    @foreach ([8, 9, 10, 11, 12, 14, 16, 18, 20, 24] as $taille)
                        <option value="{{ $taille }}" @selected($taille === 11)>{{ $taille }} pt</option>
                    @endforeach
                </select>
                <button type="button" data-commande="gras"><strong>G</strong></button>
                <button type="button" data-commande="italique"><em>I</em></button>
                <button type="button" data-commande="souligne"><u>S</u></button>
                <button type="button" data-commande="barre" title="Barré"><s>S</s></button>
                <span class="srd-tiptap-couleur-conteneur" title="Couleur du texte">
                    <span class="srd-tiptap-couleur-etiquette">A</span>
                    <input type="color" x-ref="couleurTexte" value="#000000">
                </span>
                <span class="srd-tiptap-couleur-conteneur" title="Couleur de surlignage">
                    <span class="srd-tiptap-couleur-etiquette">🖊</span>
                    <input type="color" x-ref="couleurSurlignage" value="#ffff00">
                </span>
                <button type="button" x-ref="boutonSansSurlignage" title="Retirer le surlignage">×surlign.</button>
                <button type="button" data-commande="aligner-gauche" title="Aligner à gauche">⯇</button>
                <button type="button" data-commande="aligner-centre" title="Centrer">☰</button>
                <button type="button" data-commande="aligner-droite" title="Aligner à droite">⯈</button>
                <button type="button" data-commande="aligner-justifie" title="Justifier">☰</button>
                <button type="button" data-commande="liste-puces">Liste à puces</button>
                <button type="button" data-commande="liste-numerotee">Liste numérotée</button>
                <button type="button" data-commande="lien">Lien</button>
                <details class="srd-tiptap-plus">
                    <summary title="Plus d'options">…</summary>
                    <div class="srd-tiptap-barre-ligne srd-tiptap-plus-contenu">
                        <select x-ref="interligne" title="Interligne">
                            <option value="">Interligne…</option>
                            @foreach (['1' => '1', '1.15' => '1,15', '1.5' => '1,5', '2' => '2'] as $valeur => $etiquette)
                                <option value="{{ $valeur }}">{{ $etiquette }}</option>
                            @endforeach
                        </select>
                        <button type="button" data-commande="reduire-retrait" title="Réduire le retrait (liste)">⇤</button>
                        <button type="button" data-commande="augmenter-retrait" title="Augmenter le retrait (liste)">⇥</button>
                        <div class="grille-tableau-conteneur">
                            <button type="button" x-ref="grilleBouton">Bloc colonnes ▾</button>
                            <div x-ref="grillePopup" class="grille-tableau-popup" hidden>
                                <div class="grille-tableau-etiquette">Tableau</div>
                                <div class="grille-tableau-cellules">
                                    @for ($ligne = 0; $ligne < 6; $ligne++)
                                        @for ($col = 0; $col < 8; $col++)
                                            <span class="grille-tableau-cellule" data-ligne="{{ $ligne }}" data-col="{{ $col }}"></span>
                                        @endfor
                                    @endfor
                                </div>
                            </div>
                        </div>
                        <button type="button" data-commande="tracer-ligne">Trait horizontal</button>
                        @if ($avecImages)
                            <button type="button" data-profil-image="standard">Image</button>
                        @endif
                    </div>
                </details>
            </div>
        </div>

        <div class="srd-tiptap-zone-page">
            <div x-ref="rubanTableau" class="srd-tiptap-ruban-tableau" hidden>
                <button type="button" data-commande="ajouter-ligne" title="Ajouter une ligne">+Ligne</button>
                <button type="button" data-commande="supprimer-ligne" title="Supprimer la ligne">−Ligne</button>
                <button type="button" data-commande="ajouter-colonne" title="Ajouter une colonne">+Col.</button>
                <button type="button" data-commande="supprimer-colonne" title="Supprimer la colonne">−Col.</button>
                <button type="button" data-commande="fusionner-cellules" title="Fusionner les cellules sélectionnées">Fusionner</button>
                <button type="button" data-commande="scinder-cellule" title="Scinder la cellule">Scinder</button>
                <select x-ref="bordures" title="Bordures de la/les cellule(s) sélectionnée(s)">
                    <option value="">Bordures…</option>
                    <option value="toutes">Toutes les bordures</option>
                    <option value="aucune">Aucune bordure</option>
                    <option value="exterieures">Bordures extérieures</option>
                    <option value="interieures">Bordures intérieures</option>
                    <option value="top">Bordure supérieure</option>
                    <option value="bottom">Bordure inférieure</option>
                    <option value="left">Bordure gauche</option>
                    <option value="right">Bordure droite</option>
                </select>
            </div>
            <div x-ref="monter" class="srd-tiptap-editeur"></div>
        </div>
    </div>
</x-dynamic-component>
