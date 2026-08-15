<?php

namespace Srd\TiptapEditor\Filament;

use Filament\Forms\Components\Field;

// Champ Filament pour srd-tiptap-editor. L'upload d'image n'est pas cable dans cette premiere
// version (le coeur JS le supporte via un callback "telechargerImage" injectable, mais le brancher
// proprement sur l'upload de fichiers Livewire est un chantier a part — hors perimetre du besoin
// initial, qui porte sur la mise en forme du texte, pas l'insertion d'images). Le bouton d'image
// n'apparait donc pas dans la barre d'outils fournie par ce champ.
class TiptapEditor extends Field
{
    protected string $view = 'srd-tiptap-editor::filament.field';
}
