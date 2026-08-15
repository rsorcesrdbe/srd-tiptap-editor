// Normalise la configuration passee au constructeur : aucune option n'est jamais lue directement
// depuis un ID DOM en dur ni depuis un global window.* — tout transite par cet objet, fourni par le
// consommateur (Blade RAPSRD, vue Filament, ou autre a l'avenir).
export function normaliserConfig(config) {
    if (!config || !config.monter) {
        throw new Error('SrdTipTapEditor : "monter" (element de montage) est requis.');
    }
    if (typeof config.onChange !== 'function') {
        throw new Error('SrdTipTapEditor : "onChange" est requis.');
    }

    return {
        monter: config.monter,
        contenuInitial: config.contenuInitial || '',
        onChange: config.onChange,
        barreOutils: config.barreOutils || null,
        rubanTableau: config.rubanTableau || null,
        zonePage: config.zonePage || config.monter.parentElement,
        controles: config.controles || {},
        telechargerImage: config.telechargerImage || null,
        largeurPageInitiale: config.largeurPageInitiale || null,
        facteurZoomConfort: config.facteurZoomConfort ?? 1.5,
    };
}
