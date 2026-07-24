import { useState, useRef, useEffect } from 'react';
import { withJsonFormsControlProps } from '@jsonforms/react';
import Select from 'react-select';
import { Base } from './base';

const selectStyles = {
  control: (base: any) => ({
    ...base,
    backgroundColor: 'transparent',
    border: 'none',
    boxShadow: 'none',
    minHeight: '44px',
    cursor: 'pointer',
  }),
  valueContainer: (base: any) => ({
    ...base,
    padding: '0 12px',
  }),
  menu: (base: any) => ({
    ...base,
    backgroundColor: 'var(--color-white, #fff)',
    border: '1px solid var(--color-gray-200, #eee)',
    borderRadius: '12px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    zIndex: 10,
    '.dark &': {
      backgroundColor: 'var(--color-gray-900, #101828)',
      borderColor: 'var(--color-gray-800, #1d2939)',
    }
  }),
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isSelected 
      ? 'var(--color-brand-500, #465fff)' 
      : state.isFocused 
        ? 'var(--color-brand-50, #f2f7ff)' 
        : 'transparent',
    color: state.isSelected 
      ? '#fff' 
      : 'var(--color-gray-900, #101828)',
    fontSize: '.875rem',
    cursor: 'pointer',
    '.dark &': {
      backgroundColor: state.isSelected 
        ? 'var(--color-brand-500, #465fff)' 
        : state.isFocused 
          ? 'rgba(70, 95, 255, 0.1)' 
          : 'transparent',
      color: state.isSelected ? '#fff' : 'rgba(255, 255, 255, 0.9)',
    },
    '&:active': { backgroundColor: 'var(--color-brand-600, #3641f5)' },
  }),
  singleValue: (base: any) => ({ 
    ...base, 
    color: 'var(--color-gray-900, #101828)',
    '.dark &': { color: 'rgba(255, 255, 255, 0.9)' }
  }),
  multiValue: (base: any) => ({
    ...base,
    backgroundColor: 'var(--color-brand-500, #465fff)',
    borderRadius: '6px',
    color: '#fff',
  }),
  multiValueLabel: (base: any) => ({ ...base, color: '#fff' }),
  multiValueRemove: (base: any) => ({
    ...base,
    color: '#fff',
    borderTopRightRadius: '6px',
    borderBottomRightRadius: '6px',
    '&:hover': { backgroundColor: 'var(--color-brand-600, #3641f5)', color: '#fff' },
  }),
  input: (base: any) => ({ 
    ...base, 
    color: 'var(--color-gray-900, #101828)',
    '.dark &': { color: 'rgba(255, 255, 255, 0.9)' }
  }),
  placeholder: (base: any) => ({ ...base, color: 'var(--color-gray-400, #98a2b3)' }),
  indicatorSeparator: () => ({ display: 'none' }),
  dropdownIndicator: (base: any) => ({ ...base, color: 'var(--color-gray-400, #98a2b3)' }),
  clearIndicator: (base: any) => ({ ...base, color: 'var(--color-gray-400, #98a2b3)' }),
};

export const ReactSelectRenderer = withJsonFormsControlProps(
  ({ data, handleChange, path, label, errors, schema: controlSchema }) => {
    const isMulti = controlSchema?.type === 'array';
    const enumValues: string[] = isMulti
      ? (controlSchema as any)?.items?.enum ?? []
      : controlSchema?.enum ?? [];
    const options = enumValues.map((v) => ({ value: v, label: v }));

    const [menuIsOpen, setMenuIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const value = isMulti
      ? (data as string[] | undefined)?.map((v) => ({ value: v, label: v })) ?? []
      : options.find((o) => o.value === data) ?? null;

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setMenuIsOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelectChange = (selected: any) => {
      if (isMulti) {
        handleChange(path, selected?.map((o: any) => o.value) ?? []);
      } else {
        handleChange(path, selected?.value ?? undefined);
      }
    };

    return (
      <Base label={label} errors={errors} hasValue={isMulti ? (Array.isArray(data) && data.length > 0) : (data !== undefined && data !== null && data !== '')}>
        <div ref={containerRef} style={{ width: '100%' }}>
          <Select
            isMulti={isMulti}
            options={options}
            value={value}
            onChange={handleSelectChange}
            menuIsOpen={menuIsOpen}
            onMenuOpen={() => setMenuIsOpen(true)}
            onMenuClose={() => setMenuIsOpen(false)}
            isClearable
            placeholder=""
            styles={selectStyles}
            isSearchable={true}
          />
        </div>
      </Base>
    );
  }
);