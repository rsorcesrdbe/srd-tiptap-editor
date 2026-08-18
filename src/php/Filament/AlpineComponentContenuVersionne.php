<?php

namespace Srd\TiptapEditor\Filament;

use Filament\Support\Assets\AlpineComponent;

// Meme raison que CssContenuVersionne : la version Composer "@dev" ne bouge
// jamais, donc le cache-busting Filament standard ne fonctionne pas pour ce
// package installe en branche.
class AlpineComponentContenuVersionne extends AlpineComponent
{
    public function getVersion(): string
    {
        $chemin = $this->getPublicPath();

        return is_file($chemin) ? substr(md5_file($chemin), 0, 12) : parent::getVersion();
    }
}
