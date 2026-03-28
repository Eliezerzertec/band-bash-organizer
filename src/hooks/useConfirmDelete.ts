import { useCallback } from 'react';

export function useConfirmDelete() {
  const confirmDelete = useCallback((
    itemName: string,
    onConfirm: () => void
  ) => {
    const message = `Tem certeza que deseja deletar "${itemName}"? Esta ação não pode ser desfeita.`;
    
    if (window.confirm(message)) {
      onConfirm();
    }
  }, []);

  return { confirmDelete };
}
