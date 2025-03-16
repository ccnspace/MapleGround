import React from "react";

interface CheckBoxProps {
  checked?: boolean; // 선택된 상태 (Controlled)
  defaultChecked?: boolean; // 초기 선택 상태 (Uncontrolled)
  onChange?: (checked: boolean) => void; // 상태 변경 이벤트
  label?: string; // 체크박스 라벨
  disabled?: boolean; // 비활성화 여부
}

const CheckBox: React.FC<CheckBoxProps> = ({ checked, defaultChecked, onChange, label, disabled = false }) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(event.target.checked);
  };

  return (
    <label className={`flex items-center space-x-2 cursor-pointer ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}>
      <input
        type="checkbox"
        checked={checked}
        defaultChecked={defaultChecked}
        onChange={handleChange}
        disabled={disabled}
        className="w-4 h-4 accent-blue-500 cursor-pointer"
      />
      {label && <span className="text-sm text-gray-700">{label}</span>}
    </label>
  );
};

export default CheckBox;
