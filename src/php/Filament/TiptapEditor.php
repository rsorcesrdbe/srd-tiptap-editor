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
    // image que GD sait decoder, on retombe sur le stockage brut plutot que d'echouer l'upload.
    protected function redimensionnerEtStocker(TemporaryUploadedFile $file): string
    {
        $source = @imagecreatefromstring(file_get_contents($file->getRealPath()));

        if ($source === false) {
            return $this->handleFileAttachmentUpload($file);
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

        $chemin = trim($this->getFileAttachmentsDirectory().'/'.Str::uuid().'.jpg', '/');
        $this->getFileAttachmentsDisk()->put($chemin, $contenu, $this->getFileAttachmentsVisibility());

        return $chemin;
    }
}
