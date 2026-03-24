import React from 'react';
import ReactDOM from 'react-dom/client';
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
import * as notification from './components/notification';

// Extra Visual (Productivity & UI)
import * as Tabs from 'react-tabs';
import { Tooltip } from 'react-tooltip';
import * as Accordion from 'react-accessible-accordion';
import * as Motion from 'framer-motion';

// Extra Logic (Hooks & Utils)
import * as useHooks from 'react-use';
import { useHotkeys } from 'react-hotkeys-hook';
import * as dateFns from 'date-fns';
import { cn } from './utils/styles';

import * as Fa from "react-icons/fa6";

export const reacticons = Fa;

// --- New Unified Architecture ---

// 1. Network: Data & Authentication
const Network = {
	...NetworkBase,
};

// 2. Interface: Visual Components & Feedback
const Interface = {
	Form: { useForm },
	Theme: theme,
	Sidebar: sidebar,
	Icons: reacticons,
	Dropdown: dropdown,
	Table: table,
	Dialog: dialog,
	Notification: notification,
	Breadcrumbs: Breadcrumbs,
	Tabs: Tabs,
	Tooltip: { Tooltip },
	Accordion: Accordion,
	Motion: Motion,
};

// 3. View: Routing Engine
const View = {
	Router: router,
};

// 4. Utils: Helpers & Hooks
const Utils = {
	cn,
	Hooks: { ...useHooks, useHotkeys },
	Date: dateFns,
};

// --- Expose to Window ---

(window as any).Network = Network;
(window as any).Interface = Interface;
(window as any).View = View;
(window as any).Utils = Utils;

// Core React Helpers
(window as any).React = React;
(window as any).ReactDOM = ReactDOM;
(window as any).ReactQuery = ReactQuery;
(window as any).ReactRouter = ReactRouter;
(window as any).Main = Main;

console.log('Pipelines Runtime Loaded (Network, Interface & View Ready)');