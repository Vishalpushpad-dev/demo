import React from 'react';
import {
  Search,
  Building2,
  Workflow,
  FileCode2,
  Bell,
  ChevronDown,
  ShieldAlert,
  Layers,
  Sparkles,
  Printer,
} from 'lucide-react';
import { UserRole, UIStateType } from '../../types/inventory';

interface HeaderProps {
  currentSection: string;
  activeSubSection?: string;
  selectedWarehouse: string;
  onSelectWarehouse: (whId: string) => void;
  warehouses: { id: string; name: string }[];
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  uiState: UIStateType;
  onSelectUIState: (state: UIStateType) => void;
  onOpenBusinessFlow: () => void;
  onOpenDevSpec: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

const ROLES: UserRole[] = [
  'Inventory Manager',
  'Store Manager',
  'Purchase Manager',
  'Purchase Executive',
  'Warehouse Operator',
  'Production Manager',
  'Finance/Admin',
  'System Administrator',
];

export const Header: React.FC<HeaderProps> = ({
  currentSection,
  activeSubSection,
  selectedWarehouse,
  onSelectWarehouse,
  warehouses,
  currentRole,
  onSelectRole,
  uiState,
  onSelectUIState,
  onOpenBusinessFlow,
  onOpenDevSpec,
  searchQuery,
  onSearchChange,
}) => {
  return (
    <header className="h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between gap-3 sticky top-0 z-30">
      {/* Zone 1: Breadcrumbs & Section Title */}
      <div className="flex items-center gap-2 text-xs text-slate-500 shrink-0">
        <span className="font-semibold text-slate-900 tracking-tight flex items-center gap-1.5 text-sm">
          <span className="w-2 h-2 rounded-sm bg-blue-600 inline-block"></span>
          Apex ERP
        </span>
        <span className="text-slate-300">/</span>
        <span className="font-medium text-slate-700 capitalize">{currentSection.replace('-', ' ')}</span>
        {activeSubSection && (
          <>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900 font-semibold">{activeSubSection}</span>
          </>
        )}
      </div>

      {/* Zone 2: Warehouse Filter & Global Search */}
      <div className="flex items-center gap-2.5 flex-1 max-w-xl mx-2">
        {/* Warehouse Selector */}
        <div className="relative shrink-0 hidden md:flex items-center">
          <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
          <select
            value={selectedWarehouse}
            onChange={(e) => onSelectWarehouse(e.target.value)}
            className="pl-8 pr-6 py-1.5 text-xs font-medium bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-slate-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none transition-colors"
          >
            <option value="ALL">All Warehouses (Global)</option>
            {warehouses.map((wh) => (
              <option key={wh.id} value={wh.id}>
                {wh.name}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 pointer-events-none" />
        </div>

        {/* Global Search Bar */}
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search items, PO#, GRN#, batch, work order... (Ctrl+K)"
            className="w-full pl-8 pr-12 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
          <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 border border-slate-200 rounded px-1 bg-white">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Zone 3: Enterprise Action Tools, State & Role Switchers */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Interactive Business Flow Graph Trigger */}
        <button
          onClick={onOpenBusinessFlow}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded transition-colors whitespace-nowrap"
          title="Inspect Complete ERP Inventory Lifecycle Diagram"
        >
          <Workflow className="w-3.5 h-3.5 text-blue-600" />
          <span className="hidden lg:inline">Process Flow</span>
        </button>

        {/* Developer Specification Drawer Trigger */}
        <button
          onClick={onOpenDevSpec}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded transition-colors whitespace-nowrap"
          title="Inspect Screen Handover Specification Sheet"
        >
          <FileCode2 className="w-3.5 h-3.5 text-blue-600" />
          <span>Dev Specs</span>
        </button>

        {/* UI State Simulation Switcher */}
        <div className="relative hidden xl:flex items-center">
          <Layers className="w-3.5 h-3.5 text-slate-400 absolute left-2 pointer-events-none" />
          <select
            value={uiState}
            onChange={(e) => onSelectUIState(e.target.value as UIStateType)}
            className="pl-7 pr-5 py-1.5 text-xs font-medium bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded cursor-pointer appearance-none focus:outline-none"
            title="Simulate UI State for QA & Frontend Verification"
          >
            <option value="normal">State: Normal (Data)</option>
            <option value="loading">State: Loading Skeleton</option>
            <option value="empty">State: Empty / Zero Data</option>
            <option value="permission_restricted">State: Restricted RBAC</option>
          </select>
          <ChevronDown className="w-3 h-3 text-amber-600 absolute right-1.5 pointer-events-none" />
        </div>

        {/* Role-Based Access Control Switcher */}
        <div className="relative flex items-center">
          <select
            value={currentRole}
            onChange={(e) => onSelectRole(e.target.value as UserRole)}
            className="pl-2.5 pr-6 py-1.5 text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 rounded border border-slate-700 cursor-pointer appearance-none transition-colors"
            title="Switch User Persona to Test Role-Based Permissions"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3 h-3 text-slate-300 absolute right-2 pointer-events-none" />
        </div>

        {/* User Avatar */}
        <div className="flex items-center gap-2 pl-1 border-l border-slate-200 ml-1">
          <div className="w-7 h-7 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-xs font-bold text-slate-700" title={`Logged in as ${currentRole}`}>
            {currentRole.slice(0, 2).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
};
