import React from 'react';
import Select from 'react-select';

const cantonOptions = [
  { value: 'Liberia', label: 'Liberia' },
  { value: 'Nicoya', label: 'Nicoya' },
  { value: 'Santa Cruz', label: 'Santa Cruz' },
  { value: 'Bagaces', label: 'Bagaces' },
  { value: 'Cañas', label: 'Cañas' },
  { value: 'Carrillo', label: 'Carrillo' },
  { value: 'Tilarán', label: 'Tilarán' },
  { value: 'Abangares', label: 'Abangares' },
  { value: 'La Cruz', label: 'La Cruz' },
  { value: 'Hojancha', label: 'Hojancha' },
  { value: 'Nandayure', label: 'Nandayure' }
];

const customStyles = {
  control: (base, state) => ({
    ...base,
    background: '#29293D',
    borderColor: state.isFocused ? '#7F5AF0' : '#3A3A4A',
    boxShadow: 'none',
    color: '#EAEAEA',
    '&:hover': { borderColor: '#7F5AF0' },
  }),
  singleValue: (base) => ({ ...base, color: '#EAEAEA' }),
  menu: (base) => ({ ...base, background: '#2C2C3E', borderRadius: '8px' }),
  option: (base, state) => ({
    ...base,
    background: state.isSelected
      ? '#3A3A4A'
      : state.isFocused
      ? '#7F5AF0'
      : 'transparent',
    color: state.isSelected ? '#fff' : '#EAEAEA',
    cursor: 'pointer'
  })
};

function CantonSelector({ selectedCanton, setSelectedCanton }) {
  const handleChange = (option) => setSelectedCanton(option.value);
  const selectedOption = cantonOptions.find(o => o.value === selectedCanton);
  
  return (
    <Select
      value={selectedOption}
      onChange={handleChange}
      options={cantonOptions}
      styles={customStyles}
      isSearchable={false}
      menuPlacement="auto"
    />
  );
}

export default CantonSelector;
