import { MultiSelect } from './dropdown-select';

document.addEventListener('DOMContentLoaded', () => {
    const select = document.getElementById('demo-select');

    if (select instanceof HTMLSelectElement) {
        // Базовое использование
        const multiSelect = new MultiSelect(select);

        // Или с кастомными классами и текстами
        const customMultiSelect = new MultiSelect(select, {
            wrapperClassName: 'custom-select',
            buttonClassName: 'custom-select__button',
            dropdownClassName: 'custom-select__dropdown',
            listClassName: 'custom-select__list',
            optionClassName: 'custom-select__option',
            texts: {
                placeholder: 'Select options',
                allSelected: 'All selected',
                selectedCount: 'Selected:',
                allOptionText: 'All items'
            }
        });

        // Добавляем обработчики событий
        multiSelect.bind('change', (data) => {
            console.log('Values changed:', data.selectedValues);
        });
    }
});