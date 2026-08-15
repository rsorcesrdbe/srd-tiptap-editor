<?php

namespace Srd\TiptapEditor;

use Filament\Support\Assets\AlpineComponent;
use Filament\Support\Assets\Css;
use Filament\Support\Facades\FilamentAsset;
use Illuminate\Support\ServiceProvider;

class SrdTiptapEditorServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $this->loadViewsFrom(__DIR__.'/../../resources/views', 'srd-tiptap-editor');

        FilamentAsset::register([
            AlpineComponent::make('srd-tiptap-editor', __DIR__.'/../../dist/editeur.iife.js'),
            Css::make('srd-tiptap-editor', __DIR__.'/../../dist/editeur.css'),
        ], package: 'srd/tiptap-editor');
    }
}
