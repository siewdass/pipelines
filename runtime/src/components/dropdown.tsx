import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";

/**
 * useDropdown hook (Black Box pattern)
 * Encapsulates all logic and returns [DropdownComponent, toggle, isOpen]
 */
export function useDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const setToggle = useCallback(() => setIsOpen((prev) => !prev), []);
  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest(".dropdown-toggle")
      ) {
        close();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, close]);

  const DropdownComponent = useMemo(() => {
    return ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
      if (!isOpen) return null;
      return (
        <div ref={dropdownRef} className={className}>
          {children}
        </div>
      );
    };
  }, [isOpen]);

  return [DropdownComponent, setToggle, isOpen] as const;
}
