import React from 'react';
import ReactDOM from 'react-dom/client';
import * as ReactQuery from '@tanstack/react-query';

import * as ReactRouter from 'react-router';
import * as database from './data';
import * as auth from './auth';
import { useForm } from './hooks/useForm';

// Expose to window object for "CDN-like" usage
(window as any).React = React;
(window as any).ReactDOM = ReactDOM;
(window as any).ReactQuery = ReactQuery;
(window as any).ReactRouter = ReactRouter;
(window as any).database = database;
(window as any).auth = auth;
(window as any).form = useForm;

console.log('Pipelines Vendor Bundle Loaded');
