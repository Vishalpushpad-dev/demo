import React, { useState } from 'react';
import {
  Boxes,
  DollarSign,
  PackageCheck,
  AlertTriangle,
  AlertOctagon,
  FileSpreadsheet,
  ShoppingCart,
  Truck,
  ArrowUpRight,
  Flame,
  ArrowRight,
  RefreshCw,
  Download,
  Calendar,
  Building2,
  Filter,
  CheckCircle,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { Item, Warehouse, PurchaseOrder, PurchaseRequisition, GoodsReceiptNote, UserRole, UIStateType } from '../../types/inventory';
import { NavSection } from '../layout/Sidebar';

interface DashboardProps {
  items: Item[];
  warehouses: Warehouse[];
  purchaseOrders: PurchaseOrder[];
  requisitions: PurchaseRequisition[];
  grns: GoodsReceiptNote[];
  currentRole: UserRole;
  uiState: UIStateType;
  selectedWarehouse: string;
  onSelectWarehouse: (wh: string) => void;
  onNavigate: (section: NavSection) => void;
  onQuickReorder: (item: Item) => void;
}

export const InventoryDashboard: React.FC<DashboardProps> = ({
  items,
  warehouses,
  purchaseOrders,
  requisitions,
  grns,
  currentRole,
  uiState,
  selectedWarehouse,
  onSelectWarehouse,
  onNavigate,
  onQuickReorder,
}) => {
  const [dateRange, setDateRange] = useState('Last 30 Days');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter items by warehouse and category
  const filteredItems = items.filter((item) => {
    const matchWh = selectedWarehouse === 'ALL' || item.warehouseId === selectedWarehouse;
    const matchCat = categoryFilter === 'ALL' || item.category === categoryFilter;
    return matchWh && matchCat;
  });

  // Calculate 10 core KPIs
  const totalItemsCount = filteredItems.length;
  const totalStockValue = filteredItems.reduce((acc, it) => acc + it.stockValue, 0);
  const availableStockUnits = filteredItems.reduce((acc, it) => acc + it.availableQuantity, 0);
  const lowStockItems = filteredItems.filter((it) => it.stockStatus === 'Low Stock');
  const outOfStockItems = filteredItems.filter((it) => it.stockStatus === 'Out of Stock');
  const pendingPRs = requisitions.filter((pr) => pr.status === 'Pending Approval' || pr.status === 'Draft');
  const pendingPOs = purchaseOrders.filter((po) => po.grnStatus !== 'Fully Received' && po.status !== 'Cancelled');
  const pendingGRNs = grns.filter((g) => g.status === 'Draft' || g.qcStatus === 'Pending Inspection');
  const itemsIssuedToday = 126; // Dispatched units today
  const itemsConsumedToday = 112; // Transformed units in production today

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleExport = () => {
    const headers = ['Item Code', 'Item Name', 'Category', 'Warehouse', 'Available Qty', 'Average Cost', 'Stock Value', 'Status'];
    const rows = filteredItems.map((i) => [
      i.itemCode,
      `"${i.itemName}"`,
      i.category,
      i.warehouseName,
      i.availableQuantity,
      i.averageRate,
      i.stockValue,
      i.stockStatus,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Apex_Inventory_Snapshot_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Permission check for financial valuation tiles
  const canViewFinancials = !['Warehouse Operator'].includes(currentRole);

  // UI STATE: Loading Skeleton
  if (uiState === 'loading') {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/3"></div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-200 rounded-lg"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-72 bg-slate-200 rounded-lg"></div>
          <div className="h-72 bg-slate-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  // UI STATE: Empty State
  if (uiState === 'empty' || filteredItems.length === 0) {
    return (
      <div className="p-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
          <Boxes className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-900">No Inventory Records Found</h3>
        <p className="text-xs text-slate-500 max-w-sm mt-1">
          No items match the active warehouse or category filter. Try clearing filters or creating new items in Item Master.
        </p>
        <button
          onClick={() => {
            onSelectWarehouse('ALL');
            setCategoryFilter('ALL');
          }}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition-colors"
        >
          Reset All Filters
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Top Filter & Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Date Range Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded border border-slate-200">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="Today">Today (Real-time)</option>
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="Q3 2026">Q3 2026 (Current Qtr)</option>
              <option value="FY 2026-27">FY 2026-27 (Year-to-Date)</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded border border-slate-200">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Item Categories</option>
              <option value="Raw Materials">Raw Materials</option>
              <option value="Electrical & Motors">Electrical & Motors</option>
              <option value="Mechanical Spares">Mechanical Spares</option>
              <option value="Chemicals & Lubricants">Chemicals & Lubricants</option>
              <option value="Hardware & Fasteners">Hardware & Fasteners</option>
              <option value="Electronics & Chips">Electronics & Chips</option>
              <option value="Finished Goods">Finished Goods</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded transition-colors ${
              isRefreshing ? 'opacity-70' : ''
            }`}
            title="Refresh ERP telemetry"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Snapshot</span>
          </button>
        </div>
      </div>

      {/* 10 Core KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* 1. Total Items */}
        <div
          onClick={() => onNavigate('masters')}
          className="bg-white p-3.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Total Items</span>
            <Boxes className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 tabular-nums">{totalItemsCount}</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span className="text-emerald-600 font-semibold">+4 added</span> this month
          </div>
        </div>

        {/* 2. Total Stock Value */}
        <div
          onClick={() => onNavigate('stock')}
          className="bg-white p-3.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Total Stock Value</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 tabular-nums">
            {canViewFinancials ? `₹${(totalStockValue / 100000).toFixed(2)}L` : '••••••••'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            {canViewFinancials ? (
              <span className="text-emerald-600 font-semibold">Moving Weighted Avg</span>
            ) : (
              <span className="text-slate-400 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Redacted
              </span>
            )}
          </div>
        </div>

        {/* 3. Available Stock */}
        <div
          onClick={() => onNavigate('stock')}
          className="bg-white p-3.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Available Stock</span>
            <PackageCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 tabular-nums">
            {availableStockUnits.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Ready for issuance</div>
        </div>

        {/* 4. Low Stock Items */}
        <div
          onClick={() => onNavigate('stock')}
          className={`p-3.5 rounded-lg border transition-all cursor-pointer shadow-xs group ${
            lowStockItems.length > 0
              ? 'bg-amber-50/50 border-amber-200 hover:border-amber-300'
              : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-amber-700 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Low Stock Items</span>
            <AlertTriangle className="w-4 h-4 text-amber-600 animate-pulse" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-900 tabular-nums">{lowStockItems.length}</div>
          <div className="text-[11px] text-amber-700 font-medium mt-1">Below reorder trigger</div>
        </div>

        {/* 5. Out of Stock Items */}
        <div
          onClick={() => onNavigate('stock')}
          className={`p-3.5 rounded-lg border transition-all cursor-pointer shadow-xs group ${
            outOfStockItems.length > 0 ? 'bg-rose-50/60 border-rose-200 hover:border-rose-300' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-rose-700 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Out of Stock</span>
            <AlertOctagon className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-xl font-bold font-mono text-rose-900 tabular-nums">{outOfStockItems.length}</div>
          <div className="text-[11px] text-rose-700 font-medium mt-1">Requires emergency PR</div>
        </div>

        {/* 6. Pending Purchase Requisitions */}
        <div
          onClick={() => onNavigate('purchase-requisition')}
          className="bg-white p-3.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Pending PRs</span>
            <FileSpreadsheet className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 tabular-nums">{pendingPRs.length}</div>
          <div className="text-[11px] text-purple-700 font-medium mt-1">1 Critical approval</div>
        </div>

        {/* 7. Pending Purchase Orders */}
        <div
          onClick={() => onNavigate('purchase-order')}
          className="bg-white p-3.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Pending POs</span>
            <ShoppingCart className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 tabular-nums">{pendingPOs.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Awaiting vendor inward</div>
        </div>

        {/* 8. Pending GRNs */}
        <div
          onClick={() => onNavigate('grn')}
          className="bg-white p-3.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Pending GRNs</span>
            <Truck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 tabular-nums">{pendingGRNs.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">At receiving bay</div>
        </div>

        {/* 9. Items Issued Today */}
        <div
          onClick={() => onNavigate('item-issue')}
          className="bg-white p-3.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Issued Today</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 tabular-nums">{itemsIssuedToday}</div>
          <div className="text-[11px] text-slate-400 mt-1">Across 2 Work Orders</div>
        </div>

        {/* 10. Items Consumed Today */}
        <div
          onClick={() => onNavigate('item-consumption')}
          className="bg-white p-3.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Consumed Today</span>
            <Flame className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 tabular-nums">{itemsConsumedToday}</div>
          <div className="text-[11px] text-slate-400 mt-1">Shop floor production</div>
        </div>
      </div>

      {/* Analytical Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend 1: Stock Value & Purchase Trend (SVG Visualizer) */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Stock Value & Procurement Inward Trend</h3>
              <p className="text-xs text-slate-500">6-Month historical valuation & GRN capitalization</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                <span className="text-slate-600">Stock Value</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="text-slate-600">PO Inward</span>
              </div>
            </div>
          </div>

          {/* Clean SVG Area/Line Chart */}
          <div className="h-56 w-full flex flex-col justify-end">
            <svg viewBox="0 0 500 180" className="w-full h-44 overflow-visible">
              <defs>
                <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="30" x2="500" y2="30" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="75" x2="500" y2="75" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="120" x2="500" y2="120" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="165" x2="500" y2="165" stroke="#e2e8f0" strokeWidth="1" />

              {/* Stock Value Area */}
              <polygon
                points="0,120 100,105 200,85 300,95 400,60 500,45 500,165 0,165"
                fill="url(#blueGrad)"
              />
              <polyline
                points="0,120 100,105 200,85 300,95 400,60 500,45"
                fill="none"
                stroke="#2563eb"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* PO Inward Trend Line */}
              <polyline
                points="0,140 100,130 200,110 300,115 400,90 500,75"
                fill="none"
                stroke="#10b981"
                strokeWidth="2"
                strokeDasharray="4 3"
                strokeLinecap="round"
              />

              {/* Data points */}
              {[[0,120],[100,105],[200,85],[300,95],[400,60],[500,45]].map(([x,y], i) => (
                <circle key={i} cx={x} cy={y} r="3.5" fill="#ffffff" stroke="#2563eb" strokeWidth="2" />
              ))}
            </svg>

            {/* X-Axis labels */}
            <div className="flex justify-between text-[11px] font-mono text-slate-400 mt-2 px-1">
              <span>May 2026</span>
              <span>Jun 2026</span>
              <span>Jul 2026</span>
              <span>Aug 2026</span>
              <span>Sep 2026</span>
              <span>Oct 2026</span>
            </div>
          </div>
        </div>

        {/* Trend 2: Issue vs Consumption Burn-Rate */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Material Issue vs Shopfloor Consumption</h3>
              <p className="text-xs text-slate-500">Weekly burn-rate comparison (units transformed)</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-500"></span>
                <span className="text-slate-600">Material Issued</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-500"></span>
                <span className="text-slate-600">Actual Consumed</span>
              </div>
            </div>
          </div>

          {/* Bar Chart Representation */}
          <div className="h-56 flex flex-col justify-end pt-4">
            <div className="grid grid-cols-5 gap-4 h-40 items-end px-2">
              {[
                { week: 'W36', issued: 82, consumed: 76 },
                { week: 'W37', issued: 95, consumed: 91 },
                { week: 'W38', issued: 70, consumed: 68 },
                { week: 'W39', issued: 110, consumed: 104 },
                { week: 'W40 (Current)', issued: 126, consumed: 112 },
              ].map((w, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5 h-full justify-end">
                  <div className="flex items-end gap-1.5 h-full w-full justify-center">
                    <div
                      style={{ height: `${(w.issued / 130) * 100}%` }}
                      className="w-4 bg-blue-600 rounded-t-sm transition-all hover:bg-blue-700"
                      title={`Issued: ${w.issued} units`}
                    ></div>
                    <div
                      style={{ height: `${(w.consumed / 130) * 100}%` }}
                      className="w-4 bg-amber-500 rounded-t-sm transition-all hover:bg-amber-600"
                      title={`Consumed: ${w.consumed} units`}
                    ></div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 text-center">{w.week}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Warehouse Spatial Capacity & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Warehouse-wise Distribution */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Warehouse Storage Capacity & Stock Distribution</h3>
              <p className="text-xs text-slate-500">Facility utilization and stored valuation</p>
            </div>
            <button
              onClick={() => onNavigate('masters')}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
            >
              <span>Manage Facilities</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3.5 mt-2">
            {warehouses.map((wh) => (
              <div key={wh.id} className="p-3 bg-slate-50 rounded border border-slate-200">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">{wh.code}</span>
                    <span className="font-semibold text-slate-800">{wh.name}</span>
                    <span className="text-[11px] text-slate-500 hidden sm:inline">({wh.type})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-slate-600">{wh.totalItemsCount} items</span>
                    <span className="font-mono font-semibold text-slate-900">
                      {canViewFinancials ? `₹${(wh.totalValue / 100000).toFixed(1)}L` : '••••'}
                    </span>
                    <span
                      className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded ${
                        wh.capacityUtilization > 80
                          ? 'bg-rose-100 text-rose-800'
                          : wh.capacityUtilization > 60
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {wh.capacityUtilization}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${wh.capacityUtilization}%` }}
                    className={`h-full rounded-full ${
                      wh.capacityUtilization > 80
                        ? 'bg-rose-500'
                        : wh.capacityUtilization > 60
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category-wise Stock Value Breakdown */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Category Asset Breakdown</h3>
          <p className="text-xs text-slate-500 mb-4">Stock value concentration by class</p>

          <div className="space-y-3 text-xs">
            {[
              { name: 'Raw Materials', val: '₹42.8L', percent: 36, color: 'bg-blue-600' },
              { name: 'Electronics & Chips', val: '₹31.2L', percent: 26, color: 'bg-indigo-600' },
              { name: 'Finished Goods', val: '₹22.5L', percent: 18, color: 'bg-emerald-600' },
              { name: 'Mechanical Spares', val: '₹14.1L', percent: 12, color: 'bg-amber-500' },
              { name: 'Chemicals & Lubes', val: '₹9.4L', percent: 8, color: 'bg-rose-500' },
            ].map((cat, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-slate-700">
                  <span className="font-medium">{cat.name}</span>
                  <span className="font-mono font-semibold text-slate-900">{canViewFinancials ? cat.val : '••••'}</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div style={{ width: `${cat.percent}%` }} className={`h-full ${cat.color} rounded-full`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actionable Stock Alerts Table (Low Stock & Out of Stock) */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Critical Stock Alerts & Replenishment Requisitions
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Items currently at or below minimum reorder threshold requiring purchase indent
            </p>
          </div>
          <button
            onClick={() => onNavigate('stock')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <span>View All Stock</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Item Code</th>
                <th className="py-2.5 px-3">Item Name</th>
                <th className="py-2.5 px-3">Warehouse / Bin</th>
                <th className="py-2.5 px-3 text-right">Available Qty</th>
                <th className="py-2.5 px-3 text-right">Reorder Level</th>
                <th className="py-2.5 px-3 text-right">Reorder Qty</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {[...outOfStockItems, ...lowStockItems].map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2 px-3 font-mono font-semibold text-slate-900">{item.itemCode}</td>
                  <td className="py-2 px-3">
                    <div className="font-medium text-slate-900">{item.itemName}</div>
                    <div className="text-[11px] text-slate-400">{item.category}</div>
                  </td>
                  <td className="py-2 px-3">
                    <span className="font-mono text-slate-700">{item.warehouseName}</span>
                    <div className="text-[10px] text-slate-400 font-mono">{item.binLocation}</div>
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-rose-700 tabular-nums">
                    {item.availableQuantity} {item.uom}
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-slate-600 tabular-nums">
                    {item.reorderLevel} {item.uom}
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-slate-600 tabular-nums">
                    {item.reorderQuantity} {item.uom}
                  </td>
                  <td className="py-2 px-3">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        item.stockStatus === 'Out of Stock'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {item.stockStatus}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right">
                    <button
                      onClick={() => onQuickReorder(item)}
                      className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium text-[11px] transition-colors shadow-xs"
                    >
                      Generate PR
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
