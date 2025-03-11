# MultiSelect Component

Кастомный TypeScript компонент для создания выпадающего списка с множественным выбором. Компонент предоставляет богатый API для управления выбором опций, поддерживает динамическое обновление данных, управление состоянием и кастомизацию через CSS переменные.

## Содержание

1. [Установка](#установка)
2. [Основные возможности](#основные-возможности)
3. [Быстрый старт](#быстрый-старт)
4. [API Reference](#api-reference)
5. [События](#события)
6. [Стилизация](#стилизация)
7. [Примеры использования](#примеры-использования)
8. [Браузерная поддержка](#браузерная-поддержка)
9. [Разработка](#разработка)
10. [Лицензия](#лицензия)

## Установка

```bash
npm install @your-scope/multi-select
```

## Основные возможности

- 🚀 Нативная производительность
- 🎨 Полная кастомизация через CSS переменные
- 📱 Адаптивный дизайн
- ⌨️ Доступность (ARIA attributes)
- 🔄 Динамическое обновление данных
- 📝 TypeScript поддержка
- 🎯 Опция "Выбрать все"
- 🔌 События для всех действий
- 🔒 Управление состоянием (enable/disable)

## Быстрый старт

### HTML разметка

```html
<select id="demo-select" multiple>
    <option value="1">Опция 1</option>
    <option value="2">Опция 2</option>
    <option value="3">Опция 3</option>
</select>
```

### JavaScript/TypeScript инициализация

```typescript
import { MultiSelect } from '@your-scope/multi-select';

const select = document.getElementById('demo-select');
if (select instanceof HTMLSelectElement) {
    const multiSelect = new MultiSelect(select);
}
```

## API Reference

### Конструктор

```typescript
new MultiSelect(selectElement: HTMLSelectElement, options?: Partial<MultiSelectOptions>)
```

### Интерфейсы

#### MultiSelectOptions

```typescript
interface MultiSelectOptions {
    wrapperClassName: string;      // CSS класс для основного контейнера
    buttonClassName: string;        // CSS класс для кнопки
    dropdownClassName: string;      // CSS класс для выпадающего списка
    openedClassName: string;        // CSS класс для открытого состояния
    listClassName: string;         // CSS класс для списка опций
    optionClassName: string;       // CSS класс для опции
    texts: {
        placeholder: string;       // Текст плейсхолдера
        allSelected: string;      // Текст при выборе всех опций
        selectedCount: string;    // Префикс для количества выбранных
        allOptionText: string;    // Текст опции "Выбрать все"
    };
}
```

#### DataSourceItem

```typescript
interface DataSourceItem {
    value: string;  // Значение опции
    text: string;   // Отображаемый текст опции
}
```

### Публичные методы

#### Управление событиями

```typescript
// Подписка на события
bind(eventType: EventType, callback: EventCallback): void

// Отписка от событий
unbind(eventType: EventType, callback: EventCallback): void
```

#### Управление данными

```typescript
// Установка выбранных значений
setValue(values: string[]): void

// Получение выбранных значений
getSelectedValues(): string[]

// Обновление источника данных
setDataSource(data: DataSourceItem[]): void
```

#### Управление состоянием

```typescript
// Включение/отключение компонента
enable(isEnabled: boolean): void

// Проверка состояния дропдауна
isDropdownOpen(): boolean

// Уничтожение компонента
destroy(): void
```

## События

### Типы событий

```typescript
type EventType = 'dataBound' | 'open' | 'close' | 'change' | 'stateChange';
```

### Структура данных событий

#### dataBound
```typescript
{
    sender: MultiSelect;           // Экземпляр компонента
    options: HTMLOptionElement[];  // Список опций
    timestamp: Date;              // Временная метка
}
```

#### open/close
```typescript
{
    sender: MultiSelect;  // Экземпляр компонента
    timestamp: Date;     // Временная метка
}
```

#### change
```typescript
{
    sender: MultiSelect;           // Экземпляр компонента
    selectedValues: string[];      // Список выбранных значений
    isAllSelected?: boolean;       // Флаг выбора всех опций
    changedValue?: string;        // Измененное значение (при одиночном выборе)
    isChecked?: boolean;          // Состояние чекбокса
}
```

#### stateChange
```typescript
{
    sender: MultiSelect;  // Экземпляр компонента
    type: string;        // Тип изменения состояния
    isEnabled: boolean;  // Новое состояние
    timestamp: Date;     // Временная метка
}
```

## Стилизация

### CSS переменные

```css
:root {
    /* Размеры */
    --multi-select-max-width: 300px;
    --multi-select-dropdown-max-height: 200px;

    /* Отступы */
    --multi-select-padding: 10px 15px;
    --multi-select-option-padding: 8px 15px;
    --multi-select-checkbox-margin: 8px;
    --multi-select-dropdown-margin: 5px;

    /* Цвета */
    --multi-select-bg: #ffffff;
    --multi-select-border-color: #ccc;
    --multi-select-border-hover: #999;
    --multi-select-arrow-color: #666;
    --multi-select-option-hover: #f5f5f5;

    /* Состояние disabled */
    --multi-select-disabled-opacity: 0.6;
    --multi-select-disabled-bg: #f5f5f5;
    --multi-select-disabled-border: #ddd;
    --multi-select-disabled-color: #999;

    /* Тени */
    --multi-select-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    /* Типографика */
    --multi-select-font-size: 14px;
    --multi-select-font-family: Arial, sans-serif;

    /* Границы */
    --multi-select-border-radius: 4px;
}
```

### CSS классы

| Класс | Описание |
|-------|-----------|
| `multi-select` | Основной контейнер |
| `multi-select_disabled` | Состояние disabled |
| `multi-select__button` | Кнопка открытия/закрытия |
| `multi-select__dropdown` | Выпадающий список |
| `multi-select__dropdown_open` | Открытый выпадающий список |
| `multi-select__list` | Список опций |
| `multi-select__option` | Опция в списке |

## Примеры использования

### Базовая инициализация с обработкой событий

```typescript
const multiSelect = new MultiSelect(selectElement);

// Подписка на изменение выбранных значений
multiSelect.bind('change', (e) => {
    console.log('Выбранные значения:', e.selectedValues);
});

// Отслеживание состояния компонента
multiSelect.bind('stateChange', (e) => {
    console.log('Состояние изменилось:', e.isEnabled);
});
```

### Кастомная конфигурация

```typescript
const multiSelect = new MultiSelect(selectElement, {
    texts: {
        placeholder: 'Выберите элементы...',
        allSelected: 'Все элементы выбраны',
        selectedCount: 'Выбрано элементов:',
        allOptionText: 'Выбрать все'
    }
});
```

### Динамическое обновление данных

```typescript
// Обновление данных
multiSelect.setDataSource([
    { value: '1', text: 'Новая опция 1' },
    { value: '2', text: 'Новая опция 2' },
    { value: '3', text: 'Новая опция 3' }
]);

// Отслеживание обновления данных
multiSelect.bind('dataBound', (e) => {
    console.log('Данные обновлены:', e.options);
});
```

### Управление состоянием

```typescript
// Отключение компонента
multiSelect.enable(false);

// Программное управление значениями
multiSelect.setValue(['1', '2']);

// Получение текущих значений
const values = multiSelect.getSelectedValues();

// Очистка ресурсов при удалении
multiSelect.destroy();
```

## Браузерная поддержка

- Chrome (последние 2 версии)
- Firefox (последние 2 версии)
- Safari (последние 2 версии)
- Edge (последние 2 версии)

## Разработка

### Установка зависимостей

```bash
npm install
```

### Запуск для разработки

```bash
npm run dev
```

### Сборка

```bash
npm run build
```

### Тестирование

```bash
npm run test
```

## Лицензия

MIT License. См. файл [LICENSE](LICENSE) для деталей.
