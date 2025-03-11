interface HTMLSelectElementWithOptions extends HTMLSelectElement {
    options: HTMLOptionsCollection;
}

// Определяем типы для событий
type EventType = 'dataBound' | 'open' | 'close' | 'change';
type EventCallback = (data: any) => void;

// Константы для дефолтных текстовых значений
const DEFAULT_TEXTS = {
    PLACEHOLDER: 'Выберите опции',
    ALL_SELECTED: 'Выбраны все',
    SELECTED_COUNT: 'Выбрано:',
    ALL_OPTION_TEXT: 'Все',
    ALL_OPTION_VALUE: '-1'
} as const;

// Константы для дефолтных классов
const DEFAULT_CLASSES = {
    WRAPPER: 'multi-select',
    BUTTON: 'multi-select__button',
    DROPDOWN: 'multi-select__dropdown',
    DROPDOWN_OPEN: 'multi-select__dropdown_open',
    LIST: 'multi-select__list',
    OPTION: 'multi-select__option'
} as const;

// Интерфейс для опций компонента
interface MultiSelectOptions {
    wrapperClassName: string;
    buttonClassName: string;
    dropdownClassName: string;
    openedClassName: string;
    listClassName: string;
    optionClassName: string;
    texts: {
        placeholder: string;
        allSelected: string;
        selectedCount: string;
        allOptionText: string;
    };
}

export class MultiSelect {
    private options: MultiSelectOptions;
    private originalSelect: HTMLSelectElementWithOptions;
    private selectOptions: HTMLOptionElement[];
    private selectedValues: Set<string>;
    private eventHandlers: Map<EventType, Set<EventCallback>>;
    private container!: HTMLDivElement;
    private button!: HTMLButtonElement;
    private dropdown!: HTMLDivElement;
    private isOpen: boolean = false;

    constructor(selectElement: HTMLSelectElementWithOptions, options: Partial<MultiSelectOptions> = {}) {
        this.options = {
            wrapperClassName: DEFAULT_CLASSES.WRAPPER,
            buttonClassName: DEFAULT_CLASSES.BUTTON,
            dropdownClassName: DEFAULT_CLASSES.DROPDOWN,
            openedClassName: DEFAULT_CLASSES.DROPDOWN_OPEN,
            listClassName: DEFAULT_CLASSES.LIST,
            optionClassName: DEFAULT_CLASSES.OPTION,
            ...options,
            texts: {
                placeholder: DEFAULT_TEXTS.PLACEHOLDER,
                allSelected: DEFAULT_TEXTS.ALL_SELECTED,
                selectedCount: DEFAULT_TEXTS.SELECTED_COUNT,
                allOptionText: DEFAULT_TEXTS.ALL_OPTION_TEXT,
                ...options.texts,
            }
        };

        this.originalSelect = selectElement;
        this.selectOptions = Array.from(selectElement.options);
        this.selectedValues = new Set();
        this.eventHandlers = new Map();

        this.init();
        // Уведомляем о завершении инициализации
        this.trigger('dataBound', { options: this.selectOptions });
    }

    private init() {
        const { wrapperClassName, buttonClassName, dropdownClassName, texts } = this.options;
        // Создаем контейнер для кастомного селекта
        this.container = document.createElement('div');
        this.container.className = wrapperClassName;

        // Создаем кнопку для открытия/закрытия
        this.button = document.createElement('button');
        this.button.className = buttonClassName;
        this.button.textContent = texts.placeholder;
        this.button.onclick = this.toggleDropdown;

        // Создаем выпадающий список
        this.dropdown = document.createElement('div');
        this.dropdown.className = dropdownClassName;
        this.dropdown.onchange = this.handleOptionChange;

        // Добавляем элементы в контейнер
        this.container.appendChild(this.button);
        this.container.appendChild(this.dropdown);

        // Создаем чекбоксы для каждой опции
        this.createCheckboxes();

        // Скрываем оригинальный селект
        this.originalSelect.style.display = 'none';
        this.originalSelect.parentNode?.insertBefore(this.container, this.originalSelect);
    }

    private createOptionElement(value: string, text: string): HTMLLIElement {
        const optionElement = document.createElement('li');
        optionElement.className = this.options.optionClassName;
        optionElement.innerHTML = `
            <label>
                <input type="checkbox" value="${value}">
                <span>${text}</span>
            </label>
        `;
        return optionElement;
    }

    private createCheckboxes() {
        const ul = document.createElement('ul');
        ul.className = this.options.listClassName;

        // Добавляем опцию "Все"
        const allOption = this.createOptionElement(
            DEFAULT_TEXTS.ALL_OPTION_VALUE,
            this.options.texts.allOptionText
        );
        ul.appendChild(allOption);

        // Добавляем остальные опции
        this.selectOptions.forEach(option => {
            const optionElement = this.createOptionElement(option.value, option.text);
            ul.appendChild(optionElement);
        });

        // Добавляем список в DOM
        this.dropdown.appendChild(ul);
    }

    // Метод для привязки обработчиков событий
    public bind(eventType: EventType, callback: EventCallback) {
        if (!this.eventHandlers.has(eventType)) {
            this.eventHandlers.set(eventType, new Set());
        }
        this.eventHandlers.get(eventType)?.add(callback);
    }

    // Метод для отвязки обработчиков событий
    public unbind(eventType: EventType, callback: EventCallback) {
        this.eventHandlers.get(eventType)?.delete(callback);
    }

    // Метод для вызова событий
    private trigger(eventType: EventType, data: any) {
        this.eventHandlers.get(eventType)?.forEach(callback => callback(data));
    }

    private handleOptionChange = ({ target }: Event) => {
        if (target instanceof HTMLInputElement) {
            if (target.value === DEFAULT_TEXTS.ALL_OPTION_VALUE) {
                this.handleSelectAll(target.checked);
            }
            else {
                this.handleSingleOptionChange(target);
            }
        }
    }

    private toggleDropdown = () => {
        this.isOpen = !this.isOpen;
        this.dropdown.classList.toggle(DEFAULT_CLASSES.DROPDOWN_OPEN);

        if (this.isOpen) {
            document.addEventListener('click', this.handleDocumentClick);
            this.trigger('open', { timestamp: new Date() });
        }
        else {
            document.removeEventListener('click', this.handleDocumentClick);
            this.trigger('close', { timestamp: new Date() });
        }
    }

    private closeDropdown() {
        if (this.isOpen) {
            this.isOpen = false;
            this.dropdown.classList.remove(this.options.openedClassName);
            this.trigger('close', { timestamp: new Date() });
        }
    }

    private handleDocumentClick = (e: MouseEvent) => {
        const target = e.target;

        if (target instanceof Node && !this.container.contains(target)) {
            this.closeDropdown();
            document.removeEventListener('click', this.handleDocumentClick);
        }
    }

    private handleSelectAll(checked: boolean) {
        const checkboxes = this.dropdown.querySelectorAll<HTMLInputElement>('input[type="checkbox"]:not([value="-1"])');

        checkboxes.forEach(checkbox => {
            checkbox.checked = checked;
            checked ? this.selectedValues.add(checkbox.value) : this.selectedValues.delete(checkbox.value);
        });

        this.updateButtonText();
        this.trigger('change', {
            selectedValues: Array.from(this.selectedValues),
            isAllSelected: checked
        });
    }

    private handleSingleOptionChange(checkbox: HTMLInputElement) {
        if (checkbox.checked) {
            this.selectedValues.add(checkbox.value);
        } 
        else {
            const allCheckbox = this.dropdown.querySelector<HTMLInputElement>(`input[value="${DEFAULT_TEXTS.ALL_OPTION_VALUE}"]`);
            allCheckbox && (allCheckbox.checked = false);
        }

        const checkboxes = this.dropdown.querySelectorAll<HTMLInputElement>(`input[type="checkbox"]:not([value="${DEFAULT_TEXTS.ALL_OPTION_VALUE}"]`);
        const allChecked = Array.from(checkboxes).every(cb => cb.checked);
        const allCheckbox = this.dropdown.querySelector<HTMLInputElement>(`input[value="${DEFAULT_TEXTS.ALL_OPTION_VALUE}"]`);
        allCheckbox && (allCheckbox.checked = allChecked);

        this.updateButtonText();
        this.trigger('change', {
            selectedValues: Array.from(this.selectedValues),
            changedValue: checkbox.value,
            isChecked: checkbox.checked
        });
    }

    private updateButtonText() {
        if (this.selectedValues.size === 0) {
            this.button.textContent = this.options.texts.placeholder;
        }
        else if (this.selectedValues.size === this.selectOptions.length) {
            this.button.textContent = this.options.texts.allSelected;
        }
        else {
            this.button.textContent = `${this.options.texts.selectedCount} ${this.selectedValues.size}`;
        }
    }

    public setValue(values: string[]) {
        this.selectedValues.clear();
        const checkboxes = this.dropdown.querySelectorAll<HTMLInputElement>('input[type="checkbox"]');

        checkboxes.forEach(checkbox => {
            if (values.includes(checkbox.value)) {
                checkbox.checked = true;
                this.selectedValues.add(checkbox.value);
            }
            else {
                checkbox.checked = false;
            }
        });

        this.updateButtonText();
    }
} 