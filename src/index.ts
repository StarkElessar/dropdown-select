import { MultiSelect } from './dropdown-select';

document.addEventListener('DOMContentLoaded', () => {
    const select = document.getElementById('demo-select');

    if (select instanceof HTMLSelectElement) {
        // Базовое использование
        const multiSelect = new MultiSelect(select);

        // Добавляем обработчики событий
        multiSelect.bind('change', (data) => {
            console.log('Values changed:', data.selectedValues);
        });
    }
});