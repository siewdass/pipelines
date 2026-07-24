import { toast, Toaster } from 'sonner'
import { useCallback } from 'react'
import sonnerStyles from 'sonner/dist/styles.css'

const style = document.createElement('style')
style.textContent = sonnerStyles
document.head.appendChild(style)

export type NotificationType = 'success' | 'error' | 'info';

/**
 * Global component for rendering notifications.
 * Should be placed at the root of the application.
 */
export const NotificationProvider = Toaster

/**
 * Hook for triggering notifications.
 * Unified function for 'success', 'error' and 'info'.
 */
export function useToast() {
	const show = useCallback((message: string, type: NotificationType = 'info') => {
		switch (type) {
		case 'success':
			toast.success(message)
			break
		case 'error':
			toast.error(message)
			break
		case 'info':
		default:
			toast.info(message)
			break
		}
	}, [])

	return { 
		show,
		dismiss: useCallback((id?: string | number) => toast.dismiss(id), [])
	}
}
