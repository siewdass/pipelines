import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";

/**
 * Headless Dropdown Logic
 * Returns [open, toggle, close, isOpen, DropdownElement]
 */
export function useDropdown() {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  const DropdownComponent = useMemo(() => {
    return ({ children, className = "", onCloseOverride }: { children: React.ReactNode; className?: string; onCloseOverride?: () => void }) => (
      <Dropdown 
        isOpen={isOpen} 
        onClose={onCloseOverride || close} 
        className={className}
      >
        {children}
      </Dropdown>
    );
  }, [isOpen, close]);

  return [toggle, open, close, isOpen, DropdownComponent] as const;
}

interface DropdownProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

/**
 * Dropdown Component with Click-Outside detection
 */
export const Dropdown: React.FC<DropdownProps> = ({
  isOpen,
  onClose,
  children,
  className = "",
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest(".dropdown-toggle")
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className={className}
    >
      {children}
    </div>
  );
};
