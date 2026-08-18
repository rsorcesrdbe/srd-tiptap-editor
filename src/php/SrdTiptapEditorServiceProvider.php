<?php

namespace Srd\TiptapEditor;

use Filament\Support\Facades\FilamentAsset;
use Illuminate\Support\ServiceProvider;
use Srd\TiptapEditor\Filament\AlpineComponentContenuVersionne;
use Srd\TiptapEditor\Filament\CssContenuVersionne;

class SrdTiptapEditorServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $this->loadViewsFrom(__DIR__.'/../../resources/views', 'srd-tiptap-editor');

        FilamentAsset::register([
            AlpineComponentContenuVersionne::make('srd-tiptap-editor', __DIR__.'/../../dist/editeur.alpine.js'),
            CssContenuVersionne::make('srd-tiptap-editor', __DIR__.'/../../dist/editeur.css'),
        ], package: 'srd/tiptap-editor');
    }
}
