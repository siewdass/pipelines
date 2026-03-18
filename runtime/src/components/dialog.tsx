import { useState, useCallback, useMemo } from 'react';
import { Modal, ModalProps } from 'react-responsive-modal';

/**
 * Hook for managing dialog state effortlessly.
 * Returns an array [OpenFn, CloseFn, DialogComponent]
 * Use it like: const [open, close, Dialog] = useDialog();
 */
export function useDialog() {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const DialogComponent = useMemo(() => {
    return ({ children, ...props }: Omit<ModalProps, 'open' | 'onClose'>) => (
      <Modal open={isOpen} onClose={close} {...props}>
        {children}
      </Modal>
    );
  }, [isOpen, close]);

  // Return as array [open, close, Dialog]
  return [open, close, DialogComponent] as const;
}
