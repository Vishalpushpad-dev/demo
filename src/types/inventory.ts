export type UserRole =
  | 'Inventory Manager'
  | 'Store Manager'
  | 'Purchase Manager'
  | 'Purchase Executive'
  | 'Warehouse Operator'
  | 'Production Manager'
  | 'Finance/Admin'
  | 'System Administrator';

export type UIStateType = 'normal' | 'loading' | 'empty' | 'permission_restricted';

export type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Overstock' | 'Reserved';

export type ItemType = 'Raw Material' | 'Work In Progress' | 'Finished Good' | 'Consumable' | 'Spare Part';

export interface Item {
  id: string;
  itemCode: string;
  itemName: string;
  category: string;
  group: string;
  itemType: ItemType;
  uom: string;
  sku: string;
  hsnSac: string;
  minStock: number;
  maxStock: number;
  reorderLevel: number;
  reorderQuantity: number;
  warehouseId: string;
  warehouseName: string;
  binLocation: string;
  rackLocation: string;
  batchTracking: boolean;
  lotTracking: boolean;
  serialNumberTracking: boolean;
  isActive: boolean;
  averageRate: number;
  availableQuantity: number;
  reservedQuantity: number;
  issuedQuantity: number;
  inTransitQuantity: number;
  stockValue: number;
  stockStatus: StockStatus;
  lastTransactionDate: string;
  batches?: ItemBatch[];
}

export interface ItemBatch {
  batchNumber: string;
  lotNumber?: string;
  quantity: number;
  mfgDate: string;
  expiryDate: string;
  warehouseId: string;
  binLocation: string;
  rate: number;
}

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  type: string;
  location: string;
  manager: string;
  capacityUtilization: number;
  totalItemsCount: number;
  totalValue: number;
  active: boolean;
}

export interface Supplier {
  id: string;
  supplierCode: string;
  supplierName: string;
  category: string;
  gstin: string;
  email: string;
  phone: string;
  city: string;
  paymentTerms: string;
  rating: number;
  status: 'Active' | 'Under Review' | 'Blacklisted';
}

export type PRPriority = 'Critical' | 'High' | 'Medium' | 'Low';
export type PRStatus =
  | 'Draft'
  | 'Pending Approval'
  | 'Approved'
  | 'Rejected'
  | 'Partially Converted'
  | 'Converted to PO'
  | 'Cancelled';

export interface PRItem {
  id: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  description: string;
  quantity: number;
  uom: string;
  requiredDate: string;
  warehouseId: string;
  preferredSupplier: string;
  estimatedRate: number;
  estimatedTotal: number;
  remarks?: string;
}

export interface PurchaseRequisition {
  id: string;
  prNumber: string;
  requestDate: string;
  requestedBy: string;
  department: string;
  requiredDate: string;
  priority: PRPriority;
  status: PRStatus;
  approvalStatus: 'Pending' | 'Approved' | 'Rejected';
  approvedBy?: string;
  approvalDate?: string;
  approvalNotes?: string;
  totalQuantity: number;
  totalEstimatedAmount: number;
  items: PRItem[];
  remarks: string;
  convertedPoId?: string;
}

export type POStatus = 'Draft' | 'Sent' | 'Partially Received' | 'Completed' | 'Cancelled';
export type POApprovalStatus = 'Pending Approval' | 'Approved' | 'Rejected';
export type POGrnStatus = 'Pending' | 'Partial GRN' | 'Fully Received';

export interface POItem {
  id: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  description: string;
  quantity: number;
  receivedQuantity: number;
  uom: string;
  rate: number;
  discountPercent: number;
  taxPercent: number;
  amount: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  poDate: string;
  referencePrNumber?: string;
  supplierId: string;
  supplierName: string;
  currency: string;
  warehouseId: string;
  warehouseName: string;
  expectedDeliveryDate: string;
  billingAddress: string;
  shippingAddress: string;
  paymentTerms: string;
  deliveryTerms: string;
  status: POStatus;
  approvalStatus: POApprovalStatus;
  grnStatus: POGrnStatus;
  approvedBy?: string;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  freightCharges: number;
  otherCharges: number;
  roundOff: number;
  grandTotal: number;
  items: POItem[];
  notes?: string;
}

export type QCStatus = 'Pending Inspection' | 'Accepted' | 'Partially Accepted' | 'Rejected';
export type GRNStatus = 'Draft' | 'Under Inspection' | 'Posted' | 'Cancelled';

export interface GRNItem {
  id: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  orderedQuantity: number;
  previouslyReceived: number;
  receivedQuantity: number;
  acceptedQuantity: number;
  rejectedQuantity: number;
  uom: string;
  rate: number;
  batchLotNumber: string;
  mfgDate: string;
  expiryDate: string;
  supplierBatch: string;
  warehouseId: string;
  binLocation: string;
  remarks: string;
}

export interface GoodsReceiptNote {
  id: string;
  grnNumber: string;
  grnDate: string;
  poNumber: string;
  supplierName: string;
  supplierInvoiceNo: string;
  warehouseId: string;
  warehouseName: string;
  receivedBy: string;
  totalItems: number;
  quantityReceived: number;
  quantityAccepted: number;
  quantityRejected: number;
  qcStatus: QCStatus;
  status: GRNStatus;
  inspectionNotes?: string;
  items: GRNItem[];
}

export interface IssueItem {
  id: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  availableStock: number;
  requestedQuantity: number;
  issueQuantity: number;
  uom: string;
  rate: number;
  batchLot: string;
  binLocation: string;
  remarks?: string;
}

export interface ItemIssue {
  id: string;
  issueNumber: string;
  issueDate: string;
  warehouseId: string;
  warehouseName: string;
  department: string;
  requestedBy: string;
  issuedTo: string;
  workOrderRef: string;
  referenceDepartment: string;
  status: 'Draft' | 'Issued' | 'Cancelled';
  totalQuantity: number;
  totalValue: number;
  items: IssueItem[];
  remarks: string;
}

export interface ConsumptionItem {
  id: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  quantityConsumed: number;
  uom: string;
  batchLot: string;
  scrapQuantity: number;
  remarks: string;
}

export interface ItemConsumption {
  id: string;
  consumptionNumber: string;
  date: string;
  department: string;
  productionOrderNo: string;
  warehouseId: string;
  warehouseName: string;
  operator: string;
  totalItems: number;
  items: ConsumptionItem[];
  remarks: string;
}

export interface ReturnItem {
  id: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  quantity: number;
  uom: string;
  batchLot: string;
  condition: 'Usable / Good' | 'Requires QC Re-test' | 'Scrap / Damaged';
  remarks: string;
}

export interface ReturnToStock {
  id: string;
  returnNumber: string;
  date: string;
  originalIssueNumber: string;
  warehouseId: string;
  warehouseName: string;
  returnedBy: string;
  reason: 'Excess Issued Material' | 'Work Order Alteration' | 'Defective Lot Repack' | 'Project Cancelled';
  status: 'Returned & Restocked' | 'Quarantine Inspection';
  items: ReturnItem[];
}

export type TransactionType =
  | 'Opening Stock'
  | 'Purchase Receipt (GRN)'
  | 'Item Issue'
  | 'Item Consumption'
  | 'Return to Stock'
  | 'Stock Transfer'
  | 'Physical Adjustment';

export interface InventoryTransaction {
  id: string;
  transactionId: string;
  date: string;
  itemCode: string;
  itemName: string;
  transactionType: TransactionType;
  referenceNumber: string;
  warehouse: string;
  batchLot: string;
  quantityIn: number;
  quantityOut: number;
  runningBalance: number;
  rate: number;
  value: number;
  createdBy: string;
}

export interface ScreenSpecification {
  screenId: string;
  screenName: string;
  moduleSection: string;
  purpose: string;
  targetPersonas: string[];
  layout: string;
  components: string[];
  dataFields: { field: string; type: string; required: boolean; description: string }[];
  userActions: { action: string; shortcut?: string; trigger: string; result: string }[];
  businessRules: string[];
  validationRules: string[];
  navigationPaths: string[];
  uiStates: {
    state: string;
    description: string;
    visualBehavior: string;
  }[];
}
