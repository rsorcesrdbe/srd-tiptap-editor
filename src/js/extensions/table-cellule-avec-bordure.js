import { TableCell } from '@tiptap/extension-table';

// Bordures par côté façon Word (menu "Bordures" du ruban tableau) : quatre attributs booléens
// plutôt qu'un "style" brut — chacun se rend en style="border-xxx:..." indépendamment, et TipTap
// fusionne proprement plusieurs déclarations style de plusieurs attributs sur le même nœud
// (mergeAttributes fait un vrai merge par propriété CSS, pas un écrasement).
export const TRAIT_BORDURE = '1px solid #000000';

export const TableCellAvecBordure = TableCell.extend({
    addAttributes() {
        return {
            ...this.parent(),
            bordureTop: {
                default: false,
                parseHTML: (element) => !!element.style.borderTop,
                renderHTML: (attributs) => (attributs.bordureTop ? { style: `border-top:${TRAIT_BORDURE}` } : {}),
            },
            bordureBottom: {
                default: false,
                parseHTML: (element) => !!element.style.borderBottom,
                renderHTML: (attributs) => (attributs.bordureBottom ? { style: `border-bottom:${TRAIT_BORDURE}` } : {}),
            },
            bordureLeft: {
                default: false,
                parseHTML: (element) => !!element.style.borderLeft,
                renderHTML: (attributs) => (attributs.bordureLeft ? { style: `border-left:${TRAIT_BORDURE}` } : {}),
            },
            bordureRight: {
                default: false,
                parseHTML: (element) => !!element.style.borderRight,
                renderHTML: (attributs) => (attributs.bordureRight ? { style: `border-right:${TRAIT_BORDURE}` } : {}),
            },
        };
    },
});
