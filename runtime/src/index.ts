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

// Main Wrapper
(window as any).Main = Main;

console.log('Pipelines Runtime Loaded (Router Ready)');