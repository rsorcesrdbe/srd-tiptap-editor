<?php

namespace Srd\TiptapEditor\Filament;

use Filament\Support\Assets\Css;

// Filament calcule le "?v=" du cache-busting via la version Composer du
// package (Asset::getVersion() -> InstalledVersions::getVersion()). Pour un
// require "@dev" (branche dev-main), cette version est LITTERALEMENT la
// chaine "dev-main" en toute circonstance -- elle ne change jamais d'un
// commit a l'autre. Consequence reelle observee (2026-08-18) : apres chaque
// composer update + deploy, le navigateur et le cache Cloudflare continuent
// de servir l'ancien fichier indefiniment, meme apres un hard refresh selon
// les cas (le cache CDN, lui, n'ecoute pas Ctrl+F5). On remplace donc la
// version par un hash du contenu du fichier reellement publie : elle change
// automatiquement des que le fichier change, quel que soit l'etat Composer.
class CssContenuVersionne extends Css
{
    public function getVersion(): string
    {
        $chemin = $this->getPublicPath();

        return is_file($chemin) ? substr(md5_file($chemin), 0, 12) : parent::getVersion();
    }
}
