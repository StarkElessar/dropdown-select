interface HTMLSelectElementWithOptions extends HTMLSelectElement {
    options: HTMLOptionsCollection;
}

// Определяем типы для событий
type EventType = 'dataBound' | 'open' | 'close' | 'change' | 'stateChange';

// Обновим тип для данных события
interface EventData {
    sender: MultiSelect;
    [key: string]: any;
}

type EventCallback = (e: EventData) => void;

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

// Добавим новый тип для источника данных
interface DataSourceItem {
    value: string;
    text: string;
}

type DataSource = DataSourceItem[];

// Обновим интерфейс IMultiSelect
export interface IMultiSelect {
    // Методы для работы с событиями
    bind(eventType: EventType, callback: EventCallback): void;
    unbind(eventType: EventType, callback: EventCallback): void;

    // Методы для работы со значениями
    setValue(values: string[]): void;
    getSelectedValues(): string[];

    // Методы управления состоянием
    enable(isEnabled: boolean): void;
    isDropdownOpen(): boolean;

    // Метод очистки
    destroy(): void;

    // Добавим новый метод
    setDataSource(data: DataSource): void;
}

export class MultiSelect implements IMultiSelect {
    private _options: MultiSelectOptions;
    private _originalSelect: HTMLSelectElementWithOptions;
    private _selectOptions: HTMLOptionElement[];
    private _selectedValues: Set<string>;
    private _eventHandlers: Map<EventType, Set<EventCallback>>;
    private _container!: HTMLDivElement;
    private _button!: HTMLButtonElement;
    private _dropdown!: HTMLDivElement;
    private _isOpen: boolean = false;
    private _isEnabled: boolean = true;

    constructor(selectElement: HTMLSelectElementWithOptions, options: Partial<MultiSelectOptions> = {}) {
        this._options = {
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

        this._originalSelect = selectElement;
        this._selectOptions = Array.from(selectElement.options);
        this._selectedValues = new Set();
        this._eventHandlers = new Map();

        this.init();

        // Используем queueMicrotask чтобы дать время на подписку
        queueMicrotask(() => {
            this.trigger('dataBound', { options: this._selectOptions });
        });
    }

    private init() {
        const { wrapperClassName, buttonClassName, dropdownClassName, texts } = this._options;

        // Создаем контейнер для кастомного селекта
        this._container = document.createElement('div');
        this._container.className = wrapperClassName;

        // Создаем кнопку для открытия/закрытия
        this._button = document.createElement('button');
        this._button.className = buttonClassName;
        this._button.textContent = texts.placeholder;
        this._button.onclick = this.toggleDropdown;
        this._container.appendChild(this._button);

        // Создаем выпадающий список
        this._dropdown = document.createElement('div');
        this._dropdown.className = dropdownClassName;
        this._dropdown.onchange = this.handleOptionChange;
        this._container.appendChild(this._dropdown);

        // Создаем чекбоксы для каждой опции
        this.createCheckboxes();

        // Сохраняем ссылку на родителя оригинального селекта
        const parentNode = this._originalSelect.parentNode;

        if (parentNode) {
            // Вставляем контейнер перед оригинальным селектом
            parentNode.insertBefore(this._container, this._originalSelect);
            // Перемещаем оригинальный селект внутрь контейнера
            this._container.appendChild(this._originalSelect);
            this._originalSelect.style.display = 'none';
        }
    }

    private createOptionElement(value: string, text: string): HTMLLIElement {
        const optionElement = document.createElement('li');
        optionElement.className = this._options.optionClassName;
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
        ul.className = this._options.listClassName;
        ul.appendChild(
            this.createOptionElement(
                DEFAULT_TEXTS.ALL_OPTION_VALUE,
                this._options.texts.allOptionText
            )
        );

        // Добавляем остальные опции
        this._selectOptions.forEach(option => {
            const optionElement = this.createOptionElement(option.value, option.text);
            ul.appendChild(optionElement);
        });

        // Добавляем список в DOM
        this._dropdown.appendChild(ul);
    }

    // Метод для привязки обработчиков событий
    public bind(eventType: EventType, callback: EventCallback) {
        if (!this._eventHandlers.has(eventType)) {
            this._eventHandlers.set(eventType, new Set());
        }
        this._eventHandlers.get(eventType)?.add(callback);
        console.log(this._eventHandlers);
    }

    // Метод для отвязки обработчиков событий
    public unbind(eventType: EventType, callback: EventCallback) {
        this._eventHandlers.get(eventType)?.delete(callback);
    }

    // Метод для вызова событий
    private trigger(eventType: EventType, data: Omit<EventData, 'sender'>) {
        const eventData: EventData = {
            sender: this,
            ...data
        };
        this._eventHandlers.get(eventType)?.forEach(callback => callback(eventData));
    }

    private handleOptionChange = ({ target }: Event) => {
        if (this._isEnabled && target instanceof HTMLInputElement) {
            if (target.value === DEFAULT_TEXTS.ALL_OPTION_VALUE) {
                this.handleSelectAll(target.checked);
            }
            else {
                this.handleSingleOptionChange(target);
            }
        }
    }

    private toggleDropdown = () => {
        if (this._isEnabled) {
            this._isOpen = !this._isOpen;
            this._dropdown.classList.toggle(DEFAULT_CLASSES.DROPDOWN_OPEN);

            if (this._isOpen) {
                document.addEventListener('click', this.handleDocumentClick);
                this.trigger('open', {
                    sender: this,
                    timestamp: new Date()
                });
            }
            else {
                document.removeEventListener('click', this.handleDocumentClick);
                this.trigger('close', {
                    sender: this,
                    timestamp: new Date()
                });
            }
        }
    }

    private closeDropdown() {
        if (this._isOpen) {
            this._isOpen = false;
            this._dropdown.classList.remove(this._options.openedClassName);
            this.trigger('close', {
                sender: this,
                timestamp: new Date()
            });
        }
    }

    private handleDocumentClick = (e: MouseEvent) => {
        const target = e.target;

        if (target instanceof Node && !this._container.contains(target)) {
            this.closeDropdown();
            document.removeEventListener('click', this.handleDocumentClick);
        }
    }

    private handleSelectAll(checked: boolean) {
        const checkboxes = this._dropdown.querySelectorAll<HTMLInputElement>('input[type="checkbox"]:not([value="-1"])');

        checkboxes.forEach(checkbox => {
            checkbox.checked = checked;
            checked ? this._selectedValues.add(checkbox.value) : this._selectedValues.delete(checkbox.value);
        });

        this.updateButtonText();
        this.trigger('change', {
            sender: this,
            selectedValues: Array.from(this._selectedValues),
            isAllSelected: checked
        });
    }

    private handleSingleOptionChange(checkbox: HTMLInputElement) {
        if (checkbox.checked) {
            this._selectedValues.add(checkbox.value);
        }
        else {
            const allCheckbox = this._dropdown.querySelector<HTMLInputElement>(`input[value="${DEFAULT_TEXTS.ALL_OPTION_VALUE}"]`);
            allCheckbox && (allCheckbox.checked = false);
        }

        const checkboxes = this._dropdown.querySelectorAll<HTMLInputElement>(`input[type="checkbox"]:not([value="${DEFAULT_TEXTS.ALL_OPTION_VALUE}"]`);
        const allChecked = Array.from(checkboxes).every(cb => cb.checked);
        const allCheckbox = this._dropdown.querySelector<HTMLInputElement>(`input[value="${DEFAULT_TEXTS.ALL_OPTION_VALUE}"]`);
        allCheckbox && (allCheckbox.checked = allChecked);

        this.updateButtonText();
        this.trigger('change', {
            sender: this,
            selectedValues: Array.from(this._selectedValues),
            changedValue: checkbox.value,
            isChecked: checkbox.checked
        });
    }

    private updateButtonText() {
        if (this._selectedValues.size === 0) {
            this._button.textContent = this._options.texts.placeholder;
        }
        else if (this._selectedValues.size === this._selectOptions.length) {
            this._button.textContent = this._options.texts.allSelected;
        }
        else {
            this._button.textContent = `${this._options.texts.selectedCount} ${this._selectedValues.size}`;
        }
    }

    public setValue(values: string[]) {
        if (this._isEnabled) {
            this._selectedValues.clear();
            const checkboxes = this._dropdown.querySelectorAll<HTMLInputElement>('input[type="checkbox"]');

            checkboxes.forEach(checkbox => {
                if (values.includes(checkbox.value)) {
                    checkbox.checked = true;
                    this._selectedValues.add(checkbox.value);
                }
                else {
                    checkbox.checked = false;
                }
            });

            this.updateButtonText();
        }
    }

    public getSelectedValues(): string[] {
        return Array.from(this._selectedValues);
    }

    public enable(isEnabled: boolean) {
        this._isEnabled = isEnabled;

        if (!isEnabled) {
            // Закрываем дропдаун при отключении
            this.closeDropdown();
        }

        // Обновляем состояние и внешний вид
        this.updateEnabledState();

        // Уведомляем о изменении состояния
        this.trigger('stateChange', {
            sender: this,
            type: 'enabled',
            isEnabled,
            timestamp: new Date()
        });
    }

    private updateEnabledState(): void {
        if (this._isEnabled) {
            this._container.classList.remove('multi-select_disabled');
            this._button.removeAttribute('disabled');
            this._originalSelect.disabled = false;
        }
        else {
            this._container.classList.add('multi-select_disabled');
            this._button.setAttribute('disabled', 'disabled');
            this._originalSelect.disabled = true;
        }
    }

    public isDropdownOpen(): boolean {
        return this._isOpen;
    }

    public destroy(): void {
        // Отписываемся от всех событий
        document.removeEventListener('click', this.handleDocumentClick);

        // Очищаем обработчики событий
        this._eventHandlers.clear();

        // Восстанавливаем оригинальный селект
        this._originalSelect.style.display = '';
        this._originalSelect.disabled = false;

        // Удаляем наш контейнер
        this._container.remove();

        // Очищаем данные
        this._selectOptions = [];
        this._selectedValues.clear();
    }

    public setDataSource(data: DataSource): void {
        if (this._isEnabled) {
            // Очищаем текущие выбранные значения
            this._selectedValues.clear();

            // Создаем новые option элементы для оригинального select
            this._originalSelect.innerHTML = '';
            this._selectOptions = data.map(item => {
                const option = document.createElement('option');
                option.value = item.value;
                option.text = item.text;
                this._originalSelect.appendChild(option);
                return option;
            });

            this._dropdown.innerHTML = '';
            this.createCheckboxes();
            this.updateButtonText();

            // Уведомляем о обновлении данных
            queueMicrotask(() => {
                this.trigger('dataBound', {
                    sender: this,
                    options: this._selectOptions,
                    timestamp: new Date()
                });
            });
        }
    }
} 