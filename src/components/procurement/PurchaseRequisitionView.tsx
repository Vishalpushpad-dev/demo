import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  ArrowRight,
  Eye,
  Trash2,
  Calendar,
  Building2,
  AlertCircle,
  Check,
  Download,
  Share2,
} from 'lucide-react';
import { PurchaseRequisition, PRItem, PRPriority, PRStatus, Item, Warehouse, Supplier, UserRole, UIStateType } from '../../types/inventory';

interface PRViewProps {
  requisitions: PurchaseRequisition[];
  items: Item[];
  warehouses: Warehouse[];
  suppliers: Supplier[];
  currentRole: UserRole;
  uiState: UIStateType;
  onCreatePR: (pr: PurchaseRequisition) => void;
  onApprovePR: (prId: string, notes?: string) => void;
  onRejectPR: (prId: string, notes?: string) => void;
  onConvertToPO: (pr: PurchaseRequisition) => void;
  initialItemForNewPR?: Item | null;
  onClearInitialItem?: () => void;
}

export const PurchaseRequisitionView: React.FC<PRViewProps> = ({
  requisitions,
  items,
  warehouses,
  suppliers,
  currentRole,
  uiState,
  onCreatePR,
  onApprovePR,
  onRejectPR,
  onConvertToPO,
  initialItemForNewPR,
  onClearInitialItem,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPRForDrawer, setSelectedPRForDrawer] = useState<PurchaseRequisition | null>(null);

  // Auto-open modal if an initial item was passed from dashboard or inventory
  React.useEffect(() => {
    if (initialItemForNewPR) {
      handleOpenCreateWithItem(initialItemForNewPR);
      if (onClearInitialItem) onClearInitialItem();
    }
  }, [initialItemForNewPR]);

  // Form state for Create PR
  const [prHeader, setPrHeader] = useState({
    requestedBy: 'Dinesh Kulkarni (Production Head)',
    department: 'CNC Machining Section',
    requiredDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    priority: 'High' as PRPriority,
    remarks: '',
  });

  const [prLineItems, setPrLineItems] = useState<PRItem[]>([
    {
      id: 'LINE-1',
      itemId: items[0]?.id || 'ITM-001',
      itemCode: items[0]?.itemCode || 'RM-SS-316L-050',
      itemName: items[0]?.itemName || 'Stainless Steel Pipe',
      description: 'Standard production procurement',
      quantity: 100,
      uom: items[0]?.uom || 'MTR',
      requiredDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      warehouseId: 'WH-02',
      preferredSupplier: 'Apex Precision Alloys & Steels Ltd',
      estimatedRate: items[0]?.averageRate || 1450,
      estimatedTotal: (items[0]?.averageRate || 1450) * 100,
      remarks: '',
    },
  ]);

  const handleOpenCreateWithItem = (item: Item) => {
    setPrLineItems([
      {
        id: `LINE-${Date.now()}`,
        itemId: item.id,
        itemCode: item.itemCode,
        itemName: item.itemName,
        description: `Replenishment order for ${item.itemName}`,
        quantity: item.reorderQuantity || 100,
        uom: item.uom,
        requiredDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
        warehouseId: item.warehouseId,
        preferredSupplier: suppliers[0]?.supplierName || 'Apex Precision Alloys',
        estimatedRate: item.averageRate,
        estimatedTotal: item.averageRate * (item.reorderQuantity || 100),
        remarks: 'Auto-triggered from low stock threshold reorder point',
      },
    ]);
    setIsCreateModalOpen(true);
  };

  const handleAddLineItem = () => {
    const defaultItem = items[0];
    const newLine: PRItem = {
      id: `LINE-${Date.now()}`,
      itemId: defaultItem.id,
      itemCode: defaultItem.itemCode,
      itemName: defaultItem.itemName,
      description: '',
      quantity: 50,
      uom: defaultItem.uom,
      requiredDate: prHeader.requiredDate,
      warehouseId: defaultItem.warehouseId,
      preferredSupplier: suppliers[0]?.supplierName || '',
      estimatedRate: defaultItem.averageRate,
      estimatedTotal: defaultItem.averageRate * 50,
    };
    setPrLineItems([...prLineItems, newLine]);
  };

  const handleRemoveLineItem = (index: number) => {
    if (prLineItems.length > 1) {
      setPrLineItems(prLineItems.filter((_, i) => i !== index));
    }
  };

  const handleItemSelectChange = (index: number, itemId: string) => {
    const selected = items.find((i) => i.id === itemId);
    if (!selected) return;

    const updated = [...prLineItems];
    updated[index] = {
      ...updated[index],
      itemId: selected.id,
      itemCode: selected.itemCode,
      itemName: selected.itemName,
      uom: selected.uom,
      warehouseId: selected.warehouseId,
      estimatedRate: selected.averageRate,
      estimatedTotal: selected.averageRate * updated[index].quantity,
    };
    setPrLineItems(updated);
  };

  const handleQuantityChange = (index: number, qty: number) => {
    const updated = [...prLineItems];
    updated[index].quantity = qty;
    updated[index].estimatedTotal = updated[index].estimatedRate * qty;
    setPrLineItems(updated);
  };

  const handleSubmitPR = (e: React.FormEvent) => {
    e.preventDefault();
    const totalQty = prLineItems.reduce((acc, it) => acc + it.quantity, 0);
    const totalEst = prLineItems.reduce((acc, it) => acc + it.estimatedTotal, 0);

    const newPR: PurchaseRequisition = {
      id: `PR-${Date.now()}`,
      prNumber: `PR-2026-${String(requisitions.length + 41).padStart(4, '0')}`,
      requestDate: new Date().toISOString().split('T')[0],
      requestedBy: prHeader.requestedBy,
      department: prHeader.department,
      requiredDate: prHeader.requiredDate,
      priority: prHeader.priority,
      status: 'Pending Approval',
      approvalStatus: 'Pending',
      totalQuantity: totalQty,
      totalEstimatedAmount: totalEst,
      items: prLineItems,
      remarks: prHeader.remarks,
    };

    onCreatePR(newPR);
    setIsCreateModalOpen(false);
  };

  const canApprove = ['Purchase Manager', 'Inventory Manager', 'Finance/Admin', 'System Administrator'].includes(
    currentRole
  );

  const filteredPRs = requisitions.filter((pr) => {
    const matchSearch =
      pr.prNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pr.requestedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pr.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || pr.status === statusFilter;
    const matchPriority = priorityFilter === 'ALL' || pr.priority === priorityFilter;

    return matchSearch && matchStatus && matchPriority;
  });

  return (
    <div className="p-6 space-y-4 max-w-7xl mx-auto">
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
              placeholder="Search PR#, requestor, department..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-900 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Requisition Statuses</option>
            <option value="Pending Approval">Pending Approval</option>
            <option value="Approved">Approved</option>
            <option value="Converted to PO">Converted to PO</option>
            <option value="Draft">Draft</option>
            <option value="Rejected">Rejected</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        {/* Create PR Button */}
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Create Purchase Requisition</span>
        </button>
      </div>

      {/* Requisition Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">PR Number</th>
                <th className="py-2.5 px-3">Request Date</th>
                <th className="py-2.5 px-3">Requested By & Dept</th>
                <th className="py-2.5 px-3">Required Date</th>
                <th className="py-2.5 px-3 text-right">Items Count</th>
                <th className="py-2.5 px-3 text-right">Total Qty</th>
                <th className="py-2.5 px-3 text-right">Est. Value (INR)</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Workflow Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredPRs.map((pr) => (
                <tr
                  key={pr.id}
                  onClick={() => setSelectedPRForDrawer(pr)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="py-2 px-3 font-mono font-bold text-blue-700">{pr.prNumber}</td>
                  <td className="py-2 px-3 font-mono text-slate-600">{pr.requestDate}</td>
                  <td className="py-2 px-3">
                    <div className="font-semibold text-slate-900">{pr.requestedBy}</div>
                    <div className="text-[10px] text-slate-400">{pr.department}</div>
                  </td>
                  <td className="py-2 px-3 font-mono text-slate-700">{pr.requiredDate}</td>
                  <td className="py-2 px-3 text-right font-mono text-slate-600">{pr.items.length}</td>
                  <td className="py-2 px-3 text-right font-mono font-medium text-slate-900 tabular-nums">
                    {pr.totalQuantity}
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                    ₹{pr.totalEstimatedAmount.toLocaleString()}
                  </td>
                  <td className="py-2 px-3">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        pr.priority === 'Critical'
                          ? 'bg-rose-100 text-rose-800'
                          : pr.priority === 'High'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {pr.priority}
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        pr.status === 'Approved'
                          ? 'bg-emerald-50 text-emerald-700'
                          : pr.status === 'Pending Approval'
                          ? 'bg-amber-50 text-amber-800'
                          : pr.status === 'Converted to PO'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {pr.status}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      {pr.status === 'Approved' && (
                        <button
                          onClick={() => onConvertToPO(pr)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium text-[11px] transition-colors flex items-center gap-1 shadow-xs"
                          title="Generate Commercial Purchase Order"
                        >
                          <span>Convert to PO</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}

                      {pr.status === 'Pending Approval' && canApprove && (
                        <button
                          onClick={() => onApprovePR(pr.id)}
                          className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium text-[11px] transition-colors"
                        >
                          Approve
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedPRForDrawer(pr)}
                        className="p-1 text-slate-400 hover:text-blue-600 rounded"
                        title="View Requisition Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE PURCHASE REQUISITION MODAL (Multi-Line Items) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden">
            <div className="p-4 px-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h2 className="text-base font-bold text-slate-900">Create New Purchase Requisition</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Indent material requisition across one or multiple items with estimated costing
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-200"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPR} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
              {/* Header Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Requested By</label>
                  <input
                    type="text"
                    required
                    value={prHeader.requestedBy}
                    onChange={(e) => setPrHeader({ ...prHeader, requestedBy: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Department</label>
                  <input
                    type="text"
                    required
                    value={prHeader.department}
                    onChange={(e) => setPrHeader({ ...prHeader, department: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Required On Site</label>
                  <input
                    type="date"
                    required
                    value={prHeader.requiredDate}
                    onChange={(e) => setPrHeader({ ...prHeader, requiredDate: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-mono text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Urgency Priority</label>
                  <select
                    value={prHeader.priority}
                    onChange={(e) => setPrHeader({ ...prHeader, priority: e.target.value as PRPriority })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-slate-900 focus:outline-none"
                  >
                    <option value="Critical">Critical (Immediate Production Stop)</option>
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low / Buffer Stock</option>
                  </select>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 uppercase tracking-wide text-xs">
                    Requisition Line Items ({prLineItems.length})
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddLineItem}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-semibold text-xs border border-slate-300 transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Row</span>
                  </button>
                </div>

                <div className="border border-slate-200 rounded overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 font-semibold text-slate-700 border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-2.5 w-6">#</th>
                        <th className="py-2 px-2.5 w-64">Item Code & Name</th>
                        <th className="py-2 px-2.5 w-24 text-right">Quantity</th>
                        <th className="py-2 px-2.5 w-16">UOM</th>
                        <th className="py-2 px-2.5 w-28 text-right">Est. Rate</th>
                        <th className="py-2 px-2.5 w-28 text-right">Line Total</th>
                        <th className="py-2 px-2.5">Preferred Supplier</th>
                        <th className="py-2 px-2.5 w-10 text-center">Del</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {prLineItems.map((line, idx) => (
                        <tr key={line.id} className="hover:bg-slate-50">
                          <td className="py-2 px-2.5 text-slate-400 font-mono">{idx + 1}</td>
                          <td className="py-2 px-2.5">
                            <select
                              value={line.itemId}
                              onChange={(e) => handleItemSelectChange(idx, e.target.value)}
                              className="w-full px-2 py-1 border border-slate-300 rounded font-mono text-xs focus:outline-none"
                            >
                              {items.map((i) => (
                                <option key={i.id} value={i.id}>
                                  {i.itemCode} - {i.itemName.slice(0, 32)}...
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="py-2 px-2.5 text-right">
                            <input
                              type="number"
                              min="1"
                              required
                              value={line.quantity}
                              onChange={(e) => handleQuantityChange(idx, Number(e.target.value))}
                              className="w-full px-2 py-1 border border-slate-300 rounded font-mono text-right focus:outline-none"
                            />
                          </td>
                          <td className="py-2 px-2.5 font-mono text-slate-600">{line.uom}</td>
                          <td className="py-2 px-2.5 text-right font-mono">₹{line.estimatedRate.toLocaleString()}</td>
                          <td className="py-2 px-2.5 text-right font-mono font-bold text-slate-900">
                            ₹{line.estimatedTotal.toLocaleString()}
                          </td>
                          <td className="py-2 px-2.5">
                            <input
                              type="text"
                              value={line.preferredSupplier}
                              onChange={(e) => {
                                const up = [...prLineItems];
                                up[idx].preferredSupplier = e.target.value;
                                setPrLineItems(up);
                              }}
                              placeholder="Optional vendor name"
                              className="w-full px-2 py-1 border border-slate-300 rounded text-xs focus:outline-none"
                            />
                          </td>
                          <td className="py-2 px-2.5 text-center">
                            {prLineItems.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveLineItem(idx)}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Subtotal bar */}
                <div className="flex justify-between items-center p-3 bg-slate-50 border border-slate-200 rounded font-semibold text-slate-900">
                  <span>
                    Total Requisition Estimated Value ({prLineItems.reduce((acc, it) => acc + it.quantity, 0)} Units)
                  </span>
                  <span className="font-mono text-sm text-blue-700">
                    ₹{prLineItems.reduce((acc, it) => acc + it.estimatedTotal, 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Business Justification / Work Order Notes</label>
                <textarea
                  rows={2}
                  value={prHeader.remarks}
                  onChange={(e) => setPrHeader({ ...prHeader, remarks: e.target.value })}
                  placeholder="State work order number, client commitment, or emergency rationale..."
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-slate-900 focus:outline-none"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold shadow-xs"
                >
                  Submit for Management Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PR DETAILS SLIDE-OVER DRAWER */}
      {selectedPRForDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs transition-opacity">
          <div className="w-full max-w-2xl bg-white shadow-2xl h-full flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm text-slate-900">{selectedPRForDrawer.prNumber}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                    {selectedPRForDrawer.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">Initiated: {selectedPRForDrawer.requestDate}</p>
              </div>
              <button
                onClick={() => setSelectedPRForDrawer(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded border border-slate-200">
                <div>
                  <span className="text-slate-400 block">Requestor:</span>
                  <span className="font-bold text-slate-900">{selectedPRForDrawer.requestedBy}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Department:</span>
                  <span className="font-semibold text-slate-800">{selectedPRForDrawer.department}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Target Date:</span>
                  <span className="font-mono text-slate-900">{selectedPRForDrawer.requiredDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Priority:</span>
                  <span className="font-bold text-amber-700">{selectedPRForDrawer.priority}</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-2 uppercase tracking-wide">Requisition Items</h4>
                <div className="border border-slate-200 rounded overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 font-semibold text-slate-700">
                      <tr>
                        <th className="py-2 px-3">Item Code</th>
                        <th className="py-2 px-3 text-right">Quantity</th>
                        <th className="py-2 px-3">UOM</th>
                        <th className="py-2 px-3 text-right">Est. Rate</th>
                        <th className="py-2 px-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedPRForDrawer.items.map((it) => (
                        <tr key={it.id}>
                          <td className="py-2 px-3 font-mono font-bold text-slate-900">{it.itemCode}</td>
                          <td className="py-2 px-3 text-right font-mono font-medium">{it.quantity}</td>
                          <td className="py-2 px-3 text-slate-600">{it.uom}</td>
                          <td className="py-2 px-3 text-right font-mono">₹{it.estimatedRate.toLocaleString()}</td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                            ₹{it.estimatedTotal.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {selectedPRForDrawer.remarks && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Remarks</span>
                  <p className="text-slate-700">{selectedPRForDrawer.remarks}</p>
                </div>
              )}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
              {selectedPRForDrawer.status === 'Approved' ? (
                <button
                  onClick={() => {
                    onConvertToPO(selectedPRForDrawer);
                    setSelectedPRForDrawer(null);
                  }}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded font-semibold text-xs hover:bg-blue-700 flex items-center gap-1.5 shadow-xs"
                >
                  <span>Convert to Purchase Order</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : selectedPRForDrawer.status === 'Pending Approval' && canApprove ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      onApprovePR(selectedPRForDrawer.id);
                      setSelectedPRForDrawer(null);
                    }}
                    className="px-3 py-1.5 bg-emerald-600 text-white rounded font-semibold text-xs hover:bg-emerald-700"
                  >
                    Approve PR
                  </button>
                  <button
                    onClick={() => {
                      onRejectPR(selectedPRForDrawer.id, 'Budget cap exceeded');
                      setSelectedPRForDrawer(null);
                    }}
                    className="px-3 py-1.5 bg-rose-600 text-white rounded font-semibold text-xs hover:bg-rose-700"
                  >
                    Reject PR
                  </button>
                </div>
              ) : (
                <span className="text-slate-500 font-mono text-[11px]">Audit status: {selectedPRForDrawer.status}</span>
              )}

              <button
                onClick={() => setSelectedPRForDrawer(null)}
                className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded text-xs"
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
