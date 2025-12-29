import { lazy } from 'react';

/**
 * Lazy loaded routes for code splitting
 * Improves initial bundle size and load time
 */

export const Dashboard = lazy(() => import('../pages/Dashboard').then(m => ({ default: m.Dashboard })));
export const Analytics = lazy(() => import('../pages/Analytics').then(m => ({ default: m.Analytics })));
export const DeFi = lazy(() => import('../pages/DeFi').then(m => ({ default: m.DeFi })));
export const Governance = lazy(() => import('../pages/Governance').then(m => ({ default: m.Governance })));
export const Marketplace = lazy(() => import('../pages/Marketplace').then(m => ({ default: m.Marketplace })));
export const Advanced = lazy(() => import('../pages/Advanced').then(m => ({ default: m.Advanced })));
export const Activity = lazy(() => import('../pages/Activity').then(m => ({ default: m.Activity })));
export const Status = lazy(() => import('../pages/Status').then(m => ({ default: m.Status })));
export const Settings = lazy(() => import('../pages/Settings').then(m => ({ default: m.Settings })));

