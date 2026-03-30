import * as React from 'react';
import * as ReactDOM from 'react-dom/client';

// Visual & Logic
import * as Charts from 'recharts';

// Drag & Drop
import * as DndCore from '@dnd-kit/core';
import * as DndSortable from '@dnd-kit/sortable';
import * as DndModifiers from '@dnd-kit/modifiers';
import * as DndUtilities from '@dnd-kit/utilities';

// Network & Core Logic
import * as Network from './network';
import { useForm } from './library/form';
import { Main } from './library';
import { useTheme } from './library/theme';
import { useSidebar } from './library/sidebar';
import * as Router from './library/router';
import { Breadcrumbs } from './components/breadcrumbs';

// Components (Visual)
import { useDropdown } from './components/dropdown';
import { useTable } from './components/table';
import { useDialog } from './components/dialog';
import { useToast } from './components/notification';
import { Skeleton } from './components/skeleton';

// Extra Visual (Productivity & UI)
import { Tabs } from 'react-tabs';
import { Tooltip } from 'react-tooltip';
import { Accordion } from 'react-accessible-accordion';
import { motion } from 'framer-motion';

// Extra Logic (Hooks & Utils)
import * as useHooks from 'react-use';
import { useHotkeys } from 'react-hotkeys-hook';
import * as dateFns from 'date-fns';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { create as zustand } from 'zustand';
import { z as zod } from 'zod';

// Assets
import * as FaLegacy from "react-icons/fa";
import * as Fa6 from "react-icons/fa6";
import * as Hi2 from "react-icons/hi2";
import * as Fc from "react-icons/fc";

(window as any).React = React;
(window as any).ReactDOM = ReactDOM;
(window as any).Main = Main;
(window as any).Network = Network;

(window as any).Interface = {
	Form: { useForm },
	Theme: { useTheme },
	useTheme, useSidebar, useTable, useDialog, useDropdown, useToast,
	Breadcrumbs, Tabs, Tooltip, Accordion, Skeleton,
};

(window as any).View = { Router };
(window as any).Assets = { Icons: { ...FaLegacy, ...Fa6, ...Hi2, ...Fc }, Charts };

(window as any).Utils = {
	Motion: motion.div,
	clsx,
	twMerge,
	reactUse: { ...useHooks },	
	reactHotkeys: { useHotkeys },
	dateFns,
	zustand,
	zod,
	Dnd: { ...DndCore, ...DndSortable, ...DndModifiers, ...DndUtilities },
};

(window as any).Bootstrap = (A: any) => {
	ReactDOM.createRoot(document.getElementById('root')!).render(React.createElement(Main, null, React.createElement(A)));
}

// --- Expose to Window ---
console.log("[Runtime] Core initialized.", { 
	Network: Object.keys((window as any).Network), 
	Interface: Object.keys((window as any).Interface),
	Utils: Object.keys((window as any).Utils),
	View: Object.keys((window as any).View),
	Assets: Object.keys((window as any).Assets),
	Main: Main 
});

// users perimsons y 