'use client';

import { clsx } from 'clsx';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';

interface ComboboxProps<T> {
  items: T[];
  selectedId: string | null;
  selectedLabel?: string;
  getId: (item: T) => string;
  getLabel: (item: T) => string;
  onSelect: (item: T) => void;
  onCreate?: (name: string) => Promise<T>;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
}

// Поле поиска с выпадающим списком и возможностью создать новую запись на ходу
// (используется для выбора/создания магазина и продукта в форме ввода чека).
// forwardRef — чтобы родитель мог программно сфокусировать поле (автофокус новой строки позиции)
function ComboboxInner<T>(
  {
    items,
    selectedId,
    selectedLabel,
    getId,
    getLabel,
    onSelect,
    onCreate,
    placeholder,
    label,
    disabled,
  }: ComboboxProps<T>,
  forwardedRef: React.Ref<HTMLInputElement>,
) {
  const [query, setQuery] = useState(selectedLabel ?? '');
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(forwardedRef, () => inputRef.current as HTMLInputElement);

  // Синхронизация query с внешним selectedLabel во время рендера (не в эффекте) —
  // когда родитель меняет выбор программно (например, сбрасывает форму после сохранения)
  const [syncedLabel, setSyncedLabel] = useState(selectedLabel);
  if (selectedLabel !== syncedLabel) {
    setSyncedLabel(selectedLabel);
    setQuery(selectedLabel ?? '');
  }

  const trimmed = query.trim().toLowerCase();
  const filtered = trimmed
    ? items.filter((item) => getLabel(item).toLowerCase().includes(trimmed))
    : items;
  const exactMatch = items.some((item) => getLabel(item).toLowerCase() === trimmed);
  const showCreate = Boolean(onCreate) && trimmed.length > 0 && !exactMatch;

  async function handleCreate() {
    if (!onCreate) return;
    setCreating(true);
    try {
      const created = await onCreate(query.trim());
      onSelect(created);
      setQuery(getLabel(created));
    } finally {
      setCreating(false);
      setOpen(false);
    }
  }

  return (
    <div className="relative flex flex-col gap-1 text-sm">
      {label && <span className="text-[var(--text-secondary)]">{label}</span>}
      <input
        ref={inputRef}
        value={query}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            setOpen(false);
            inputRef.current?.blur();
          }
        }}
        className="rounded-lg border border-[var(--border)] bg-[var(--surface-1)] px-3 py-2 text-[var(--text-primary)] outline-none focus:border-[var(--series-1)] disabled:opacity-50"
      />
      {open && !disabled && (
        <div
          onMouseDown={(event) => event.preventDefault()}
          className="absolute top-full z-20 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-[var(--border)] bg-[var(--surface-1)] shadow-lg"
        >
          {filtered.length === 0 && !showCreate && (
            <div className="px-3 py-2 text-[var(--text-muted)]">Ничего не найдено</div>
          )}
          {filtered.map((item) => (
            <button
              key={getId(item)}
              type="button"
              onClick={() => {
                onSelect(item);
                setQuery(getLabel(item));
                setOpen(false);
              }}
              className={clsx(
                'block w-full px-3 py-2 text-left hover:bg-[var(--page)]',
                getId(item) === selectedId && 'bg-[var(--page)]',
              )}
            >
              {getLabel(item)}
            </button>
          ))}
          {showCreate && (
            <button
              type="button"
              disabled={creating}
              onClick={handleCreate}
              className="block w-full border-t border-[var(--border)] px-3 py-2 text-left font-medium text-[var(--series-1)] hover:bg-[var(--page)] disabled:opacity-50"
            >
              {creating ? 'Создаём…' : `+ Создать «${query.trim()}»`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export const Combobox = forwardRef(ComboboxInner) as <T>(
  props: ComboboxProps<T> & { ref?: React.Ref<HTMLInputElement> },
) => ReturnType<typeof ComboboxInner>;
