
import React from 'react';
import { 
  LayoutDashboard, 
  Activity, 
  Ticket, 
  Flame, 
  Grid, 
  Shield, 
  TrendingUp, 
  RefreshCw, 
  Hexagon, 
  Plane 
} from 'lucide-react';

export const COLORS = {
  primary: '#2563eb',
  secondary: '#64748b',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  dark: '#0f172a',
};

export const Icons = {
  Dashboard: (props: any) => <LayoutDashboard {...props} />,
  Sports: (props: any) => <Activity {...props} />,
  Lotto: (props: any) => <Ticket {...props} />,
  Crash: (props: any) => <Flame {...props} />,
  Mines: (props: any) => <Grid {...props} />,
  Lock: (props: any) => <Shield {...props} />,
  Trending: (props: any) => <TrendingUp {...props} />,
  Sync: (props: any) => <RefreshCw {...props} />,
  Hex: (props: any) => <Hexagon {...props} />,
  Aviator: (props: any) => <Plane {...props} />,
};

