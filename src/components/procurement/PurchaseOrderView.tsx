import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Printer,
  Truck,
  ArrowRight,
  Eye,
  CheckCircle2,
  XCircle,
  Building2,
  DollarSign,
  Calendar,
  Layers,
  FileSpreadsheet,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { PurchaseOrder, POItem, POStatus, POApprovalStatus, POGrnStatus, Item, Warehouse, Supplier, PurchaseRequisition, UserRole, UIStateType } from '../../types/inventory';

interface POViewProps {
  purchaseOrders: PurchaseOrder[];
  requisitions: PurchaseRequisition[];
  items: Item[];
  warehouses: Warehouse[];
  suppliers: Supplier[];
  currentRole: UserRole;
  uiState: UIStateType;
  onCreatePO: (po: PurchaseOrder) => void;
  onApprovePO: (poId: string) => void;
  onOpenPrintPreview: (po: PurchaseOrder) => void;
  onTriggerGRNFromPO: (po: PurchaseOrder) => void;
  initialPRForPO?: PurchaseRequisition | null;
  onClearInitialPR?: () => void;
}

export const PurchaseOrderView: React.FC<POViewProps> = ({
  purchaseOrders,
  requisitions,
  items,
  warehouses,
  suppliers,
  currentRole,
  uiState,
  onCreatePO,
  onApprovePO,
  onOpenPrintPreview,
  onTriggerGRNFromPO,
  initialPRForPO,
  onClearInitialPR,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [grnFilter, setGrnFilter] = useState('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPOForDrawer, setSelectedPOForDrawer] = useState<PurchaseOrder | null>(null);

  // Auto-open modal if an initial approved PR was passed for conversion
  React.useEffect(() => {
    if (initialPRForPO) {
      handleOpenCreateWithPR(initialPRForPO);
      if (onClearInitialPR) onClearInitialPR();
    }
  }, [initialPRForPO]);

  // Form State for PO Creation
  const [poHeader, setPoHeader] = useState({
    supplierId: suppliers[0]?.id || 'SUP-001',
    poDate: new Date().toISOString().split('T')[0],
    expectedDeliveryDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    warehouseId: 'WH-02',
    currency: 'INR',
    billingAddress: 'Apex ERP Solutions HQ, Industrial Phase II, Unit 12',
    shippingAddress: 'Raw Materials Gate 3, Plant A Building, Industrial Phase II',
    paymentTerms: 'Net 30 Days',
    deliveryTerms: 'FOR Destination (Freight Paid)',
    referencePrNumber: '',
    freightCharges: 5000,
    otherCharges: 0,
    notes: 'Standard manufacturing quality inspection required.',
  });

  const [poLineItems, setPoLineItems] = useState<POItem[]>([
    {
      id: 'LINE-1',
      itemId: items[0]?.id || 'ITM-001',
      itemCode: items[0]?.itemCode || 'RM-SS-316L-050',
      itemName: items[0]?.itemName || 'Stainless Steel Pipe',
      description: 'Standard PO line item',
      quantity: 200,
      receivedQuantity: 0,
      uom: items[0]?.uom || 'MTR',
      rate: items[0]?.averageRate || 1450,
      discountPercent: 2,
      taxPercent: 18,
      amount: 200 * (items[0]?.averageRate || 1450) * 0.98,
    },
  ]);

  const handleOpenCreateWithPR = (pr: PurchaseRequisition) => {
    const lines: POItem[] = pr.items.map((prItem, idx) => ({
      id: `PO-LINE-${idx + 1}`,
      itemId: prItem.itemId,
      itemCode: prItem.itemCode,
      itemName: prItem.itemName,
      description: prItem.description || prItem.itemName,
      quantity: prItem.quantity,
      receivedQuantity: 0,
      uom: prItem.uom,
      rate: prItem.estimatedRate,
      discountPercent: 0,
      taxPercent: 18,
      amount: prItem.quantity * prItem.estimatedRate,
    }));

    setPoHeader({
      ...poHeader,
      referencePrNumber: pr.prNumber,
      warehouseId: pr.items[0]?.warehouseId || 'WH-02',
      expectedDeliveryDate: pr.requiredDate,
    });
    setPoLineItems(lines);
    setIsCreateModalOpen(true);
  };

  const handleAddLine = () => {
    const defaultItem = items[0];
    const newLine: POItem = {
      id: `LINE-${Date.now()}`,
      itemId: defaultItem.id,
      itemCode: defaultItem.itemCode,
      itemName: defaultItem.itemName,
      description: '',
      quantity: 50,
      receivedQuantity: 0,
      uom: defaultItem.uom,
      rate: defaultItem.averageRate,
      discountPercent: 0,
      taxPercent: 18,
      amount: 50 * defaultItem.averageRate,
    };
    setPoLineItems([...poLineItems, newLine]);
  };

  const handleRemoveLine = (index: number) => {
    if (poLineItems.length > 1) {
      setPoLineItems(poLineItems.filter((_, i) => i !== index));
    }
  };

  const handleLineChange = (index: number, field: keyof POItem, val: any) => {
    const updated = [...poLineItems];
    (updated[index] as any)[field] = val;

    // Recalculate amount: (qty * rate) - discount%
    const base = updated[index].quantity * updated[index].rate;
    const disc = (base * (updated[index].discountPercent || 0)) / 100;
    updated[index].amount = base - disc;

    setPoLineItems(updated);
  };

  // Summaries
  const subtotal = poLineItems.reduce((acc, it) => acc + it.quantity * it.rate, 0);
  const discountTotal = poLineItems.reduce((acc, it) => acc + (it.quantity * it.rate * (it.discountPercent || 0)) / 100, 0);
  const taxableValue = subtotal - discountTotal;
  const taxTotal = poLineItems.reduce((acc, it) => {
    const lineTaxable = it.quantity * it.rate * (1 - (it.discountPercent || 0) / 100);
    return acc + (lineTaxable * (it.taxPercent || 18)) / 100;
  }, 0);
  const grandTotal = Math.round(taxableValue + taxTotal + poHeader.freightCharges + poHeader.otherCharges);
  const roundOff = grandTotal - (taxableValue + taxTotal + poHeader.freightCharges + poHeader.otherCharges);

  const handleSubmitPO = (e: React.FormEvent) => {
    e.preventDefault();
    const supObj = suppliers.find((s) => s.id === poHeader.supplierId);
    const whObj = warehouses.find((w) => w.id === poHeader.warehouseId);

    const newPO: PurchaseOrder = {
      id: `PO-${Date.now()}`,
      poNumber: `PO-2026-${String(purchaseOrders.length + 132).padStart(4, '0')}`,
      poDate: poHeader.poDate,
      referencePrNumber: poHeader.referencePrNumber || undefined,
      supplierId: poHeader.supplierId,
      supplierName: supObj?.supplierName || 'Apex Precision Alloys',
      currency: poHeader.currency,
      warehouseId: poHeader.warehouseId,
      warehouseName: whObj?.name || 'Raw Materials Store',
      expectedDeliveryDate: poHeader.expectedDeliveryDate,
      billingAddress: poHeader.billingAddress,
      shippingAddress: poHeader.shippingAddress,
      paymentTerms: poHeader.paymentTerms,
      deliveryTerms: poHeader.deliveryTerms,
      status: 'Sent',
      approvalStatus: 'Pending Approval',
      grnStatus: 'Pending',
      subtotal: subtotal,
      discountAmount: discountTotal,
      taxAmount: taxTotal,
      freightCharges: poHeader.freightCharges,
      otherCharges: poHeader.otherCharges,
      roundOff: roundOff,
      grandTotal: grandTotal,
      items: poLineItems,
      notes: poHeader.notes,
    };

    onCreatePO(newPO);
    setIsCreateModalOpen(false);
  };

  const filteredPOs = purchaseOrders.filter((po) => {
    const matchSearch =
      po.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.warehouseName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || po.status === statusFilter;
    const matchGrn = grnFilter === 'ALL' || po.grnStatus === grnFilter;

    return matchSearch && matchStatus && matchGrn;
  });

  const canApprove = ['Purchase Manager', 'Finance/Admin', 'System Administrator'].includes(currentRole);

  return (
    <div className="p-6 space-y-4">
      {/* Visual Pipeline Banner: PO -> GRN -> Stock */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 rounded-lg p-3.5 text-white flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-blue-300 font-semibold block">
            Procurement To Stock Inward Pipeline
          </span>
          <div className="flex items-center gap-2 mt-1 text-xs">
            <span className="font-bold text-white bg-blue-800/80 px-2 py-0.5 rounded border border-blue-700">
              1. Purchase Order (Commercial)
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-bold text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
              2. Goods Receipt Note (GRN)
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-bold text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
              3. Inventory Stock Ledger
            </span>
          </div>
        </div>
        <div className="text-right text-[11px] text-blue-200">
          POs automatically sync delivery receipt tolerances with Receiving Bay Dock
        </div>
      </div>

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
              placeholder="Search PO#, supplier, warehouse..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-900 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-700 focus:outline-none"
          >
            <option value="ALL">All PO Statuses</option>
            <option value="Sent">Sent / Active</option>
            <option value="Partially Received">Partially Received</option>
            <option value="Completed">Completed</option>
            <option value="Draft">Draft</option>
          </select>

          {/* GRN Status Filter */}
          <select
            value={grnFilter}
            onChange={(e) => setGrnFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-700 focus:outline-none"
          >
            <option value="ALL">All GRN Inward States</option>
            <option value="Pending">Pending GRN</option>
            <option value="Partial GRN">Partial GRN Received</option>
            <option value="Fully Received">Fully Received</option>
          </select>
        </div>

        {/* Create PO Button */}
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Create Purchase Order</span>
        </button>
      </div>

      {/* PO Master Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">PO Number</th>
                <th className="py-2.5 px-3">PO Date</th>
                <th className="py-2.5 px-3">Supplier Name</th>
                <th className="py-2.5 px-3">Target Warehouse</th>
                <th className="py-2.5 px-3">Delivery Due</th>
                <th className="py-2.5 px-3 text-right">Grand Total (INR)</th>
                <th className="py-2.5 px-3">Approval</th>
                <th className="py-2.5 px-3">GRN Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredPOs.map((po) => (
                <tr
                  key={po.id}
                  onClick={() => setSelectedPOForDrawer(po)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="py-2 px-3 font-mono font-bold text-blue-700">{po.poNumber}</td>
                  <td className="py-2 px-3 font-mono text-slate-600">{po.poDate}</td>
                  <td className="py-2 px-3">
                    <div className="font-semibold text-slate-900">{po.supplierName}</div>
                    <div className="text-[10px] text-slate-400">Terms: {po.paymentTerms}</div>
                  </td>
                  <td className="py-2 px-3 text-slate-700">{po.warehouseName}</td>
                  <td className="py-2 px-3 font-mono text-slate-700">{po.expectedDeliveryDate}</td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                    ₹{po.grandTotal.toLocaleString()}
                  </td>
                  <td className="py-2 px-3">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        po.approvalStatus === 'Approved'
                          ? 'bg-emerald-50 text-emerald-700'
                          : po.approvalStatus === 'Pending Approval'
                          ? 'bg-amber-50 text-amber-800'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {po.approvalStatus}
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        po.grnStatus === 'Fully Received'
                          ? 'bg-emerald-100 text-emerald-800'
                          : po.grnStatus === 'Partial GRN'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {po.grnStatus}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      {/* Receive GRN button if approved and not fully received */}
                      {po.approvalStatus === 'Approved' && po.grnStatus !== 'Fully Received' && (
                        <button
                          onClick={() => onTriggerGRNFromPO(po)}
                          className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium text-[11px] transition-colors flex items-center gap-1 shadow-xs"
                          title="Inward Goods against this Purchase Order"
                        >
                          <Truck className="w-3 h-3" />
                          <span>Receive GRN</span>
                        </button>
                      )}

                      {/* Print Preview Button */}
                      <button
                        onClick={() => onOpenPrintPreview(po)}
                        className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                        title="Print / View Purchase Order Voucher"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>

                      {/* Details Drawer Trigger */}
                      <button
                        onClick={() => setSelectedPOForDrawer(po)}
                        className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors"
                        title="View PO Line Breakdown"
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

      {/* CREATE PURCHASE ORDER MODAL (Header + Multi Lines + Financial Summary) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden">
            <div className="p-4 px-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h2 className="text-base font-bold text-slate-900">Create Commercial Purchase Order</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Issue legally binding commercial contract with line taxation and freight
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPO} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
              {/* Header Details */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h3 className="font-bold text-slate-900 uppercase tracking-wide text-xs">1. Order Header Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Approved Supplier</label>
                    <select
                      value={poHeader.supplierId}
                      onChange={(e) => setPoHeader({ ...poHeader, supplierId: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-slate-900 focus:outline-none"
                    >
                      {suppliers.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.supplierName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Target Receiving Warehouse</label>
                    <select
                      value={poHeader.warehouseId}
                      onChange={(e) => setPoHeader({ ...poHeader, warehouseId: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-slate-900 focus:outline-none"
                    >
                      {warehouses.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name} ({w.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Expected Delivery Date</label>
                    <input
                      type="date"
                      required
                      value={poHeader.expectedDeliveryDate}
                      onChange={(e) => setPoHeader({ ...poHeader, expectedDeliveryDate: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-mono text-slate-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Payment Terms</label>
                    <select
                      value={poHeader.paymentTerms}
                      onChange={(e) => setPoHeader({ ...poHeader, paymentTerms: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-slate-900 focus:outline-none"
                    >
                      <option value="Net 30 Days">Net 30 Days</option>
                      <option value="Net 45 Days">Net 45 Days</option>
                      <option value="Net 60 Days">Net 60 Days</option>
                      <option value="Immediate / Advance">Immediate / Advance</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 uppercase tracking-wide text-xs">
                    2. Commercial Line Items ({poLineItems.length})
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddLine}
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
                        <th className="py-2 px-2.5 w-60">Item</th>
                        <th className="py-2 px-2.5 w-24 text-right">Quantity</th>
                        <th className="py-2 px-2.5 w-16">UOM</th>
                        <th className="py-2 px-2.5 w-24 text-right">Unit Rate</th>
                        <th className="py-2 px-2.5 w-16 text-right">Disc%</th>
                        <th className="py-2 px-2.5 w-16 text-right">GST%</th>
                        <th className="py-2 px-2.5 w-28 text-right">Amount</th>
                        <th className="py-2 px-2.5 w-8 text-center">Del</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {poLineItems.map((line, idx) => (
                        <tr key={line.id} className="hover:bg-slate-50">
                          <td className="py-2 px-2.5 text-slate-400 font-mono">{idx + 1}</td>
                          <td className="py-2 px-2.5">
                            <select
                              value={line.itemId}
                              onChange={(e) => {
                                const sel = items.find((i) => i.id === e.target.value);
                                if (sel) {
                                  handleLineChange(idx, 'itemId', sel.id);
                                  handleLineChange(idx, 'itemCode', sel.itemCode);
                                  handleLineChange(idx, 'itemName', sel.itemName);
                                  handleLineChange(idx, 'rate', sel.averageRate);
                                }
                              }}
                              className="w-full px-2 py-1 border border-slate-300 rounded font-mono text-xs focus:outline-none"
                            >
                              {items.map((i) => (
                                <option key={i.id} value={i.id}>
                                  {i.itemCode} - {i.itemName.slice(0, 30)}...
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
                              onChange={(e) => handleLineChange(idx, 'quantity', Number(e.target.value))}
                              className="w-full px-2 py-1 border border-slate-300 rounded font-mono text-right focus:outline-none"
                            />
                          </td>
                          <td className="py-2 px-2.5 font-mono text-slate-600">{line.uom}</td>
                          <td className="py-2 px-2.5 text-right">
                            <input
                              type="number"
                              required
                              value={line.rate}
                              onChange={(e) => handleLineChange(idx, 'rate', Number(e.target.value))}
                              className="w-full px-2 py-1 border border-slate-300 rounded font-mono text-right focus:outline-none"
                            />
                          </td>
                          <td className="py-2 px-2.5 text-right">
                            <input
                              type="number"
                              value={line.discountPercent}
                              onChange={(e) => handleLineChange(idx, 'discountPercent', Number(e.target.value))}
                              className="w-full px-1 py-1 border border-slate-300 rounded font-mono text-right focus:outline-none"
                            />
                          </td>
                          <td className="py-2 px-2.5 text-right font-mono text-slate-700">{line.taxPercent}%</td>
                          <td className="py-2 px-2.5 text-right font-mono font-bold text-slate-900">
                            ₹{line.amount.toLocaleString()}
                          </td>
                          <td className="py-2 px-2.5 text-center">
                            {poLineItems.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveLine(idx)}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded"
                              >
                                ×
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial Calculation Summary */}
              <div className="flex justify-end">
                <div className="w-72 bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
                  <div className="flex justify-between text-slate-600">
                    <span>Base Subtotal:</span>
                    <span className="font-mono">₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Discount:</span>
                    <span className="font-mono">-₹{discountTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Calculated GST (18%):</span>
                    <span className="font-mono">₹{taxTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 items-center">
                    <span>Freight Charges:</span>
                    <input
                      type="number"
                      value={poHeader.freightCharges}
                      onChange={(e) => setPoHeader({ ...poHeader, freightCharges: Number(e.target.value) })}
                      className="w-20 px-1 py-0.5 border border-slate-300 rounded font-mono text-right bg-white"
                    />
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 border-t border-slate-300 pt-2 text-sm">
                    <span>Grand Total:</span>
                    <span className="font-mono text-blue-700">₹{grandTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Form Buttons */}
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
                  Submit Purchase Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PO DETAILS SLIDE-OVER DRAWER */}
      {selectedPOForDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs transition-opacity">
          <div className="w-full max-w-2xl bg-white shadow-2xl h-full flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm text-slate-900">{selectedPOForDrawer.poNumber}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                    {selectedPOForDrawer.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">PO Date: {selectedPOForDrawer.poDate}</p>
              </div>
              <button
                onClick={() => setSelectedPOForDrawer(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded border border-slate-200">
                <div>
                  <span className="text-slate-400 block">Supplier:</span>
                  <span className="font-bold text-slate-900">{selectedPOForDrawer.supplierName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Warehouse:</span>
                  <span className="font-semibold text-slate-800">{selectedPOForDrawer.warehouseName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Delivery Date:</span>
                  <span className="font-mono text-slate-900">{selectedPOForDrawer.expectedDeliveryDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Grand Total:</span>
                  <span className="font-bold font-mono text-blue-700 text-sm">
                    ₹{selectedPOForDrawer.grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-2 uppercase tracking-wide">Line Items</h4>
                <div className="border border-slate-200 rounded overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 font-semibold text-slate-700">
                      <tr>
                        <th className="py-2 px-3">Item Code</th>
                        <th className="py-2 px-3 text-right">Ordered Qty</th>
                        <th className="py-2 px-3 text-right">Received Qty</th>
                        <th className="py-2 px-3 text-right">Rate</th>
                        <th className="py-2 px-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedPOForDrawer.items.map((it) => (
                        <tr key={it.id}>
                          <td className="py-2 px-3 font-mono font-bold text-slate-900">{it.itemCode}</td>
                          <td className="py-2 px-3 text-right font-mono font-medium">{it.quantity}</td>
                          <td className="py-2 px-3 text-right font-mono text-emerald-700 font-bold">
                            {it.receivedQuantity}
                          </td>
                          <td className="py-2 px-3 text-right font-mono">₹{it.rate.toLocaleString()}</td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                            ₹{it.amount.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
              <div className="flex gap-2">
                <button
                  onClick={() => onOpenPrintPreview(selectedPOForDrawer)}
                  className="px-3 py-1.5 bg-slate-800 text-white rounded font-medium text-xs hover:bg-slate-900 flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Voucher</span>
                </button>
                {selectedPOForDrawer.approvalStatus === 'Approved' && selectedPOForDrawer.grnStatus !== 'Fully Received' && (
                  <button
                    onClick={() => {
                      onTriggerGRNFromPO(selectedPOForDrawer);
                      setSelectedPOForDrawer(null);
                    }}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded font-medium text-xs hover:bg-blue-700 flex items-center gap-1.5 shadow-xs"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Inward GRN</span>
                  </button>
                )}
              </div>

              <button
                onClick={() => setSelectedPOForDrawer(null)}
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
