import React, { useState } from 'react';
import {
  Search,
  Filter,
  Download,
  Eye,
  X,
  Plus,
  ArrowUpRight,
  Truck,
  Flame,
  Clock,
  Building2,
  Calendar,
  Layers,
  FileSpreadsheet,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import { Item, Warehouse, UserRole, UIStateType, StockStatus, InventoryTransaction } from '../../types/inventory';

interface ItemInventoryViewProps {
  items: Item[];
  warehouses: Warehouse[];
  transactions: InventoryTransaction[];
  currentRole: UserRole;
  uiState: UIStateType;
  selectedWarehouseFilter: string;
  onSelectWarehouseFilter: (wh: string) => void;
  onInitiatePRForItem: (item: Item) => void;
}

export const ItemInventoryView: React.FC<ItemInventoryViewProps> = ({
  items,
  warehouses,
  transactions,
  currentRole,
  uiState,
  selectedWarehouseFilter,
  onSelectWarehouseFilter,
  onInitiatePRForItem,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [selectedItemForDrawer, setSelectedItemForDrawer] = useState<Item | null>(null);
  const [activeDrawerTab, setActiveDrawerTab] = useState<'overview' | 'batches' | 'warehouses' | 'timeline' | 'history'>('overview');

  const canViewFinancials = !['Warehouse Operator'].includes(currentRole);

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.itemCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.binLocation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesWh = selectedWarehouseFilter === 'ALL' || item.warehouseId === selectedWarehouseFilter;
    const matchesStatus = statusFilter === 'ALL' || item.stockStatus === statusFilter;
    const matchesCat = categoryFilter === 'ALL' || item.category === categoryFilter;

    return matchesSearch && matchesWh && matchesStatus && matchesCat;
  });

  const handleExportCSV = () => {
    const headers = [
      'Item Code',
      'Item Name',
      'Category',
      'Warehouse',
      'Bin Location',
      'Available Qty',
      'Reserved Qty',
      'Issued Qty',
      'In Transit Qty',
      'UOM',
      'Average Rate',
      'Stock Value',
      'Min Stock',
      'Status',
      'Last Transaction',
    ];
    const rows = filteredItems.map((i) => [
      i.itemCode,
      `"${i.itemName}"`,
      i.category,
      i.warehouseName,
      i.binLocation,
      i.availableQuantity,
      i.reservedQuantity,
      i.issuedQuantity,
      i.inTransitQuantity,
      i.uom,
      i.averageRate,
      i.stockValue,
      i.minStock,
      i.stockStatus,
      i.lastTransactionDate,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Inventory_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 space-y-4 max-w-7xl mx-auto">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Global Search */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by item code, name, bin location..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-900 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Stock Statuses</option>
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
            <option value="Reserved">Reserved</option>
          </select>

          {/* Warehouse Filter */}
          <select
            value={selectedWarehouseFilter}
            onChange={(e) => onSelectWarehouseFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Warehouses</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="Raw Materials">Raw Materials</option>
            <option value="Electrical & Motors">Electrical & Motors</option>
            <option value="Mechanical Spares">Mechanical Spares</option>
            <option value="Chemicals & Lubricants">Chemicals & Lubricants</option>
            <option value="Hardware & Fasteners">Hardware & Fasteners</option>
            <option value="Electronics & Chips">Electronics & Chips</option>
            <option value="Finished Goods">Finished Goods</option>
          </select>
        </div>

        {/* Export Button */}
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>Export Stock Grid</span>
        </button>
      </div>

      {/* Main Stock Data Table (16 Columns) */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Item Code</th>
                <th className="py-2.5 px-3">Item Name</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Warehouse</th>
                <th className="py-2.5 px-3">Bin</th>
                <th className="py-2.5 px-3 text-right">Available Qty</th>
                <th className="py-2.5 px-3 text-right">Reserved</th>
                <th className="py-2.5 px-3 text-right">In Transit</th>
                <th className="py-2.5 px-3">Unit</th>
                <th className="py-2.5 px-3 text-right">Avg Rate</th>
                <th className="py-2.5 px-3 text-right">Stock Value</th>
                <th className="py-2.5 px-3 text-right">Min Stock</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Last Txn</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredItems.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => setSelectedItemForDrawer(item)}
                  className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                >
                  <td className="py-2 px-3 font-mono font-bold text-blue-700">{item.itemCode}</td>
                  <td className="py-2 px-3">
                    <div className="font-semibold text-slate-900 line-clamp-1">{item.itemName}</div>
                  </td>
                  <td className="py-2 px-3 text-slate-700">{item.category}</td>
                  <td className="py-2 px-3 text-slate-700 truncate max-w-[140px]">{item.warehouseName}</td>
                  <td className="py-2 px-3 font-mono text-slate-600">{item.binLocation}</td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                    {item.availableQuantity.toLocaleString()}
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-slate-500 tabular-nums">
                    {item.reservedQuantity}
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-blue-600 tabular-nums">
                    {item.inTransitQuantity}
                  </td>
                  <td className="py-2 px-3 font-mono text-slate-600">{item.uom}</td>
                  <td className="py-2 px-3 text-right font-mono text-slate-700 tabular-nums">
                    {canViewFinancials ? `₹${item.averageRate.toLocaleString()}` : '••••'}
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                    {canViewFinancials ? `₹${item.stockValue.toLocaleString()}` : '••••••••'}
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-slate-500 tabular-nums">{item.minStock}</td>
                  <td className="py-2 px-3">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        item.stockStatus === 'In Stock'
                          ? 'bg-emerald-50 text-emerald-700'
                          : item.stockStatus === 'Low Stock'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {item.stockStatus}
                    </span>
                  </td>
                  <td className="py-2 px-3 font-mono text-slate-400 text-[11px]">{item.lastTransactionDate}</td>
                  <td className="py-2 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setSelectedItemForDrawer(item)}
                      className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors"
                      title="Inspect Stock Dossier & Movement"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex justify-between items-center">
          <span>Showing {filteredItems.length} inventory items</span>
          <span className="font-mono text-[11px]">Real-time perpetual stock ledger balance</span>
        </div>
      </div>

      {/* ITEM STOCK DETAILS SLIDE-OVER DRAWER */}
      {selectedItemForDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs transition-opacity">
          <div className="w-full max-w-2xl bg-white shadow-2xl h-full flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-xs">
                    {selectedItemForDrawer.itemCode}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      selectedItemForDrawer.stockStatus === 'In Stock'
                        ? 'bg-emerald-50 text-emerald-700'
                        : selectedItemForDrawer.stockStatus === 'Low Stock'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {selectedItemForDrawer.stockStatus}
                  </span>
                </div>
                <h2 className="text-sm font-bold text-slate-900 mt-1">{selectedItemForDrawer.itemName}</h2>
              </div>
              <button
                onClick={() => setSelectedItemForDrawer(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Tabs */}
            <div className="flex items-center gap-1 px-4 border-b border-slate-200 bg-white text-xs">
              <button
                onClick={() => setActiveDrawerTab('overview')}
                className={`py-2 px-3 font-semibold border-b-2 transition-all ${
                  activeDrawerTab === 'overview'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Stock Valuation
              </button>
              <button
                onClick={() => setActiveDrawerTab('batches')}
                className={`py-2 px-3 font-semibold border-b-2 transition-all ${
                  activeDrawerTab === 'batches'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Batch / Lot Details ({selectedItemForDrawer.batches?.length || 1})
              </button>
              <button
                onClick={() => setActiveDrawerTab('warehouses')}
                className={`py-2 px-3 font-semibold border-b-2 transition-all ${
                  activeDrawerTab === 'warehouses'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Facility Breakdown
              </button>
              <button
                onClick={() => setActiveDrawerTab('timeline')}
                className={`py-2 px-3 font-semibold border-b-2 transition-all ${
                  activeDrawerTab === 'timeline'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Movement Ledger
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs text-slate-700">
              {activeDrawerTab === 'overview' && (
                <div className="space-y-4">
                  {/* Valuation Summary Tiles */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-3 bg-slate-50 rounded border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase block">Available Stock</span>
                      <span className="text-base font-bold font-mono text-slate-900 mt-0.5 block">
                        {selectedItemForDrawer.availableQuantity} {selectedItemForDrawer.uom}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase block">Reserved Stock</span>
                      <span className="text-base font-bold font-mono text-slate-600 mt-0.5 block">
                        {selectedItemForDrawer.reservedQuantity} {selectedItemForDrawer.uom}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase block">In-Transit Inward</span>
                      <span className="text-base font-bold font-mono text-blue-600 mt-0.5 block">
                        {selectedItemForDrawer.inTransitQuantity} {selectedItemForDrawer.uom}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase block">Stock Asset Value</span>
                      <span className="text-base font-bold font-mono text-emerald-700 mt-0.5 block">
                        {canViewFinancials ? `₹${selectedItemForDrawer.stockValue.toLocaleString()}` : '••••••••'}
                      </span>
                    </div>
                  </div>

                  {/* Metadata Specification */}
                  <div className="p-3.5 bg-slate-50 rounded border border-slate-200 space-y-2">
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">Item Engineering Specs</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-400">Category:</span>{' '}
                        <span className="font-semibold text-slate-800">{selectedItemForDrawer.category}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">SKU Barcode:</span>{' '}
                        <span className="font-mono font-semibold text-slate-800">{selectedItemForDrawer.sku}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">HSN/SAC Code:</span>{' '}
                        <span className="font-mono font-semibold text-slate-800">{selectedItemForDrawer.hsnSac}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Primary Facility:</span>{' '}
                        <span className="font-semibold text-slate-800">{selectedItemForDrawer.warehouseName}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Bin Location:</span>{' '}
                        <span className="font-mono font-semibold text-blue-700">{selectedItemForDrawer.binLocation}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Average Rate:</span>{' '}
                        <span className="font-mono font-semibold text-slate-800">
                          {canViewFinancials ? `₹${selectedItemForDrawer.averageRate.toLocaleString()}` : '••••'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Direct Reorder Prompt if low */}
                  {(selectedItemForDrawer.stockStatus === 'Low Stock' || selectedItemForDrawer.stockStatus === 'Out of Stock') && (
                    <div className="p-3.5 bg-amber-50 border border-amber-200 rounded flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <div>
                          <div className="font-bold text-amber-900">Stock Below Reorder Level ({selectedItemForDrawer.reorderLevel} {selectedItemForDrawer.uom})</div>
                          <div className="text-[11px] text-amber-700">Recommended economic replenishment: {selectedItemForDrawer.reorderQuantity} {selectedItemForDrawer.uom}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          onInitiatePRForItem(selectedItemForDrawer);
                          setSelectedItemForDrawer(null);
                        }}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded font-semibold text-xs hover:bg-blue-700 transition-colors shadow-xs"
                      >
                        Create Requisition
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeDrawerTab === 'batches' && (
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">Active Tracked Batches</h4>
                  <div className="border border-slate-200 rounded overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 font-semibold text-slate-700 border-b border-slate-200">
                        <tr>
                          <th className="py-2 px-3">Batch Number</th>
                          <th className="py-2 px-3 text-right">Quantity</th>
                          <th className="py-2 px-3">Mfg Date</th>
                          <th className="py-2 px-3">Expiry Date</th>
                          <th className="py-2 px-3">Bin Location</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedItemForDrawer.batches && selectedItemForDrawer.batches.length > 0 ? (
                          selectedItemForDrawer.batches.map((b, idx) => (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="py-2 px-3 font-mono font-bold text-blue-700">{b.batchNumber}</td>
                              <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                                {b.quantity} {selectedItemForDrawer.uom}
                              </td>
                              <td className="py-2 px-3 font-mono text-slate-600">{b.mfgDate}</td>
                              <td className="py-2 px-3 font-mono text-slate-600">{b.expiryDate}</td>
                              <td className="py-2 px-3 font-mono text-slate-600">{b.binLocation}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td className="py-2 px-3 font-mono font-bold text-blue-700">BT-DEFAULT-01</td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                              {selectedItemForDrawer.availableQuantity} {selectedItemForDrawer.uom}
                            </td>
                            <td className="py-2 px-3 font-mono text-slate-600">2026-06-01</td>
                            <td className="py-2 px-3 font-mono text-slate-600">2030-06-01</td>
                            <td className="py-2 px-3 font-mono text-slate-600">{selectedItemForDrawer.binLocation}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeDrawerTab === 'warehouses' && (
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">Facility Stock Allocations</h4>
                  <div className="space-y-2">
                    {warehouses.map((w) => {
                      const isAssigned = w.id === selectedItemForDrawer.warehouseId;
                      return (
                        <div key={w.id} className="p-3 bg-slate-50 border border-slate-200 rounded flex justify-between items-center">
                          <div>
                            <div className="font-semibold text-slate-900">{w.name} ({w.code})</div>
                            <div className="text-[11px] text-slate-400">{w.location}</div>
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-bold text-slate-900 block">
                              {isAssigned ? `${selectedItemForDrawer.availableQuantity} ${selectedItemForDrawer.uom}` : '0 Units'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {isAssigned ? selectedItemForDrawer.binLocation : 'No allocation'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeDrawerTab === 'timeline' && (
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">Stock Movement Audit Trail</h4>
                  <div className="space-y-2">
                    {transactions
                      .filter((t) => t.itemCode === selectedItemForDrawer.itemCode)
                      .map((txn) => (
                        <div key={txn.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-slate-500 text-[10px]">{txn.date}</span>
                              <span className="font-bold text-slate-800">{txn.transactionType}</span>
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono mt-0.5">Ref: {txn.referenceNumber}</div>
                          </div>
                          <div className="text-right">
                            <span
                              className={`font-mono font-bold text-xs block ${
                                txn.quantityIn > 0 ? 'text-emerald-700' : 'text-rose-700'
                              }`}
                            >
                              {txn.quantityIn > 0 ? `+${txn.quantityIn}` : `-${txn.quantityOut}`} {selectedItemForDrawer.uom}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">Balance: {txn.runningBalance}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => {
                  onInitiatePRForItem(selectedItemForDrawer);
                  setSelectedItemForDrawer(null);
                }}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium text-xs transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Reorder Item (Create PR)</span>
              </button>
              <button
                onClick={() => setSelectedItemForDrawer(null)}
                className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded font-medium text-xs hover:bg-slate-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
