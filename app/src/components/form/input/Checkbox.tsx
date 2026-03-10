import React from "react";

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({ checked, onChange, className }) => {
  return (
    <div className={`relative flex items-center justify-center h-5 w-5 rounded-md border border-gray-300 dark:border-gray-700 ${checked ? 'bg-brand-500 border-brand-500' : 'bg-transparent'} ${className}`}>
      <input
        type="checkbox"
        className="absolute w-full h-full opacity-0 cursor-pointer"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      {checked && (
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10 3L4.5 8.5L2 6"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  );
};

export default Checkbox;
