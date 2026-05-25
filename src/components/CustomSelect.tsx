import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: SelectOption[];
  icon?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  dropdownClassName?: string;
}

export function CustomSelect({ 
  value, 
  onChange, 
  options, 
  icon, 
  className = "", 
  containerClassName = "",
  dropdownClassName = "" 
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value === value) || options[0];

  return (
    <div className={`relative ${containerClassName}`} ref={ref}>
      <button
        type="button"
        className={`flex items-center justify-between w-full focus:outline-none bg-transparent appearance-none cursor-pointer ${className}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          {icon && <span className="flex-shrink-0">{icon}</span>}
          <span className="truncate">{selectedOption?.label}</span>
        </div>
        <ChevronDown className={`w-4 h-4 ml-3 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-indigo-400' : 'text-slate-400'}`} />
      </button>
      
      {isOpen && (
        <div className={`absolute z-50 mt-2 bg-slate-800 border border-slate-700/80 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] overflow-hidden min-w-[100%] w-max max-w-[calc(100vw-2rem)] ${dropdownClassName}`}>
          <ul className="max-h-60 overflow-y-auto custom-scrollbar flex flex-col py-1.5">
            {options.map((opt) => (
              <li 
                key={opt.value}
                className={`px-4 py-2.5 cursor-pointer transition-colors text-sm mx-1.5 rounded-lg flex items-center ${opt.value === value ? 'text-indigo-300 bg-indigo-500/15 font-medium' : 'text-slate-300 hover:bg-slate-700 hover:text-slate-100'}`}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
              >
                {opt.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
