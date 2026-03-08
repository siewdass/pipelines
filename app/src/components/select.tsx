import { withJsonFormsControlProps } from '@jsonforms/react';
import Select from 'react-select';
import { Base } from './base';

const selectStyles = {
  control: (base: any, state: any) => ({
    ...base,
    backgroundColor: '#1a1a1a',
    borderColor: state.isFocused ? '#646cff' : '#444',
    color: '#fff',
    '&:hover': { borderColor: '#646cff' },
    boxShadow: state.isFocused ? '0 0 0 1px #646cff' : 'none',
    minHeight: '38px',
  }),
  menu: (base: any) => ({
    ...base,
    backgroundColor: '#1a1a1a',
    border: '1px solid #444',
    zIndex: 10,
  }),
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isFocused ? '#646cff' : 'transparent',
    color: state.isFocused ? '#fff' : 'rgba(255,255,255,0.87)',
    '&:active': { backgroundColor: '#535bf2' },
  }),
  singleValue: (base: any) => ({ ...base, color: 'rgba(255,255,255,0.87)', textIndent: '3px' }),
  multiValue: (base: any) => ({
    ...base,
    backgroundColor: '#646cff',
    borderRadius: '4px',
  }),
  multiValueLabel: (base: any) => ({ ...base, color: '#fff' }),
  multiValueRemove: (base: any) => ({
    ...base,
    color: '#fff',
    '&:hover': { backgroundColor: '#535bf2', color: '#fff' },
  }),
  input: (base: any) => ({ ...base, color: 'rgba(255,255,255,0.87)', textIndent: '3px' }),
  placeholder: (base: any) => ({ ...base, color: '#888', textIndent: '3px' }),
  indicatorSeparator: (base: any) => ({ ...base, backgroundColor: '#444' }),
  dropdownIndicator: (base: any) => ({ ...base, color: '#888' }),
  clearIndicator: (base: any) => ({ ...base, color: '#888' }),
};

export const ReactSelectRenderer = withJsonFormsControlProps(
  ({ data, handleChange, path, label, errors, schema: controlSchema }) => {
    const isMulti = controlSchema?.type === 'array';
    const enumValues: string[] = isMulti
      ? (controlSchema as any)?.items?.enum ?? []
      : controlSchema?.enum ?? [];
    const options = enumValues.map((v) => ({ value: v, label: v }));

    const value = isMulti
      ? (data as string[] | undefined)?.map((v) => ({ value: v, label: v })) ?? []
      : options.find((o) => o.value === data) ?? null;

    const handleSelectChange = (selected: any) => {
      if (isMulti) {
        handleChange(path, selected?.map((o: any) => o.value) ?? []);
      } else {
        handleChange(path, selected?.value ?? undefined);
      }
    };

    return (
      <Base label={label} errors={errors} hasValue={isMulti ? (Array.isArray(data) && data.length > 0) : (data !== undefined && data !== null && data !== '')}>
        <Select
          isMulti={isMulti}
          options={options}
          value={value}
          onChange={handleSelectChange}
          isClearable
          placeholder=""
          styles={selectStyles}
          isSearchable={true}
        />
      </Base>
    );
  }
);