import * as React from 'react';
import { useState, useCallback, useMemo } from 'react';
import { Modal, ModalProps } from 'react-responsive-modal';

/**
 * Hook for managing dialog state effortlessly.
 * Returns an array [OpenFn, CloseFn, DialogComponent]
 * Use it like: const [open, close, Dialog] = useDialog();
 */
export function useDialog() {
  const [isOpen, setIsOpen] = useState(false);

  const setToggle = useCallback(() => setIsOpen((prev) => !prev), []);

  const DialogComponent = useMemo(() => {
    return ({ children, ...props }: Omit<ModalProps, 'open' | 'onClose'>) => (
      <Modal open={isOpen} onClose={setToggle} {...props}>
        {children}
      </Modal>
    );
  }, [isOpen, setToggle]);

  // Return as array [Dialog, setToggle, setOpen, setClose, isOpen]
  return [DialogComponent, setToggle, isOpen] as const;
}
