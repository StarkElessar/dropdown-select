import { MultiSelect, type IMultiSelect } from './dropdown-select';

document.addEventListener('DOMContentLoaded', () => {
    const select = document.getElementById('demo-select');

    if (select instanceof HTMLSelectElement) {
        const multiSelect: IMultiSelect = new MultiSelect(select);

        // Подписка на события
        multiSelect.bind('stateChange', (data) => {
            console.log('Component state changed:', data);
        });

        // Пример использования enable/disable
        const toggleButton = document.getElementById('toggle-button');
        if (toggleButton) {
            toggleButton.addEventListener('click', () => {
                const isEnabled = toggleButton.getAttribute('data-enabled') === 'true';
                multiSelect.enable(!isEnabled);
                toggleButton.setAttribute('data-enabled', String(!isEnabled));
                toggleButton.textContent = isEnabled ? 'Enable' : 'Disable';
            });
        }

        // Пример очистки при удалении
        const destroyButton = document.getElementById('destroy-button');
        if (destroyButton) {
            destroyButton.addEventListener('click', () => {
                multiSelect.destroy();
            });
        }

        // Подписка на обновление данных
        multiSelect.bind('dataBound', (data) => {
            console.log('Data updated:', data);
        });


        setTimeout(() => {
            // Пример установки новых данных через массив объектов
            multiSelect.setDataSource([
                { value: '123', text: 'Option 111' },
                { value: '1255', text: 'Option 222' },
                { value: '1234', text: 'Option 333' }
            ]);
        }, 4000);
    }
});