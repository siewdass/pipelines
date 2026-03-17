import React from 'react';
import ReactDOM from 'react-dom/client';
import * as ReactQuery from '@tanstack/react-query';

import * as ReactRouter from 'react-router';
import * as ReactData from './data';

// Expose to window object for "CDN-like" usage
(window as any).React = React;
(window as any).ReactDOM = ReactDOM;
(window as any).ReactQuery = ReactQuery;
(window as any).ReactRouter = ReactRouter;
(window as any).ReactData = ReactData;

console.log('Pipelines Vendor Bundle Loaded');
