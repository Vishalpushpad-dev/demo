import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  X,
  Database,
  Layers,
  Building2,
  Users,
  Percent,
  Sliders,
  Check,
  Tag,
  AlertCircle,
} from 'lucide-react';
import { Item, Warehouse, Supplier, ItemType, StockStatus, UserRole, UIStateType } from '../../types/inventory';
import { ITEM_CATEGORIES, ITEM_GROUPS, UOM_LIST, RACK_BIN_LOCATIONS, TAX_CONFIGS } from '../../data/mockEnterpriseData';

interface MastersViewProps {
  items: Item[];
  warehouses: Warehouse[];
  suppliers: Supplier[];
  onAddItem: (item: Item) => void;
  onUpdateItem: (item: Item) => void;
  currentRole: UserRole;
  uiState: UIStateType;
  onViewItemStock?: (item: Item) => void;
}

type MasterTab =
  | 'item-master'
  | 'category'
  | 'group'
  | 'uom'
  | 'warehouse'
  | 'rack-bin'
  | 'supplier'
  | 'tax-config';

export const MastersView: React.FC<MastersViewProps> = ({
  items,
  warehouses,
  suppliers,
  onAddItem,
  onUpdateItem,
  currentRole,
  uiState,
  onViewItemStock,
}) => {
  const [activeTab, setActiveTab] = useState<MasterTab>('item-master');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  // Form State for Add / Edit Item
  const initialFormState: Omit<Item, 'id' | 'stockValue' | 'stockStatus' | 'lastTransactionDate' | 'availableQuantity' | 'reservedQuantity' | 'issuedQuantity' | 'inTransitQuantity'> = {
    itemCode: '',
    itemName: '',
    category: 'Raw Materials',
    group: 'Stainless Steels',
    itemType: 'Raw Material',
    uom: 'PCS',
    sku: '',
    hsnSac: '73044100',
    minStock: 50,
    maxStock: 500,
    reorderLevel: 80,
    reorderQuantity: 100,
    warehouseId: 'WH-01',
    warehouseName: 'Central Logistics Hub',
    binLocation: 'BIN-RM-A-04',
    rackLocation: 'RCK-01',
    batchTracking: true,
    lotTracking: true,
    serialNumberTracking: false,
    isActive: true,
    averageRate: 1000,
  };

  const [formData, setFormData] = useState(initialFormState);

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.itemCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesType = selectedType === 'ALL' || item.itemType === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({
      ...initialFormState,
      itemCode: `ITM-${String(items.length + 1).padStart(3, '0')}`,
      sku: `SKU-${Date.now().toString().slice(-6)}`,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: Item) => {
    setEditingItem(item);
    setFormData({
      itemCode: item.itemCode,
      itemName: item.itemName,
      category: item.category,
      group: item.group,
      itemType: item.itemType,
      uom: item.uom,
      sku: item.sku,
      hsnSac: item.hsnSac,
      minStock: item.minStock,
      maxStock: item.maxStock,
      reorderLevel: item.reorderLevel,
      reorderQuantity: item.reorderQuantity,
      warehouseId: item.warehouseId,
      warehouseName: item.warehouseName,
      binLocation: item.binLocation,
      rackLocation: item.rackLocation,
      batchTracking: item.batchTracking,
      lotTracking: item.lotTracking,
      serialNumberTracking: item.serialNumberTracking,
      isActive: item.isActive,
      averageRate: item.averageRate,
    });
    setIsModalOpen(true);
  };

  const handleSubmitItem = (e: React.FormEvent) => {
    e.preventDefault();
    const whObj = warehouses.find((w) => w.id === formData.warehouseId);
    const whName = whObj ? whObj.name : 'Central Logistics Hub';

    if (editingItem) {
      const updated: Item = {
        ...editingItem,
        ...formData,
        warehouseName: whName,
        stockValue: editingItem.availableQuantity * formData.averageRate,
      };
      onUpdateItem(updated);
    } else {
      const newItem: Item = {
        id: `ITM-${Date.now()}`,
        ...formData,
        warehouseName: whName,
        availableQuantity: 0,
        reservedQuantity: 0,
        issuedQuantity: 0,
        inTransitQuantity: 0,
        stockValue: 0,
        stockStatus: 'Out of Stock',
        lastTransactionDate: new Date().toISOString().split('T')[0],
      };
      onAddItem(newItem);
    }
    setIsModalOpen(false);
  };

  const handleExportCSV = () => {
    const headers = [
      'Item Code',
      'Item Name',
      'Category',
      'Group',
      'Item Type',
      'UOM',
      'SKU',
      'HSN/SAC',
      'Min Stock',
      'Max Stock',
      'Reorder Level',
      'Reorder Qty',
      'Warehouse',
      'Bin Location',
      'Batch Tracking',
      'Active',
    ];
    const rows = filteredItems.map((i) => [
      i.itemCode,
      `"${i.itemName}"`,
      i.category,
      i.group,
      i.itemType,
      i.uom,
      i.sku,
      i.hsnSac,
      i.minStock,
      i.maxStock,
      i.reorderLevel,
      i.reorderQuantity,
      i.warehouseName,
      i.binLocation,
      i.batchTracking ? 'Yes' : 'No',
      i.isActive ? 'Active' : 'Inactive',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Item_Master_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const canEditMasters = ['Inventory Manager', 'Purchase Manager', 'Finance/Admin', 'System Administrator'].includes(
    currentRole
  );

  return (
    <div className="p-6 space-y-5">
      {/* Sub-tab Navigation */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-1 overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setActiveTab('item-master')}
            className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
              activeTab === 'item-master'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Item Master ({items.length})
          </button>
          <button
            onClick={() => setActiveTab('category')}
            className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
              activeTab === 'category'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Item Category ({ITEM_CATEGORIES.length})
          </button>
          <button
            onClick={() => setActiveTab('group')}
            className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
              activeTab === 'group'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Item Group ({ITEM_GROUPS.length})
          </button>
          <button
            onClick={() => setActiveTab('uom')}
            className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
              activeTab === 'uom'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Units of Measurement (UOM)
          </button>
          <button
            onClick={() => setActiveTab('warehouse')}
            className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
              activeTab === 'warehouse'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Warehouses ({warehouses.length})
          </button>
          <button
            onClick={() => setActiveTab('rack-bin')}
            className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
              activeTab === 'rack-bin'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Rack & Bin Locations
          </button>
          <button
            onClick={() => setActiveTab('supplier')}
            className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
              activeTab === 'supplier'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Suppliers ({suppliers.length})
          </button>
          <button
            onClick={() => setActiveTab('tax-config')}
            className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
              activeTab === 'tax-config'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Tax Configuration
          </button>
        </div>
      </div>

      {/* 1. ITEM MASTER VIEW */}
      {activeTab === 'item-master' && (
        <div className="space-y-4">
          {/* Action Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search item code, name, SKU..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-900 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-700 focus:outline-none"
              >
                <option value="ALL">All Categories</option>
                {ITEM_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>

              {/* Item Type Filter */}
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-700 focus:outline-none"
              >
                <option value="ALL">All Types</option>
                <option value="Raw Material">Raw Material</option>
                <option value="Spare Part">Spare Part</option>
                <option value="Consumable">Consumable</option>
                <option value="Finished Good">Finished Good</option>
                <option value="Work In Progress">Work In Progress</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export Master</span>
              </button>

              <button
                onClick={handleOpenAddModal}
                disabled={!canEditMasters}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white rounded transition-colors shadow-xs ${
                  canEditMasters ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-400 cursor-not-allowed opacity-60'
                }`}
                title={!canEditMasters ? 'Requires Inventory Manager or Admin role' : undefined}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item Master</span>
              </button>
            </div>
          </div>

          {/* Item Master Data Table */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Item Code</th>
                    <th className="py-2.5 px-3">Item Name</th>
                    <th className="py-2.5 px-3">Category & Group</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">UOM</th>
                    <th className="py-2.5 px-3">HSN/SAC</th>
                    <th className="py-2.5 px-3 text-right">Min Stock</th>
                    <th className="py-2.5 px-3 text-right">Reorder Lvl</th>
                    <th className="py-2.5 px-3">Warehouse & Bin</th>
                    <th className="py-2.5 px-3 text-center">Batch Trk</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2 px-3 font-mono font-semibold text-slate-900">{item.itemCode}</td>
                      <td className="py-2 px-3">
                        <div className="font-semibold text-slate-900 line-clamp-1">{item.itemName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">SKU: {item.sku}</div>
                      </td>
                      <td className="py-2 px-3">
                        <div className="text-slate-800">{item.category}</div>
                        <div className="text-[10px] text-slate-400">{item.group}</div>
                      </td>
                      <td className="py-2 px-3">
                        <span className="text-[10px] font-medium bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                          {item.itemType}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-600">{item.uom}</td>
                      <td className="py-2 px-3 font-mono text-slate-500">{item.hsnSac}</td>
                      <td className="py-2 px-3 text-right font-mono text-slate-700 tabular-nums">{item.minStock}</td>
                      <td className="py-2 px-3 text-right font-mono text-blue-700 font-semibold tabular-nums">
                        {item.reorderLevel}
                      </td>
                      <td className="py-2 px-3">
                        <div className="text-slate-800">{item.warehouseName}</div>
                        <div className="text-[10px] font-mono text-slate-400">{item.binLocation}</div>
                      </td>
                      <td className="py-2 px-3 text-center">
                        {item.batchTracking ? (
                          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" title="Batch tracking enabled"></span>
                        ) : (
                          <span className="inline-block w-2 h-2 rounded-full bg-slate-300" title="No batch tracking"></span>
                        )}
                      </td>
                      <td className="py-2 px-3">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                            item.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {item.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {onViewItemStock && (
                            <button
                              onClick={() => onViewItemStock(item)}
                              className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors"
                              title="View Live Stock Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {canEditMasters && (
                            <button
                              onClick={() => handleOpenEditModal(item)}
                              className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                              title="Edit Item Master"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex justify-between items-center">
              <span>Showing {filteredItems.length} of {items.length} master items</span>
              <span className="font-mono text-[11px]">Apex Master Data Dictionary v4.2</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. CATEGORIES */}
      {activeTab === 'category' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Item Categories Master</h3>
              <p className="text-xs text-slate-500">Top-level product taxonomy and accounting asset classification</p>
            </div>
            <button className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700 transition-colors">
              + Add Category
            </button>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">Category Code</th>
                <th className="py-2.5 px-4">Category Name</th>
                <th className="py-2.5 px-4">Description</th>
                <th className="py-2.5 px-4 text-right">Registered Items</th>
                <th className="py-2.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {ITEM_CATEGORIES.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="py-2 px-4 font-mono font-semibold text-slate-900">{c.code}</td>
                  <td className="py-2 px-4 font-semibold text-slate-800">{c.name}</td>
                  <td className="py-2 px-4 text-slate-600">{c.description}</td>
                  <td className="py-2 px-4 text-right font-mono font-medium">{c.totalItems}</td>
                  <td className="py-2 px-4">
                    <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 3. ITEM GROUPS */}
      {activeTab === 'group' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Item Groups Master</h3>
              <p className="text-xs text-slate-500">Sub-category hierarchy and engineering product family trees</p>
            </div>
            <button className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700 transition-colors">
              + Add Item Group
            </button>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">Group Code</th>
                <th className="py-2.5 px-4">Group Name</th>
                <th className="py-2.5 px-4">Primary Category</th>
                <th className="py-2.5 px-4">Parent Family</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {ITEM_GROUPS.map((g) => (
                <tr key={g.id} className="hover:bg-slate-50">
                  <td className="py-2 px-4 font-mono font-semibold text-slate-900">{g.id}</td>
                  <td className="py-2 px-4 font-semibold text-slate-800">{g.name}</td>
                  <td className="py-2 px-4 text-blue-700 font-medium">{g.category}</td>
                  <td className="py-2 px-4 text-slate-500 font-mono">{g.parentGroup}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 4. UOM */}
      {activeTab === 'uom' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Units of Measurement (UOM) Configuration</h3>
              <p className="text-xs text-slate-500">Standard measurement units and decimal conversion precision</p>
            </div>
            <button className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700 transition-colors">
              + Configure UOM
            </button>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">UOM Code</th>
                <th className="py-2.5 px-4">Unit Name</th>
                <th className="py-2.5 px-4">Measurement Class</th>
                <th className="py-2.5 px-4 text-center">Decimal Precision</th>
                <th className="py-2.5 px-4 text-center">Base UOM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {UOM_LIST.map((u) => (
                <tr key={u.code} className="hover:bg-slate-50">
                  <td className="py-2 px-4 font-mono font-bold text-slate-900">{u.code}</td>
                  <td className="py-2 px-4 font-semibold text-slate-800">{u.name}</td>
                  <td className="py-2 px-4 text-slate-600">{u.type}</td>
                  <td className="py-2 px-4 text-center font-mono">{u.decimalPrecision} places</td>
                  <td className="py-2 px-4 text-center">
                    {u.isBaseUom ? (
                      <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                        Base
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">Derived</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 5. WAREHOUSES */}
      {activeTab === 'warehouse' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Warehouse Master Registry</h3>
              <p className="text-xs text-slate-500">Storage facilities, central hubs, transit depots, and security vaults</p>
            </div>
            <button className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700 transition-colors">
              + New Warehouse
            </button>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">Warehouse Code</th>
                <th className="py-2.5 px-4">Facility Name</th>
                <th className="py-2.5 px-4">Type</th>
                <th className="py-2.5 px-4">Location Address</th>
                <th className="py-2.5 px-4">Facility Manager</th>
                <th className="py-2.5 px-4 text-center">Capacity Load</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {warehouses.map((w) => (
                <tr key={w.id} className="hover:bg-slate-50">
                  <td className="py-2 px-4 font-mono font-bold text-slate-900">{w.code}</td>
                  <td className="py-2 px-4 font-semibold text-slate-800">{w.name}</td>
                  <td className="py-2 px-4 text-slate-600">{w.type}</td>
                  <td className="py-2 px-4 text-slate-500">{w.location}</td>
                  <td className="py-2 px-4 font-medium text-slate-800">{w.manager}</td>
                  <td className="py-2 px-4 text-center">
                    <span className="font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                      {w.capacityUtilization}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 6. RACK & BIN */}
      {activeTab === 'rack-bin' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Rack & Bin Spatial Coordinates</h3>
              <p className="text-xs text-slate-500">Aisle, rack, and shelf addresses for putaway optimization</p>
            </div>
            <button className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700 transition-colors">
              + Add Bin
            </button>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">Bin Code</th>
                <th className="py-2.5 px-4">Warehouse</th>
                <th className="py-2.5 px-4">Rack</th>
                <th className="py-2.5 px-4">Shelf Level</th>
                <th className="py-2.5 px-4 text-right">Max Load (KG)</th>
                <th className="py-2.5 px-4 text-center">Occupancy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {RACK_BIN_LOCATIONS.map((b) => (
                <tr key={b.binCode} className="hover:bg-slate-50">
                  <td className="py-2 px-4 font-mono font-bold text-blue-700">{b.binCode}</td>
                  <td className="py-2 px-4 font-mono text-slate-700">{b.warehouseCode}</td>
                  <td className="py-2 px-4 font-mono text-slate-600">{b.rack}</td>
                  <td className="py-2 px-4 text-slate-600">{b.shelf}</td>
                  <td className="py-2 px-4 text-right font-mono">{b.capacityKg} kg</td>
                  <td className="py-2 px-4 text-center font-mono font-semibold text-slate-800">{b.currentOccupancy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 7. SUPPLIERS */}
      {activeTab === 'supplier' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Approved Vendor & Supplier Master</h3>
              <p className="text-xs text-slate-500">Commercial supply partners with GSTIN, terms, and quality ratings</p>
            </div>
            <button className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700 transition-colors">
              + Add Supplier
            </button>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">Supplier Code</th>
                <th className="py-2.5 px-4">Supplier Legal Name</th>
                <th className="py-2.5 px-4">GSTIN / Tax ID</th>
                <th className="py-2.5 px-4">Payment Terms</th>
                <th className="py-2.5 px-4">City</th>
                <th className="py-2.5 px-4 text-center">Quality Rating</th>
                <th className="py-2.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {suppliers.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="py-2 px-4 font-mono font-bold text-slate-900">{s.supplierCode}</td>
                  <td className="py-2 px-4">
                    <div className="font-semibold text-slate-900">{s.supplierName}</div>
                    <div className="text-[10px] text-slate-400">{s.email}</div>
                  </td>
                  <td className="py-2 px-4 font-mono text-slate-600">{s.gstin}</td>
                  <td className="py-2 px-4 font-medium text-slate-800">{s.paymentTerms}</td>
                  <td className="py-2 px-4 text-slate-600">{s.city}</td>
                  <td className="py-2 px-4 text-center font-mono font-bold text-emerald-700">★ {s.rating}</td>
                  <td className="py-2 px-4">
                    <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 8. TAX CONFIGURATION */}
      {activeTab === 'tax-config' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Tax & GST Configuration</h3>
              <p className="text-xs text-slate-500">Statutory tax rates applied during Purchase Order creation and GRN valuation</p>
            </div>
            <button className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700 transition-colors">
              + New Tax Slab
            </button>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">Tax Code</th>
                <th className="py-2.5 px-4">Description</th>
                <th className="py-2.5 px-4 text-right">CGST %</th>
                <th className="py-2.5 px-4 text-right">SGST %</th>
                <th className="py-2.5 px-4 text-right">IGST %</th>
                <th className="py-2.5 px-4 text-center">Default Flag</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {TAX_CONFIGS.map((t) => (
                <tr key={t.code} className="hover:bg-slate-50">
                  <td className="py-2 px-4 font-mono font-bold text-slate-900">{t.code}</td>
                  <td className="py-2 px-4 font-semibold text-slate-800">{t.name}</td>
                  <td className="py-2 px-4 text-right font-mono">{t.cgstRate}%</td>
                  <td className="py-2 px-4 text-right font-mono">{t.sgstRate}%</td>
                  <td className="py-2 px-4 text-right font-mono font-bold text-blue-700">{t.igstRate}%</td>
                  <td className="py-2 px-4 text-center">
                    {t.isDefault ? (
                      <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">
                        Default
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ADD / EDIT ITEM MASTER MODAL (Complete 18+ Enterprise Fields) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden">
            <div className="p-4 px-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {editingItem ? `Edit Item Master: ${editingItem.itemCode}` : 'Create New Item Master'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Complete statutory, inventory control, and storage parameters
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitItem} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
              {/* Basic Details */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-1">
                  1. Identification & Classification
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Item Code <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.itemCode}
                      onChange={(e) => setFormData({ ...formData, itemCode: e.target.value })}
                      placeholder="e.g. RM-SS-316L-050"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-700 font-semibold mb-1">
                      Item Full Commercial Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.itemName}
                      onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                      placeholder="e.g. Stainless Steel Seamless Pipe 316L (50mm OD x 3mm)"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-slate-900 focus:outline-none"
                    >
                      {ITEM_CATEGORIES.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Item Group</label>
                    <input
                      type="text"
                      value={formData.group}
                      onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-slate-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Item Type</label>
                    <select
                      value={formData.itemType}
                      onChange={(e) => setFormData({ ...formData, itemType: e.target.value as ItemType })}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-slate-900 focus:outline-none"
                    >
                      <option value="Raw Material">Raw Material</option>
                      <option value="Spare Part">Spare Part</option>
                      <option value="Consumable">Consumable</option>
                      <option value="Finished Good">Finished Good</option>
                      <option value="Work In Progress">Work In Progress</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Unit of Measurement (UOM)</label>
                    <select
                      value={formData.uom}
                      onChange={(e) => setFormData({ ...formData, uom: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-slate-900 focus:outline-none"
                    >
                      {UOM_LIST.map((u) => (
                        <option key={u.code} value={u.code}>
                          {u.code} - {u.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">SKU / Barcode</label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      placeholder="SKU-XXXXXX"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono text-slate-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">HSN / SAC Code</label>
                    <input
                      type="text"
                      value={formData.hsnSac}
                      onChange={(e) => setFormData({ ...formData, hsnSac: e.target.value })}
                      placeholder="e.g. 73044100"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Stock Thresholds */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-1">
                  2. Inventory Control & Reorder Rules
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Min Safety Stock</label>
                    <input
                      type="number"
                      value={formData.minStock}
                      onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono text-slate-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Max Ceiling Stock</label>
                    <input
                      type="number"
                      value={formData.maxStock}
                      onChange={(e) => setFormData({ ...formData, maxStock: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono text-slate-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Reorder Level Trigger</label>
                    <input
                      type="number"
                      value={formData.reorderLevel}
                      onChange={(e) => setFormData({ ...formData, reorderLevel: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono text-slate-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Reorder Quantity (EOQ)</label>
                    <input
                      type="number"
                      value={formData.reorderQuantity}
                      onChange={(e) => setFormData({ ...formData, reorderQuantity: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Physical Storage & Valuation */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-1">
                  3. Physical Location & Valuation Cost
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Primary Warehouse</label>
                    <select
                      value={formData.warehouseId}
                      onChange={(e) => setFormData({ ...formData, warehouseId: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-slate-900 focus:outline-none"
                    >
                      {warehouses.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Bin Location Code</label>
                    <input
                      type="text"
                      value={formData.binLocation}
                      onChange={(e) => setFormData({ ...formData, binLocation: e.target.value })}
                      placeholder="e.g. BIN-RM-A-04"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono text-slate-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Average Cost Rate (INR)</label>
                    <input
                      type="number"
                      value={formData.averageRate}
                      onChange={(e) => setFormData({ ...formData, averageRate: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Tracking Flags */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-1">
                  4. Traceability & Operational Flags
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded border border-slate-200">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.batchTracking}
                      onChange={(e) => setFormData({ ...formData, batchTracking: e.target.checked })}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-semibold text-slate-800">Batch Tracking</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.lotTracking}
                      onChange={(e) => setFormData({ ...formData, lotTracking: e.target.checked })}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-semibold text-slate-800">Lot Tracking</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.serialNumberTracking}
                      onChange={(e) => setFormData({ ...formData, serialNumberTracking: e.target.checked })}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-semibold text-slate-800">Serial Tracking</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-semibold text-emerald-700">Active Status</span>
                  </label>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold transition-colors shadow-xs"
                >
                  {editingItem ? 'Save Changes' : 'Create Item Master'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
