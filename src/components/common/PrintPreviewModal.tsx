import React from 'react';
import { X, Printer, Download, CheckCircle, Building2, Barcode } from 'lucide-react';
import { PurchaseOrder, GoodsReceiptNote, ItemIssue } from '../../types/inventory';

type PrintableDocType = 'PO' | 'GRN' | 'ISSUE';

interface PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  docType: PrintableDocType;
  data: PurchaseOrder | GoodsReceiptNote | ItemIssue | null;
}

export const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({
  isOpen,
  onClose,
  docType,
  data,
}) => {
  if (!isOpen || !data) return null;

  const handlePrint = () => {
    window.print();
  };

  const isPO = docType === 'PO';
  const isGRN = docType === 'GRN';
  const isIssue = docType === 'ISSUE';

  const po = isPO ? (data as PurchaseOrder) : null;
  const grn = isGRN ? (data as GoodsReceiptNote) : null;
  const issue = isIssue ? (data as ItemIssue) : null;

  const title = isPO
    ? 'PURCHASE ORDER VOUCHER'
    : isGRN
    ? 'GOODS RECEIPT NOTE & QC INSPECTION REPORT'
    : 'MATERIAL ISSUE DISPATCH SLIP';

  const docNumber = isPO ? po?.poNumber : isGRN ? grn?.grnNumber : issue?.issueNumber;
  const docDate = isPO ? po?.poDate : isGRN ? grn?.grnDate : issue?.issueDate;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden">
        {/* Action Header */}
        <div className="p-3 px-5 border-b border-slate-200 flex items-center justify-between bg-slate-50 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Document Print Preview:</span>
            <span className="text-sm font-bold font-mono text-slate-900">{docNumber}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Document</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Paper */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-100 flex justify-center">
          <div className="bg-white w-full max-w-3xl shadow-md border border-slate-200 p-8 text-slate-800 text-xs font-sans space-y-6">
            {/* Header: Company & Voucher Title */}
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-slate-900 text-white rounded font-bold text-xs flex items-center justify-center">
                    APX
                  </div>
                  <h1 className="text-lg font-black tracking-tight text-slate-900">APEX INDUSTRIAL SYSTEMS LTD</h1>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Plot 44, Tech Industrial Zone, Phase II · GSTIN: 27AAACA9999M1Z5</p>
                <p className="text-[11px] text-slate-500">Tel: +91 22 6100 8800 · Email: supplychain@apexindustrial.com</p>
              </div>

              <div className="text-right">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-blue-800 block">
                  {title}
                </span>
                <div className="text-base font-mono font-bold text-slate-900 mt-1">{docNumber}</div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">Date: {docDate}</div>
              </div>
            </div>

            {/* Document Metadata Grid */}
            <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded border border-slate-200 text-xs">
              {isPO && po && (
                <>
                  <div>
                    <span className="text-slate-400 text-[10px] font-bold uppercase block">Supplier / Vendor:</span>
                    <span className="font-bold text-slate-900 text-sm block">{po.supplierName}</span>
                    <span className="text-slate-600 block mt-0.5">Payment Terms: {po.paymentTerms}</span>
                    <span className="text-slate-600 block">Delivery Terms: {po.deliveryTerms}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] font-bold uppercase block">Shipping / Receiving Facility:</span>
                    <span className="font-semibold text-slate-900 block">{po.warehouseName}</span>
                    <span className="text-slate-600 block text-[11px] mt-0.5">{po.shippingAddress}</span>
                    <span className="text-slate-600 block text-[11px] font-mono mt-1">Expected Delivery: {po.expectedDeliveryDate}</span>
                  </div>
                </>
              )}

              {isGRN && grn && (
                <>
                  <div>
                    <span className="text-slate-400 text-[10px] font-bold uppercase block">Inward Details:</span>
                    <span className="font-bold text-slate-900 block">PO Ref: {grn.poNumber}</span>
                    <span className="text-slate-700 block">Supplier: {grn.supplierName}</span>
                    <span className="text-slate-600 block font-mono text-[11px]">Challan/Invoice: {grn.supplierInvoiceNo}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] font-bold uppercase block">Inspection Location & Officer:</span>
                    <span className="font-semibold text-slate-900 block">{grn.warehouseName}</span>
                    <span className="text-slate-700 block text-[11px]">Received By: {grn.receivedBy}</span>
                    <span className="text-emerald-700 font-bold block text-[11px] mt-1">QC Verdict: {grn.qcStatus}</span>
                  </div>
                </>
              )}

              {isIssue && issue && (
                <>
                  <div>
                    <span className="text-slate-400 text-[10px] font-bold uppercase block">Dispatched To:</span>
                    <span className="font-bold text-slate-900 text-sm block">{issue.department}</span>
                    <span className="text-slate-700 block font-mono">Work Order: {issue.workOrderRef}</span>
                    <span className="text-slate-600 block">Bearer / Operator: {issue.issuedTo}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] font-bold uppercase block">Issuing Store:</span>
                    <span className="font-semibold text-slate-900 block">{issue.warehouseName}</span>
                    <span className="text-slate-700 block text-[11px]">Authorized Storekeeper: {issue.requestedBy}</span>
                    <span className="text-slate-600 block text-[11px] mt-0.5">Reference Cost Center: {issue.referenceDepartment}</span>
                  </div>
                </>
              )}
            </div>

            {/* Line Items Table */}
            <div>
              <table className="w-full text-left text-xs border border-slate-200">
                <thead className="bg-slate-100 font-bold text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-2.5 w-8">#</th>
                    <th className="py-2 px-2.5">Item Code & Description</th>
                    <th className="py-2 px-2.5 text-right">Qty</th>
                    <th className="py-2 px-2.5">UOM</th>
                    {isPO && (
                      <>
                        <th className="py-2 px-2.5 text-right">Rate</th>
                        <th className="py-2 px-2.5 text-right">Tax%</th>
                        <th className="py-2 px-2.5 text-right">Amount</th>
                      </>
                    )}
                    {isGRN && (
                      <>
                        <th className="py-2 px-2.5 text-right">Accepted</th>
                        <th className="py-2 px-2.5 text-right">Rejected</th>
                        <th className="py-2 px-2.5">Batch / Lot</th>
                        <th className="py-2 px-2.5">Bin</th>
                      </>
                    )}
                    {isIssue && (
                      <>
                        <th className="py-2 px-2.5">Batch</th>
                        <th className="py-2 px-2.5">Bin</th>
                        <th className="py-2 px-2.5 text-right">Value (INR)</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal">
                  {isPO &&
                    po?.items.map((it, idx) => (
                      <tr key={it.id}>
                        <td className="py-2 px-2.5 text-slate-400">{idx + 1}</td>
                        <td className="py-2 px-2.5">
                          <div className="font-mono font-semibold text-slate-900">{it.itemCode}</div>
                          <div className="text-[11px] text-slate-500">{it.itemName}</div>
                        </td>
                        <td className="py-2 px-2.5 text-right font-mono font-medium">{it.quantity}</td>
                        <td className="py-2 px-2.5 text-slate-600">{it.uom}</td>
                        <td className="py-2 px-2.5 text-right font-mono">₹{it.rate.toLocaleString()}</td>
                        <td className="py-2 px-2.5 text-right font-mono">{it.taxPercent}%</td>
                        <td className="py-2 px-2.5 text-right font-mono font-semibold">₹{it.amount.toLocaleString()}</td>
                      </tr>
                    ))}

                  {isGRN &&
                    grn?.items.map((it, idx) => (
                      <tr key={it.id}>
                        <td className="py-2 px-2.5 text-slate-400">{idx + 1}</td>
                        <td className="py-2 px-2.5">
                          <div className="font-mono font-semibold text-slate-900">{it.itemCode}</div>
                          <div className="text-[11px] text-slate-500">{it.itemName}</div>
                        </td>
                        <td className="py-2 px-2.5 text-right font-mono font-medium">{it.receivedQuantity}</td>
                        <td className="py-2 px-2.5 text-slate-600">{it.uom}</td>
                        <td className="py-2 px-2.5 text-right font-mono text-emerald-700 font-bold">{it.acceptedQuantity}</td>
                        <td className="py-2 px-2.5 text-right font-mono text-rose-700">{it.rejectedQuantity}</td>
                        <td className="py-2 px-2.5 font-mono text-[11px]">{it.batchLotNumber}</td>
                        <td className="py-2 px-2.5 font-mono text-[11px]">{it.binLocation}</td>
                      </tr>
                    ))}

                  {isIssue &&
                    issue?.items.map((it, idx) => (
                      <tr key={it.id}>
                        <td className="py-2 px-2.5 text-slate-400">{idx + 1}</td>
                        <td className="py-2 px-2.5">
                          <div className="font-mono font-semibold text-slate-900">{it.itemCode}</div>
                          <div className="text-[11px] text-slate-500">{it.itemName}</div>
                        </td>
                        <td className="py-2 px-2.5 text-right font-mono font-bold text-slate-900">{it.issueQuantity}</td>
                        <td className="py-2 px-2.5 text-slate-600">{it.uom}</td>
                        <td className="py-2 px-2.5 font-mono text-[11px]">{it.batchLot}</td>
                        <td className="py-2 px-2.5 font-mono text-[11px]">{it.binLocation}</td>
                        <td className="py-2 px-2.5 text-right font-mono">₹{(it.issueQuantity * it.rate).toLocaleString()}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Financial Summary for PO */}
            {isPO && po && (
              <div className="flex justify-end">
                <div className="w-64 space-y-1.5 text-xs bg-slate-50 p-3 rounded border border-slate-200">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-mono">₹{po.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Discount:</span>
                    <span className="font-mono">-₹{po.discountAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Taxes (GST):</span>
                    <span className="font-mono">₹{po.taxAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Freight:</span>
                    <span className="font-mono">₹{po.freightCharges.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 border-t border-slate-300 pt-1.5 text-sm">
                    <span>Grand Total:</span>
                    <span className="font-mono">₹{po.grandTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Authorized Signatures & Seal */}
            <div className="grid grid-cols-3 gap-6 pt-10 border-t border-slate-200 text-center text-xs">
              <div className="space-y-1">
                <div className="h-10 border-b border-dashed border-slate-300"></div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Prepared By</span>
                <div className="text-slate-700 font-medium">Store Operations Lead</div>
              </div>
              <div className="space-y-1">
                <div className="h-10 border-b border-dashed border-slate-300"></div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Quality Verified</span>
                <div className="text-slate-700 font-medium">QC Inspector</div>
              </div>
              <div className="space-y-1">
                <div className="h-10 border-b border-dashed border-slate-300"></div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Authorized Signatory</span>
                <div className="text-slate-700 font-medium">Commercial / Plant Head</div>
              </div>
            </div>

            <div className="text-center text-[10px] text-slate-400 pt-2 border-t border-slate-100">
              This is a computer-generated ERP document from Apex Enterprise Suite. Physical stamp valid upon receipt.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
