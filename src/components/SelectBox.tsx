import { type CSSProperties, memo } from "react";

type BasicSelectProps = {
  options: string[];
  onSelect: (option: string) => void;
  disabled?: boolean;
  style?: CSSProperties;
};

export const SelectBox: React.FC<BasicSelectProps> = memo(({ options, onSelect, disabled = false, style }) => {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value;
    const selectedOption = options.find((option) => option === selectedValue);
    if (selectedOption) {
      onSelect(selectedOption);
    }
  };

  return (
    <div className="w-64" style={style}>
      <select disabled={disabled} className="w-full text-xs p-1 border rounded-lg overflow-auto" onChange={handleChange}>
        <option defaultValue={options[0]} disabled>
          {"Select an option"}
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
});

SelectBox.displayName = "SelectBox";
