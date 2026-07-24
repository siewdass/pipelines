import * as React from 'react'
import * as ReactDOM from 'react-dom/client'

// Visual & Logic
import * as Charts from 'recharts'

// Drag & Drop
import * as DndCore from '@dnd-kit/core'
import * as DndSortable from '@dnd-kit/sortable'
import * as DndModifiers from '@dnd-kit/modifiers'
import * as DndUtilities from '@dnd-kit/utilities'

// Network & Core Logic
import * as Network from './network'
import { useForm } from './library/form'
import { Main } from './library'
import { useTheme } from './library/theme'
import { useSidebar } from './library/sidebar'
import * as Router from './library/router'
import { Breadcrumbs } from './components/breadcrumbs'

// Components (Visual)
import { useDropdown } from './components/dropdown'
import { useTable } from './components/table'
import { useDialog } from './components/dialog'
import { useToast } from './components/notification'
import { Skeleton } from './components/skeleton'

// Extra Visual (Productivity & UI)
import { Tabs } from 'react-tabs'
import { Tooltip } from 'react-tooltip'
import { Accordion } from 'react-accessible-accordion'
import { motion } from 'framer-motion'

// Extra Logic (Hooks & Utils)
import * as useHooks from 'react-use'
import { useHotkeys } from 'react-hotkeys-hook'
import * as dateFns from 'date-fns'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { create as zustand } from 'zustand'
import { z as zod } from 'zod'

// Assets
import * as Fa6 from 'react-icons/fa6'

const FallbackIcon = () => React.createElement('div', {
	style: { width: 24, height: 24, borderRadius: 6, background: 'rgba(255,255,255,0.1)' }
})

const Fa6Any = Fa6 as Record<string, any>

const iconCache: Record<string, any> = {}

const w = window as any

w.React = React
w.ReactDOM = ReactDOM
w.Main = Main
w.Network = Network

w.Interface = {
	Form: { useForm },
	Theme: { useTheme },
	useTheme, useSidebar, useTable, useDialog, useDropdown, useToast,
	Breadcrumbs, Tabs, Tooltip, Accordion, Skeleton,
}

w.View = { Router }

w.Assets = {
	Icons: new Proxy({}, {
		get(_, name) {
			const actualName = name.startsWith('Fa6') ? 'Fa' + name.slice(3) : name
			const icon = iconCache[name] ?? Fa6Any[actualName] ?? Fa6Any[name]
			if (icon) {
				iconCache[name] = icon
				return icon
			}
			console.warn(`[Icons] icon not found: "${name}"`)
			return FallbackIcon
		}
	}),
	Charts: Charts
}

w.Utils = {
	Motion: motion.div,
	clsx,
	twMerge,
	reactUse: { ...useHooks },	
	reactHotkeys: { useHotkeys },
	dateFns,
	zustand,
	zod,
	Dnd: { ...DndCore, ...DndSortable, ...DndModifiers, ...DndUtilities },
}

w.Bootstrap = (A: any) => {
	ReactDOM.createRoot(document.getElementById('root')!).render(React.createElement(Main, null, React.createElement(A)))
}

// --- Expose to Window ---
console.log('[Runtime] Core initialized.', { 
	Network: Object.keys(w.Network), 
	Interface: Object.keys(w.Interface),
	Utils: Object.keys(w.Utils),
	View: Object.keys(w.View),
	Assets: Object.keys(w.Assets),
	Main: Main 
})

// users perimsons y 