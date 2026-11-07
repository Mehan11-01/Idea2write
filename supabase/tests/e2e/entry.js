import * as React from 'react'; import { createRoot } from 'react-dom/client'; import { createPortal } from 'react-dom'; import htm from './htm-mini.js';
window.React = React; window.ReactDOM = { createRoot, createPortal }; window.htm = { bind: (h) => htm(h) };
