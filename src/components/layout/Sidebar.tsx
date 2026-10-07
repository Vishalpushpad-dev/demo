import React from 'react';
import {
  LayoutDashboard,
  Database,
  Package,
  FileSpreadsheet,
  ShoppingCart,
  CheckSquare,
  Truck,
  ArrowUpRight,
  Flame,
  Undo2,
  BookOpenCheck,
  BarChart3,
  Layers,
  ShieldCheck,
  SlidersHorizontal,
  ChevronRight,
  Boxes,
} from 'lucide-react';
import { UserRole } from '../../types/inventory';

export type NavSection =
  | 'dashboard'
  | 'masters'
  | 'stock'
  | 'purchase-requisition'
  | 'purchase-order'
  | 'po-approval'
  | 'grn'
  | 'item-issue'
  | 'item-consumption'
  | 'return-to-stock'
  | 'transactions'
  | 'reports';

interface SidebarProps {
  activeSection: NavSection;
  onNavigate: (section: NavSection) => void;
  currentRole: UserRole;
  pendingApprovalsCount: number;
  lowStockCount: number;
  openPoCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  onNavigate,
  currentRole,
  pendingApprovalsCount,
  lowStockCount,
  openPoCount,
}) => {
  // Navigation structure grouped logically for large enterprise ERP
  const navGroups = [
    {
      group: 'Overview',
      items: [
        {
          id: 'dashboard' as NavSection,
          label: 'Inventory Dashboard',
          icon: LayoutDashboard,
          badge: null,
          allowedRoles: [
            'Inventory Manager',
            'Store Manager',
            'Purchase Manager',
            'Purchase Executive',
            'Warehouse Operator',
            'Production Manager',
            'Finance/Admin',
            'System Administrator',
          ],
        },
      ],
    },
    {
      group: 'Master Data',
      items: [
        {
          id: 'masters' as NavSection,
          label: 'Inventory Masters',
          icon: Database,
          badge: null,
          allowedRoles: ['Inventory Manager', 'Purchase Manager', 'Finance/Admin', 'System Administrator'],
        },
      ],
    },
    {
      group: 'Stock & Inventory',
      items: [
        {
          id: 'stock' as NavSection,
          label: 'Item Inventory / Stock',
          icon: Package,
          badge: lowStockCount > 0 ? `${lowStockCount} Alert` : null,
          badgeColor: 'bg-amber-100 text-amber-800',
          allowedRoles: [
            'Inventory Manager',
            'Store Manager',
            'Purchase Manager',
            'Purchase Executive',
            'Warehouse Operator',
            'Production Manager',
            'Finance/Admin',
            'System Administrator',
          ],
        },
      ],
    },
    {
      group: 'Procurement Workflow',
      items: [
        {
          id: 'purchase-requisition' as NavSection,
          label: 'Purchase Requisition',
          icon: FileSpreadsheet,
          badge: null,
          allowedRoles: [
            'Purchase Manager',
            'Purchase Executive',
            'Production Manager',
            'Inventory Manager',
            'Finance/Admin',
            'System Administrator',
          ],
        },
        {
          id: 'purchase-order' as NavSection,
          label: 'Purchase Order (PO)',
          icon: ShoppingCart,
          badge: openPoCount > 0 ? `${openPoCount} Open` : null,
          badgeColor: 'bg-blue-100 text-blue-800',
          allowedRoles: [
            'Purchase Manager',
            'Purchase Executive',
            'Finance/Admin',
            'Inventory Manager',
            'System Administrator',
          ],
        },
        {
          id: 'po-approval' as NavSection,
          label: 'PO Approval Inbox',
          icon: CheckSquare,
          badge: pendingApprovalsCount > 0 ? `${pendingApprovalsCount} Pending` : null,
          badgeColor: 'bg-emerald-100 text-emerald-800',
          allowedRoles: ['Purchase Manager', 'Finance/Admin', 'System Administrator', 'Inventory Manager'],
        },
      ],
    },
    {
      group: 'Store Operations',
      items: [
        {
          id: 'grn' as NavSection,
          label: 'Goods Receipt Note (GRN)',
          icon: Truck,
          badge: null,
          allowedRoles: ['Store Manager', 'Warehouse Operator', 'Inventory Manager', 'Finance/Admin', 'System Administrator'],
        },
        {
          id: 'item-issue' as NavSection,
          label: 'Item Issue',
          icon: ArrowUpRight,
          badge: null,
          allowedRoles: [
            'Store Manager',
            'Warehouse Operator',
            'Production Manager',
            'Inventory Manager',
            'Finance/Admin',
            'System Administrator',
          ],
        },
        {
          id: 'item-consumption' as NavSection,
          label: 'Item Consumption',
          icon: Flame,
          badge: null,
          allowedRoles: [
            'Production Manager',
            'Store Manager',
            'Inventory Manager',
            'Finance/Admin',
            'System Administrator',
          ],
        },
        {
          id: 'return-to-stock' as NavSection,
          label: 'Return to Stock',
          icon: Undo2,
          badge: null,
          allowedRoles: ['Store Manager', 'Warehouse Operator', 'Inventory Manager', 'Finance/Admin', 'System Administrator'],
        },
      ],
    },
    {
      group: 'Ledger & Analytics',
      items: [
        {
          id: 'transactions' as NavSection,
          label: 'Inventory Transactions',
          icon: BookOpenCheck,
          badge: null,
          allowedRoles: [
            'Inventory Manager',
            'Finance/Admin',
            'Store Manager',
            'Purchase Manager',
            'Warehouse Operator',
            'System Administrator',
          ],
        },
        {
          id: 'reports' as NavSection,
          label: 'Stock Reports',
          icon: BarChart3,
          badge: null,
          allowedRoles: [
            'Inventory Manager',
            'Finance/Admin',
            'Purchase Manager',
            'Store Manager',
            'System Administrator',
          ],
        },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen shrink-0 border-r border-slate-800 select-none">
      {/* Brand & Suite Header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-slate-800 bg-slate-950/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center text-white font-display font-extrabold text-[13px] tracking-tighter ring-1 ring-white/10 shadow-lg shadow-blue-900/40">
            AX
          </div>
          <div>
            <div className="font-display text-[15px] font-bold text-white tracking-tight leading-none">Apex Enterprise</div>
            <div className="text-[9.5px] text-slate-400 font-semibold tracking-[0.18em] uppercase mt-1.5">
              Inventory &middot; SCM Suite
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Scroll Area */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4 text-xs">
        {navGroups.map((grp) => (
          <div key={grp.group} className="space-y-0.5">
            <div className="px-3 py-1 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
              {grp.group}
            </div>
            {grp.items.map((item) => {
              const isAllowed = item.allowedRoles.includes(currentRole);
              const isActive = activeSection === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  disabled={!isAllowed}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded text-left transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white font-medium shadow-sm'
                      : isAllowed
                      ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      : 'text-slate-600 cursor-not-allowed opacity-60'
                  }`}
                  title={!isAllowed ? `Restricted for role: ${currentRole}` : undefined}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : isAllowed ? 'text-slate-400' : 'text-slate-600'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge ? (
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                        isActive ? 'bg-white/20 text-white' : item.badgeColor || 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  ) : !isAllowed ? (
                    <span className="text-[9px] uppercase tracking-wider text-slate-600 font-mono">LOCKED</span>
                  ) : null}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Role & Access Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/80">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <div className="min-w-0">
              <div className="text-[11px] font-semibold text-slate-200 truncate">{currentRole}</div>
              <div className="text-[10px] text-slate-400 truncate">Role-Based Access Enforced</div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
