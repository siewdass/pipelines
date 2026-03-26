import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import * as ReactQuery from '@tanstack/react-query';
import * as ReactRouter from 'react-router';

// Network & Core Logic
import * as NetworkBase from './network';
import { useForm } from './library/form';
import { Main } from './library';
import * as theme from './library/theme';
import * as sidebar from './library/sidebar';
import * as router from './library/router';
import { Breadcrumbs } from './components/breadcrumbs';

// Components (Visual)
import * as dropdown from './components/dropdown';
import * as table from './components/table';
import * as dialog from './components/dialog';

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

import * as FaLegacy from "react-icons/fa";
import * as Fa6 from "react-icons/fa6";
import { create as zustand } from 'zustand';
import { z as zod } from 'zod';

// --- New Unified Architecture ---

// 1. Network: Data & Authentication
const Network = {
	...NetworkBase,
};

// 2. Interface: Visual Components & Feedback
const Interface = {
	Form: { useForm },
	// Flattened Hooks
	useTheme: theme.useTheme,
	useSidebar: sidebar.useSidebar,
	useTable: table.useTable,
	useDialog: dialog.useDialog,
	useDropdown: dropdown.useDropdown,
	// Components
	Breadcrumbs: Breadcrumbs,
	Tabs: Tabs,
	Tooltip: Tooltip,
	Accordion: Accordion,
};

// 3. View: Routing Engine
const View = {
	Router: router,
};

// 4. Utils: Helpers & Hooks
const Utils = {
	Motion: motion.div,
	clsx,
	twMerge,
	reactUse: { ...useHooks },
	reactHotkeys: { useHotkeys },
	dateFns: dateFns,
	zustand,
	zod,
};

// --- Expose to Window ---
console.log("[Runtime] V2 Core initialized.", { 
	NetworkKeys: Object.keys(Network), 
	InterfaceKeys: Object.keys(Interface),
	UtilsKeys: Object.keys(Utils),
	View: Object.keys(View),
	Assets: Object.keys({ ...FaLegacy, ...Fa6 }),
	Main: Main 
});

(window as any).React = React;
(window as any).ReactDOM = ReactDOM;
(window as any).ReactQuery = ReactQuery;
(window as any).ReactRouter = ReactRouter;

(window as any).Network = Network;
(window as any).Interface = Interface;
(window as any).View = View;
(window as any).Assets = { Icons: { ...FaLegacy, ...Fa6 } };
(window as any).Utils = Utils;
(window as any).Main = Main;
(window as any).Bootstrap = (App: any) => {
	const container = document.getElementById('root');
	if (container) {
		ReactDOM.createRoot(container).render(
			React.createElement(Main, null, React.createElement(App))
		);
	}
};
