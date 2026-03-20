import React from 'react';
import ReactDOM from 'react-dom/client';
import * as ReactQuery from '@tanstack/react-query';
import * as ReactRouter from 'react-router';

// Library (Logic, state, and providers)
import * as database from './library/database';
import * as authentication from './library/authentication';
import { useForm } from './library/form';
import { Main } from './library';
import * as theme from './library/theme';
import * as sidebar from './library/sidebar';
import * as router from './library/router';

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

// Expose to window object for "CDN-like" usage
(window as any).React = React;
(window as any).ReactDOM = ReactDOM;
(window as any).ReactQuery = ReactQuery;
(window as any).ReactRouter = ReactRouter;

// Library modules
(window as any).Database = database;
(window as any).Authentication = authentication;
(window as any).Form = { useForm };
(window as any).Icons = reacticons;
(window as any).Theme = theme;
(window as any).Sidebar = sidebar;
(window as any).Router = router;

// Components modules
(window as any).Dropdown = dropdown;
(window as any).Table = table;
(window as any).Dialog = dialog;
(window as any).Notification = notification;

// UI Extra
(window as any).Tabs = Tabs;
(window as any).Tooltip = { Tooltip };
(window as any).Accordion = Accordion;
(window as any).Motion = Motion;

// Logic Extra
(window as any).Hooks = { ...useHooks, useHotkeys };
(window as any).Utils = { cn };
(window as any).DateFns = dateFns;

// Main Wrapper
(window as any).Main = Main;

console.log('Pipelines Runtime Loaded (Router-Driven Metadata Ready)');