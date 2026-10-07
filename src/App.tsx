import React, { useState, useMemo } from 'react';
import { Construction } from 'lucide-react';

import { Sidebar, NavSection } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { InventoryDashboard } from './components/dashboard/InventoryDashboard';
import { MastersView } from './components/masters/MastersView';
import { ItemInventoryView } from './components/stock/ItemInventoryView';
import { PurchaseRequisitionView } from './components/procurement/PurchaseRequisitionView';
import { PurchaseOrderView } from './components/procurement/PurchaseOrderView';
import { BusinessFlowModal } from './components/common/BusinessFlowModal';
import { DevSpecDrawer } from './components/common/DevSpecDrawer';
import { PrintPreviewModal } from './components/common/PrintPreviewModal';

import { SCREEN_SPECIFICATIONS } from './data/screenSpecs';
import {
  INITIAL_WAREHOUSES,
  INITIAL_SUPPLIERS,
  INITIAL_ITEMS,
  INITIAL_PURCHASE_REQUISITIONS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_GRNS,
  INITIAL_TRANSACTIONS,
} from './data/mockEnterpriseData';
import {
  Item,
  PurchaseRequisition,
  PurchaseOrder,
  UserRole,
  UIStateType,
} from './types/inventory';

// Maps a NavSection to the key used in SCREEN_SPECIFICATIONS
const SPEC_KEY_MAP: Record<NavSection, string> = {
  dashboard: 'dashboard',
  masters: 'masters',
  stock: 'stock',
  'purchase-requisition': 'purchaseRequisition',
  'purchase-order': 'purchaseOrder',
  'po-approval': 'poApproval',
  grn: 'grn',
  'item-issue': 'itemIssue',
  'item-consumption': 'itemConsumption',
  'return-to-stock': 'returnToStock',
  transactions: 'transactions',
  reports: 'reports',
};

const SECTION_TITLES: Record<NavSection, string> = {
  dashboard: 'Inventory Dashboard',
  masters: 'Inventory Masters',
  stock: 'Item Inventory / Stock',
  'purchase-requisition': 'Purchase Requisition',
  'purchase-order': 'Purchase Order',
  'po-approval': 'PO Approval Inbox',
  grn: 'Goods Receipt Note',
  'item-issue': 'Item Issue',
  'item-consumption': 'Item Consumption',
  'return-to-stock': 'Return to Stock',
  transactions: 'Inventory Transactions',
  reports: 'Stock Reports',
};

const ComingSoon: React.FC<{ title: string }> = ({ title }) => (
  <div className="flex-1 flex items-center justify-center p-10">
    <div className="text-center max-w-md">
      <div className="w-14 h-14 rounded-xl bg-slate-200 flex items-center justify-center mx-auto mb-4">
        <Construction className="w-7 h-7 text-slate-500" />
      </div>
      <h2 className="text-lg font-bold text-slate-800">{title}</h2>
      <p className="text-sm text-slate-500 mt-2">
        This module screen is specified in the design system but not yet implemented in this prototype.
        Open the <span className="font-semibold">Dev Spec</span> panel from the header to view its full specification.
      </p>
    </div>
  </div>
);

const App: React.FC = () => {
  // ---- Domain state ----
  const [items, setItems] = useState<Item[]>(INITIAL_ITEMS);
  const warehouses = INITIAL_WAREHOUSES;
  const suppliers = INITIAL_SUPPLIERS;
  const [requisitions, setRequisitions] = useState<PurchaseRequisition[]>(INITIAL_PURCHASE_REQUISITIONS);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(INITIAL_PURCHASE_ORDERS);
  const grns = INITIAL_GRNS;
  const transactions = INITIAL_TRANSACTIONS;

  // ---- UI state ----
  const [activeSection, setActiveSection] = useState<NavSection>('dashboard');
  const [currentRole, setCurrentRole] = useState<UserRole>('Inventory Manager');
  const [uiState, setUiState] = useState<UIStateType>('normal');
  const [selectedWarehouse, setSelectedWarehouse] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // ---- Modals ----
  const [businessFlowOpen, setBusinessFlowOpen] = useState(false);
  const [devSpecOpen, setDevSpecOpen] = useState(false);
  const [printPreview, setPrintPreview] = useState<PurchaseOrder | null>(null);

  // ---- Cross-screen hand-off state ----
  const [initialItemForNewPR, setInitialItemForNewPR] = useState<Item | null>(null);
  const [initialPRForPO, setInitialPRForPO] = useState<PurchaseRequisition | null>(null);

  // ---- Derived counts for the sidebar badges ----
  const lowStockCount = useMemo(
    () => items.filter((i) => i.stockStatus === 'Low Stock' || i.stockStatus === 'Out of Stock').length,
    [items],
  );
  const pendingApprovalsCount = useMemo(
    () => purchaseOrders.filter((po) => po.approvalStatus === 'Pending Approval').length,
    [purchaseOrders],
  );
  const openPoCount = useMemo(
    () => purchaseOrders.filter((po) => po.grnStatus !== 'Fully Received' && po.status !== 'Cancelled').length,
    [purchaseOrders],
  );

  const handleNavigate = (section: NavSection) => {
    setActiveSection(section);
    setSearchQuery('');
  };

  // Start a PR for a specific item (from dashboard reorder / stock view)
  const initiatePRForItem = (item: Item) => {
    setInitialItemForNewPR(item);
    setActiveSection('purchase-requisition');
  };

  // ---- PR handlers ----
  const createPR = (pr: PurchaseRequisition) => setRequisitions((prev) => [pr, ...prev]);

  const setPRStatus = (prId: string, status: PurchaseRequisition['status'], notes?: string) =>
    setRequisitions((prev) =>
      prev.map((pr) =>
        pr.id === prId
          ? {
              ...pr,
              status,
              approvalStatus: status === 'Approved' ? 'Approved' : status === 'Rejected' ? 'Rejected' : pr.approvalStatus,
              approvalNotes: notes ?? pr.approvalNotes,
            }
          : pr,
      ),
    );

  const approvePR = (prId: string, notes?: string) => setPRStatus(prId, 'Approved', notes);
  const rejectPR = (prId: string, notes?: string) => setPRStatus(prId, 'Rejected', notes);

  const convertToPO = (pr: PurchaseRequisition) => {
    setInitialPRForPO(pr);
    setActiveSection('purchase-order');
  };

  // ---- PO handlers ----
  const createPO = (po: PurchaseOrder) => setPurchaseOrders((prev) => [po, ...prev]);

  const approvePO = (poId: string) =>
    setPurchaseOrders((prev) =>
      prev.map((po) => (po.id === poId ? { ...po, approvalStatus: 'Approved', status: po.status === 'Draft' ? 'Sent' : po.status } : po)),
    );

  const triggerGRNFromPO = (_po: PurchaseOrder) => setActiveSection('grn');

  // ---- Item master handlers ----
  const addItem = (item: Item) => setItems((prev) => [item, ...prev]);
  const updateItem = (item: Item) => setItems((prev) => prev.map((i) => (i.id === item.id ? item : i)));
  const viewItemStock = (_item: Item) => setActiveSection('stock');

  const activeSpec = SCREEN_SPECIFICATIONS[SPEC_KEY_MAP[activeSection]];

  const renderMain = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <InventoryDashboard
            items={items}
            warehouses={warehouses}
            purchaseOrders={purchaseOrders}
            requisitions={requisitions}
            grns={grns}
            currentRole={currentRole}
            uiState={uiState}
            selectedWarehouse={selectedWarehouse}
            onSelectWarehouse={setSelectedWarehouse}
            onNavigate={handleNavigate}
            onQuickReorder={initiatePRForItem}
          />
        );
      case 'masters':
        return (
          <MastersView
            items={items}
            warehouses={warehouses}
            suppliers={suppliers}
            onAddItem={addItem}
            onUpdateItem={updateItem}
            currentRole={currentRole}
            uiState={uiState}
            onViewItemStock={viewItemStock}
          />
        );
      case 'stock':
        return (
          <ItemInventoryView
            items={items}
            warehouses={warehouses}
            transactions={transactions}
            currentRole={currentRole}
            uiState={uiState}
            selectedWarehouseFilter={selectedWarehouse}
            onSelectWarehouseFilter={setSelectedWarehouse}
            onInitiatePRForItem={initiatePRForItem}
          />
        );
      case 'purchase-requisition':
        return (
          <PurchaseRequisitionView
            requisitions={requisitions}
            items={items}
            warehouses={warehouses}
            suppliers={suppliers}
            currentRole={currentRole}
            uiState={uiState}
            onCreatePR={createPR}
            onApprovePR={approvePR}
            onRejectPR={rejectPR}
            onConvertToPO={convertToPO}
            initialItemForNewPR={initialItemForNewPR}
            onClearInitialItem={() => setInitialItemForNewPR(null)}
          />
        );
      case 'purchase-order':
      case 'po-approval':
        return (
          <PurchaseOrderView
            purchaseOrders={purchaseOrders}
            requisitions={requisitions}
            items={items}
            warehouses={warehouses}
            suppliers={suppliers}
            currentRole={currentRole}
            uiState={uiState}
            onCreatePO={createPO}
            onApprovePO={approvePO}
            onOpenPrintPreview={setPrintPreview}
            onTriggerGRNFromPO={triggerGRNFromPO}
            initialPRForPO={initialPRForPO}
            onClearInitialPR={() => setInitialPRForPO(null)}
          />
        );
      default:
        return <ComingSoon title={SECTION_TITLES[activeSection]} />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 text-slate-900">
      <Sidebar
        activeSection={activeSection}
        onNavigate={handleNavigate}
        currentRole={currentRole}
        pendingApprovalsCount={pendingApprovalsCount}
        lowStockCount={lowStockCount}
        openPoCount={openPoCount}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          currentSection={SECTION_TITLES[activeSection]}
          selectedWarehouse={selectedWarehouse}
          onSelectWarehouse={setSelectedWarehouse}
          warehouses={warehouses.map((w) => ({ id: w.id, name: w.name }))}
          currentRole={currentRole}
          onSelectRole={setCurrentRole}
          uiState={uiState}
          onSelectUIState={setUiState}
          onOpenBusinessFlow={() => setBusinessFlowOpen(true)}
          onOpenDevSpec={() => setDevSpecOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <main className="flex-1 overflow-y-auto flex flex-col">{renderMain()}</main>
      </div>

      <BusinessFlowModal
        isOpen={businessFlowOpen}
        onClose={() => setBusinessFlowOpen(false)}
        onNavigateSection={(section) => {
          handleNavigate(section);
          setBusinessFlowOpen(false);
        }}
      />

      <DevSpecDrawer isOpen={devSpecOpen} onClose={() => setDevSpecOpen(false)} spec={activeSpec} />

      <PrintPreviewModal
        isOpen={printPreview !== null}
        onClose={() => setPrintPreview(null)}
        docType="PO"
        data={printPreview}
      />
    </div>
  );
};

export default App;
