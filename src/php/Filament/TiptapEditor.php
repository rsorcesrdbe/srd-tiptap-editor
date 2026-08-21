<?php

namespace Srd\TiptapEditor\Filament;

use Filament\Forms\Components\Concerns\HasFileAttachments;
use Filament\Forms\Components\Contracts\HasFileAttachments as HasFileAttachmentsContract;
use Filament\Forms\Components\Field;
use Illuminate\Support\Str;
use Livewire\Features\SupportFileUploads\TemporaryUploadedFile;

// Champ Filament pour srd-tiptap-editor. Implemente HasFileAttachments (meme mecanisme generique
// que le RichEditor natif de Filament, base sur componentFileAttachments) pour que l'upload d'image
// passe la verification de securite RestrictsFileUploadsToFormComponents, quel que soit le
// composant Livewire (RelationManager, page...) qui heberge le formulaire.
class TiptapEditor extends Field implements HasFileAttachmentsContract
{
    use HasFileAttachments;

    protected string $view = 'srd-tiptap-editor::filament.field';

    protected int $largeurImageParDefaut = 800;

    // Actif par defaut (retro-compatible avec les usages existants, ex.
    // entree_journals) : desactivable par field pour un contexte ou l'upload
    // d'image n'a pas de sens (ex. une reponse courte de developpeur).
    protected bool $avecImages = true;

    protected function setUp(): void
    {
        parent::setUp();

        $this->fileAttachmentsDirectory('srd-tiptap-editor');
        $this->fileAttachmentsVisibility('public');

        $this->saveUploadedFileAttachmentsUsing(fn (TemporaryUploadedFile $file) => $this->redimensionnerEtStocker($file));
    }

    public function largeurImageParDefaut(int $largeur): static
    {
        $this->largeurImageParDefaut = $largeur;

        return $this;
    }

    public function getLargeurImageParDefaut(): int
    {
        return $this->largeurImageParDefaut;
    }

    public function avecImages(bool $avecImages = true): static
    {
        $this->avecImages = $avecImages;

        return $this;
    }

    public function getAvecImages(): bool
    {
        return $this->avecImages;
    }

    // GD (extension PHP standard, pas de dependance Composer supplementaire) : redimensionne a la
    // largeur configuree si l'image est plus large, reencode en JPEG. Si le fichier n'est pas une
    // image que GD sait decoder, retombe sur les octets bruts du fichier envoye plutot que
    // d'echouer l'upload. Publique et separee du stockage (ci-dessous) : une appli consommatrice
    // dont le disque n'est pas persistant (ex. Laravel Cloud, disque efface a chaque deploiement)
    // a besoin des octets pour les stocker elle-meme (ex. bytea Postgres) sans jamais toucher un
    // disque fichier — voir saveUploadedFileAttachmentsUsing() cote application.
    public function redimensionnerImage(TemporaryUploadedFile $file): string
    {
        $source = @imagecreatefromstring(file_get_contents($file->getRealPath()));

        if ($source === false) {
            return file_get_contents($file->getRealPath());
        }

        $largeurOrigine = imagesx($source);
        $hauteurOrigine = imagesy($source);
        $largeurMax = $this->getLargeurImageParDefaut();

        if ($largeurOrigine > $largeurMax) {
            $ratio = $largeurMax / $largeurOrigine;
            $nouvelleLargeur = $largeurMax;
            $nouvelleHauteur = max(1, (int) round($hauteurOrigine * $ratio));

            $destination = imagecreatetruecolor($nouvelleLargeur, $nouvelleHauteur);
            imagecopyresampled($destination, $source, 0, 0, 0, 0, $nouvelleLargeur, $nouvelleHauteur, $largeurOrigine, $hauteurOrigine);
            imagedestroy($source);
            $source = $destination;
        }

        ob_start();
        imagejpeg($source, quality: 82);
        $contenu = ob_get_clean();
        imagedestroy($source);

        return $contenu;
    }

    // Stockage par defaut (disque Filament standard) : conserve pour une appli consommatrice dont
    // le disque est reellement persistant. Sur un disque ephemere, l'application doit remplacer ce
    // comportement via ->saveUploadedFileAttachmentsUsing()/->getUploadedAttachmentUrlUsing() en
    // s'appuyant sur redimensionnerImage() ci-dessus (voir SRDPROJETS, StockageBinaire + bytea).
    protected function redimensionnerEtStocker(TemporaryUploadedFile $file): string
    {
        $contenu = $this->redimensionnerImage($file);

        $chemin = trim($this->getFileAttachmentsDirectory().'/'.Str::uuid().'.jpg', '/');
        $this->getFileAttachmentsDisk()->put($chemin, $contenu, $this->getFileAttachmentsVisibility());

        return $chemin;
    }
}
