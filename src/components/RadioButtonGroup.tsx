import { useState } from "react";

interface RadioButtonProps {
  label: string;
  value: string;
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const RadioButton: React.FC<RadioButtonProps> = ({ label, value, checked, onChange }) => {
  return (
    <label className="flex gap-1">
      <input type="radio" value={value} checked={checked} onChange={onChange} />
      <span className="text-xs">{label}</span>
    </label>
  );
};

interface RadioButtonGroupProps {
  options: { label: string; value: string }[];
  name: string;
  onChange?: (value: string) => void;
  defaultvalue: string;
}

export const RadioButtonGroup: React.FC<RadioButtonGroupProps> = ({ options, name, onChange, defaultvalue }) => {
  const [selectedValue, setSelectedValue] = useState<string | null>(defaultvalue);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedValue(event.target.value);
    if (onChange) {
      onChange(event.target.value);
    }
  };

  return (
    <div className="flex flex-row gap-2 items-center">
      {options.map((option) => (
        <RadioButton
          key={option.value}
          label={option.label}
          value={option.value}
          checked={selectedValue === option.value}
          onChange={handleChange}
        />
      ))}
    </div>
  );
};
