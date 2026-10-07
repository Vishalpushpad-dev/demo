import React from 'react';
import { X, ArrowRight, CheckCircle2, ChevronRight, CornerDownRight, PlayCircle } from 'lucide-react';
import { NavSection } from '../layout/Sidebar';

interface BusinessFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateSection: (section: NavSection) => void;
}

interface FlowStep {
  id: string;
  stepNumber: string;
  title: string;
  section: NavSection;
  role: string;
  docCode: string;
  description: string;
  input: string;
  output: string;
  stockEffect: string;
}

export const BusinessFlowModal: React.FC<BusinessFlowModalProps> = ({
  isOpen,
  onClose,
  onNavigateSection,
}) => {
  if (!isOpen) return null;

  const flowSteps: FlowStep[] = [
    {
      id: 'step-1',
      stepNumber: '01',
      title: 'Purchase Requisition (PR)',
      section: 'purchase-requisition',
      role: 'Production / Store / Maintenance',
      docCode: 'PR-2026-XXXX',
      description: 'Department identifies material shortage or replenishment trigger and submits multi-line request.',
      input: 'Shop Floor Need / Reorder Alert',
      output: 'Requisition Voucher in Draft/Pending status',
      stockEffect: 'No stock impact (Information only)',
    },
    {
      id: 'step-2',
      stepNumber: '02',
      title: 'PR Approval',
      section: 'purchase-requisition',
      role: 'Plant Head / Inventory Manager',
      docCode: 'PR Sign-off',
      description: 'Managerial verification of budget allocation, urgency, and current in-stock balance.',
      input: 'Pending PR',
      output: 'Approved PR (Ready for procurement)',
      stockEffect: 'No stock impact',
    },
    {
      id: 'step-3',
      stepNumber: '03',
      title: 'Purchase Order (PO)',
      section: 'purchase-order',
      role: 'Purchase Executive / Purchase Manager',
      docCode: 'PO-2026-XXXX',
      description: 'Vendor selection, price negotiations, tax codes, delivery terms, and commercial contract binding.',
      input: 'Approved PR items',
      output: 'Formal Purchase Order to Supplier',
      stockEffect: 'Increases In-Transit Quantity',
    },
    {
      id: 'step-4',
      stepNumber: '04',
      title: 'PO Approval',
      section: 'po-approval',
      role: 'VP Procurement / Finance Head',
      docCode: 'PO Authorization',
      description: 'Financial sanction and commercial sign-off above statutory threshold limits.',
      input: 'Draft Purchase Order',
      output: 'Authorized PO sent to Vendor',
      stockEffect: 'Committed procurement pipeline',
    },
    {
      id: 'step-5',
      stepNumber: '05',
      title: 'Goods Receipt Note (GRN)',
      section: 'grn',
      role: 'Warehouse Receiving Dock / Storekeeper',
      docCode: 'GRN-2026-XXXX',
      description: 'Material arrives at gate with delivery challan; physical inward verification and count check.',
      input: 'Supplier Shipment + Approved PO',
      output: 'Inward GRN Consignment record',
      stockEffect: 'Physical dock custody established',
    },
    {
      id: 'step-6',
      stepNumber: '06',
      title: 'Quality Check (QC) & Putaway',
      section: 'grn',
      role: 'Quality Inspector / Store Manager',
      docCode: 'QC Certificate & Bin Tag',
      description: 'Defect check against tolerances. Accepted qty tagged with Batch/Lot and routed to rack bin; rejected qty quarantined.',
      input: 'Inward Consignment',
      output: 'QC Disposition (Accepted vs Rejected)',
      stockEffect: 'Accepted stock ready for post',
    },
    {
      id: 'step-7',
      stepNumber: '07',
      title: 'Inventory Stock Posting',
      section: 'stock',
      role: 'Automated ERP Ledger Engine',
      docCode: 'TXN-2026-XXXX',
      description: 'GRN is posted. Available Stock increments immediately and an immutable transaction is written to ledger.',
      input: 'Posted GRN',
      output: 'Stock Ledger credit + PO status updated',
      stockEffect: '+ Increases Available Quantity',
    },
    {
      id: 'step-8',
      stepNumber: '08',
      title: 'Item Issue to Production',
      section: 'item-issue',
      role: 'Storekeeper & Shopfloor Operator',
      docCode: 'ISS-2026-XXXX',
      description: 'Store dispenses raw materials or spares against valid Work Order. System validates Available Stock and locks balance.',
      input: 'Approved Work Order / Indent',
      output: 'Material Issue Voucher + Dispatch',
      stockEffect: '- Decreases Available Quantity',
    },
    {
      id: 'step-9',
      stepNumber: '09',
      title: 'Item Consumption & Scrap',
      section: 'item-consumption',
      role: 'Machine Operator / Production Supv',
      docCode: 'CON-2026-XXXX',
      description: 'Actual raw material consumption and scrap/off-cut accounting logged during manufacturing run.',
      input: 'Issued Material Batch',
      output: 'WIP Cost Booking & Yield calculation',
      stockEffect: 'Transforms RM into Finished Good',
    },
    {
      id: 'step-10',
      stepNumber: '10',
      title: 'Return to Stock',
      section: 'return-to-stock',
      role: 'Shopfloor Lead & Store Manager',
      docCode: 'RET-2026-XXXX',
      description: 'Unused or excess materials returned to warehouse. Inspected for usability and returned to active stock balance.',
      input: 'Excess material from closed Work Order',
      output: 'Return to Stock Voucher',
      stockEffect: '+ Restores Available Quantity',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 px-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              Enterprise Supply Chain & Inventory Business Lifecycle
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Closed-loop ERP process flow connecting procurement, quality verification, stock ledger, and shop floor consumption
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Flow Timeline */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-900 flex items-center justify-between">
            <span className="font-medium">
              💡 Interactive Flow Navigator: Click on any step below to instantly jump to that module screen and inspect live ERP data!
            </span>
            <span className="text-[11px] font-mono text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">
              10-Stage ERP Pipeline
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {flowSteps.map((st, idx) => (
              <div
                key={st.id}
                onClick={() => {
                  onNavigateSection(st.section);
                  onClose();
                }}
                className="group relative p-3.5 rounded-lg border border-slate-200 hover:border-blue-500 bg-white hover:bg-blue-50/30 cursor-pointer transition-all shadow-xs hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-mono font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                      STAGE {st.stepNumber}
                    </span>
                    <span className="text-[10px] font-mono font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                      {st.docCode}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors flex items-center justify-between">
                    <span>{st.title}</span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                  </h3>

                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{st.description}</p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Primary Role</span>
                    <span className="font-medium text-slate-700 truncate block">{st.role}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Stock Impact</span>
                    <span
                      className={`font-semibold truncate block ${
                        st.stockEffect.includes('+')
                          ? 'text-emerald-700'
                          : st.stockEffect.includes('-')
                          ? 'text-rose-700'
                          : 'text-slate-600'
                      }`}
                    >
                      {st.stockEffect}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 px-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Apex ERP Flow Engine · ISO 9001 & 21 CFR Part 11 Audit Trail Compliant</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 text-white rounded font-medium hover:bg-slate-800 transition-colors"
          >
            Close Flow Guide
          </button>
        </div>
      </div>
    </div>
  );
};
