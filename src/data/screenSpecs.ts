import { ScreenSpecification } from '../types/inventory';

export const SCREEN_SPECIFICATIONS: Record<string, ScreenSpecification> = {
  dashboard: {
    screenId: 'SCR-INV-001',
    screenName: 'Enterprise Inventory Dashboard',
    moduleSection: 'Overview & Analytics',
    purpose:
      'Provide real-time executive and operational visibility across multi-warehouse stock levels, valuations, supply replenishment pipelines, and daily material burn rates.',
    targetPersonas: ['Inventory Manager', 'Store Manager', 'Purchase Manager', 'Finance/Admin', 'System Administrator'],
    layout:
      'Multi-tiered analytics grid: Top Filter Toolbar -> 10 KPI Metric Tiles -> Dual Trend Visualizers -> Spatial Breakdown (Warehouse & Category) -> Actionable Stock Alert Tables.',
    components: [
      'Global Date/Warehouse/Category Filter Bar',
      '10-metric KPI Tile Array with delta indicators',
      'Stock Valuation & Purchase Trend Area Graphs',
      'Issue vs Consumption Burn-Rate Bar Chart',
      'Warehouse Capacity Utilization Heatmap',
      'Critical Low Stock Actionable Table',
      'Top Consumed Materials Ranking Board',
      'Real-time Refresh & CSV Data Export Toolbar',
    ],
    dataFields: [
      { field: 'totalStockValue', type: 'Currency (INR/USD)', required: true, description: 'Sum of (AvailableQty * AvgCost) across all active materials' },
      { field: 'lowStockCount', type: 'Integer Counter', required: true, description: 'Count of items where AvailableQty <= ReorderLevel' },
      { field: 'outOfStockCount', type: 'Integer Counter', required: true, description: 'Count of items where AvailableQty == 0' },
      { field: 'pendingPrCount', type: 'Integer Counter', required: true, description: 'Purchase requisitions awaiting review/approval' },
      { field: 'pendingPoCount', type: 'Integer Counter', required: true, description: 'Open POs pending warehouse inward GRN' },
      { field: 'todayIssuedValue', type: 'Currency', required: true, description: 'Total cost of materials dispatched during current calendar date' },
      { field: 'todayConsumedValue', type: 'Currency', required: true, description: 'Total materials booked against shop floor work orders today' },
    ],
    userActions: [
      { action: 'Filter by Warehouse', shortcut: 'Alt+W', trigger: 'Dropdown select', result: 'Recomputes KPIs, valuations, and charts for selected facility' },
      { action: 'Filter by Date Range', shortcut: 'Alt+D', trigger: 'Date range selector', result: 'Filters issue, consumption, and inward trends' },
      { action: 'Export Snapshot', shortcut: 'Ctrl+E', trigger: 'Click Export button', result: 'Generates structured audit CSV/JSON snapshot' },
      { action: 'Direct Reorder', shortcut: 'Click CTA', trigger: 'Click Reorder on low stock row', result: 'Navigates to Create PR with item prefilled' },
    ],
    businessRules: [
      'Stock Value must be calculated using Moving Weighted Average cost unless FIFO is configured for specific batch.',
      'KPI figures must auto-refresh upon successful GRN post or material issue transaction.',
      'Items with zero stock and active work orders flagged with Critical badge.',
    ],
    validationRules: [
      'Date range start date cannot exceed end date.',
      'Selected warehouse must be in active status.',
    ],
    navigationPaths: [
      'Clicking Low Stock KPI -> navigates to Item Inventory with filter [status=Low Stock]',
      'Clicking Pending PRs KPI -> navigates to Purchase Requisition list with filter [status=Pending Approval]',
      'Clicking Pending POs KPI -> navigates to Purchase Order list with filter [grnStatus=Pending]',
    ],
    uiStates: [
      { state: 'Normal', description: 'Displays full KPI telemetry and interactive SVG trend visualizations.', visualBehavior: 'Standard dense grid' },
      { state: 'Loading', description: 'Displays pulse skeleton placeholders for metric cards and chart viewports.', visualBehavior: 'Gray shimmer skeleton grid' },
      { state: 'Empty', description: 'Shown when filtered warehouse has zero transactions in selected date range.', visualBehavior: 'Zero-data card with prompt to adjust filter' },
      { state: 'Permission Restricted', description: 'Financial valuation tiles obscured for Operator role.', visualBehavior: 'Value replaced by Lock icon and restricted tooltip' },
    ],
  },

  masters: {
    screenId: 'SCR-INV-002',
    screenName: 'Inventory Masters & Item Master',
    moduleSection: 'Masters & Configuration',
    purpose:
      'Manage item definitions, categorizations, warehouse structures, rack-bin coordinates, supplier mappings, and tax codes.',
    targetPersonas: ['Inventory Manager', 'Purchase Manager', 'System Administrator'],
    layout:
      'Segmented Tab Controller (Item Master, Category, Group, UOM, Warehouse, Rack/Bin, Supplier, Stock Location, Tax Config) with master data table and side-sheet / modal editor.',
    components: [
      'Master Entity Tabs Bar',
      'Search & Multi-attribute Filter Toolbar',
      'Item Master Comprehensive Data Grid',
      'Add / Edit Item Master Full-Form Modal (18+ enterprise attributes)',
      'Bulk CSV Import / Export Dialog',
      'Bin Location Assignment Picker',
      'Barcode / QR preview drawer',
    ],
    dataFields: [
      { field: 'itemCode', type: 'Alphanumeric (Unique)', required: true, description: 'ERP primary item code (e.g., RM-SS-316L-050)' },
      { field: 'itemName', type: 'String (Max 250)', required: true, description: 'Descriptive commercial and engineering item name' },
      { field: 'category', type: 'Foreign Key', required: true, description: 'Main classification (Raw Material, Spares, Consumables)' },
      { field: 'uom', type: 'String Enum', required: true, description: 'Base stock unit of measure (MTR, PCS, KG, LTR, DRUM, BOX)' },
      { field: 'minStock', type: 'Numeric', required: true, description: 'Minimum safety threshold triggering emergency alerts' },
      { field: 'reorderLevel', type: 'Numeric', required: true, description: 'Stock level at which automatic replenishment PR is suggested' },
      { field: 'reorderQuantity', type: 'Numeric', required: true, description: 'Economic order quantity (EOQ) suggested on replenishment' },
      { field: 'binLocation', type: 'String', required: true, description: 'Physical aisle, rack, and bin shelf address' },
      { field: 'batchTracking', type: 'Boolean', required: true, description: 'Enforces mandatory batch/lot entry during inward GRN' },
    ],
    userActions: [
      { action: 'Create New Item', shortcut: 'Ctrl+N', trigger: 'Click + New Item', result: 'Opens Item Master Creation modal' },
      { action: 'Edit Item Master', shortcut: 'Row Double-Click', trigger: 'Click Edit on row', result: 'Opens edit drawer with current values preloaded' },
      { action: 'Toggle Active Status', shortcut: 'Click Switch', trigger: 'Toggle Active checkbox', result: 'Soft-activates or soft-deactivates item from procurement dropdowns' },
      { action: 'Export Master Sheet', shortcut: 'Alt+X', trigger: 'Click Export Master', result: 'Downloads master data CSV' },
    ],
    businessRules: [
      'Item Code cannot be modified once transactions have been posted against it.',
      'Reorder Level must be strictly greater than Minimum Stock and less than Maximum Stock.',
      'If Batch Tracking is enabled, GRN posting requires non-empty batch number and expiration date.',
    ],
    validationRules: [
      'Item Code must be unique across all warehouses.',
      'HSN/SAC must follow statutory 6 to 8 digit formatting.',
      'Min stock cannot be negative.',
    ],
    navigationPaths: [
      'Clicking View Stock on item row -> opens Stock Details Drawer directly',
      'Clicking Category link -> switches tab to Item Category Master',
    ],
    uiStates: [
      { state: 'Normal', description: 'Dense data table with inline status chips and action buttons.', visualBehavior: 'Data rows with alternating zebra styling' },
      { state: 'Loading', description: 'Table rows replaced with shimmer lines.', visualBehavior: '10 skeleton rows' },
      { state: 'Empty', description: 'Displayed if search query yields no matches.', visualBehavior: 'Search illustration with Reset Filters CTA' },
      { state: 'Permission Restricted', description: 'Add/Edit buttons disabled for Operator and Viewer roles.', visualBehavior: 'Read-only grid with disabled CTA tooltips' },
    ],
  },

  stock: {
    screenId: 'SCR-INV-003',
    screenName: 'Item Inventory / Stock Ledger',
    moduleSection: 'Stock & Inventory',
    purpose:
      'Real-time multi-warehouse stock inquiry, batch tracking, reservation balances, inventory valuations, and audit trail examination.',
    targetPersonas: ['Inventory Manager', 'Store Manager', 'Purchase Manager', 'Warehouse Operator', 'Production Manager'],
    layout:
      'High-density master data grid with contextual quick-filter chips, right-hand slide-over Stock Details Drawer with tabs for Batch Breakdown, Valuation, and Movement History.',
    components: [
      'Search & Advanced Warehouse/Category/Status Filter Panel',
      'Stock Data Grid with 16 enterprise columns and sorting',
      'Stock Status Badges (In Stock, Low Stock, Out of Stock, Reserved)',
      'Item Stock Details Slide-over Drawer with 5 tabs',
      'Batch/Lot Breakdown Sub-table',
      'Warehouse-wise Distribution Mini Bar Chart',
      'Stock Movement Timeline (GRN -> Issue -> Return audit trail)',
    ],
    dataFields: [
      { field: 'availableQuantity', type: 'Numeric', required: true, description: 'Net physical stock available for immediate issue (Physical - Reserved)' },
      { field: 'reservedQuantity', type: 'Numeric', required: true, description: 'Stock reserved for released production work orders' },
      { field: 'inTransitQuantity', type: 'Numeric', required: true, description: 'Stock dispatched by supplier on active Purchase Orders' },
      { field: 'averageRate', type: 'Currency', required: true, description: 'Weighted average procurement cost' },
      { field: 'stockValue', type: 'Currency', required: true, description: 'AvailableQty * AverageRate' },
      { field: 'lastTransactionDate', type: 'Date', required: true, description: 'Timestamp of most recent inward/outward ledger entry' },
    ],
    userActions: [
      { action: 'Open Item Dossier', shortcut: 'Enter on row', trigger: 'Click row or View icon', result: 'Opens deep Stock Details slide-over drawer' },
      { action: 'Filter Out of Stock', shortcut: 'Click chip', trigger: 'Click Out of Stock filter badge', result: 'Narrows table to critical zero-stock materials' },
      { action: 'Initiate Emergency PR', shortcut: 'Click CTA', trigger: 'Click Reorder in drawer', result: 'Prepopulates Requisition drawer for this item' },
    ],
    businessRules: [
      'Available Quantity cannot drop below zero in physical operations.',
      'Reserved Quantity cannot exceed Available physical quantity.',
      'Stock valuations recalculate dynamically upon GRN completion.',
    ],
    validationRules: [
      'Stock adjustments require documented physical audit slip number.',
    ],
    navigationPaths: [
      'Drawer Action -> "Create Requisition" -> navigates to PR creation',
      'Drawer Action -> "View Ledger" -> navigates to Inventory Transactions ledger filtered by itemCode',
    ],
    uiStates: [
      { state: 'Normal', description: 'Full inventory grid with tabular numbers and status chips.', visualBehavior: 'Compact row table' },
      { state: 'Loading', description: 'Table rows pulse with bone-white skeletons.', visualBehavior: '12 skeleton rows' },
      { state: 'Empty', description: 'Filtered warehouse contains no inventory.', visualBehavior: 'No materials found prompt' },
      { state: 'Permission Restricted', description: 'Valuation and Rate columns hidden for standard Warehouse Operators.', visualBehavior: 'Columns omitted from table layout' },
    ],
  },

  purchaseRequisition: {
    screenId: 'SCR-INV-004',
    screenName: 'Purchase Requisition (PR)',
    moduleSection: 'Procurement Workflow',
    purpose:
      'Create, manage, and approve internal department material requests prior to commercial purchase order issuance.',
    targetPersonas: ['Purchase Manager', 'Purchase Executive', 'Production Manager', 'Inventory Manager'],
    layout:
      'PR Master Data Grid with status filters, Priority tags, "Create Requisition" multi-line item modal, and PR Details / Approval drawer.',
    components: [
      'PR Action Toolbar (+ New PR, Filter by Priority, Filter by Approval Status)',
      'PR Data Grid with Multi-select capabilities',
      'Create PR Modal with dynamic Line Item Table (Add/Remove rows)',
      'PR Detailed View Drawer with approval audit trail',
      'Convert to Purchase Order single-click trigger',
    ],
    dataFields: [
      { field: 'prNumber', type: 'Alphanumeric', required: true, description: 'Sequential ERP PR identifier (e.g., PR-2026-0041)' },
      { field: 'requestedBy', type: 'String', required: true, description: 'Employee name and department initiating request' },
      { field: 'requiredDate', type: 'Date', required: true, description: 'Target date material is needed on the shop floor' },
      { field: 'priority', type: 'Enum', required: true, description: 'Critical, High, Medium, Low urgency' },
      { field: 'status', type: 'Enum', required: true, description: 'Draft, Pending Approval, Approved, Rejected, Converted to PO' },
      { field: 'totalEstimatedAmount', type: 'Currency', required: true, description: 'Sum of (Qty * EstimatedRate) across lines' },
    ],
    userActions: [
      { action: 'Create New PR', shortcut: 'Ctrl+N', trigger: 'Click + New PR', result: 'Opens multi-item requisition modal' },
      { action: 'Approve PR', shortcut: 'Click Approve', trigger: 'Click Approve in drawer', result: 'Promotes PR status to Approved and enables PO conversion' },
      { action: 'Reject PR', shortcut: 'Click Reject', trigger: 'Click Reject with note', result: 'Updates status to Rejected with audit comment' },
      { action: 'Convert to PO', shortcut: 'Click Convert', trigger: 'Click "Convert to PO" button', result: 'Transfers line items directly into Create PO wizard' },
    ],
    businessRules: [
      'PRs with value > $10,000 require Plant Head or VP Procurement dual sign-off.',
      'Only Approved PRs can be converted to Purchase Orders.',
      'Cannot convert a Cancelled or Rejected PR.',
    ],
    validationRules: [
      'Required date must be today or in the future.',
      'Line item quantity must be greater than zero.',
      'At least one valid line item is required.',
    ],
    navigationPaths: [
      'Convert to PO -> launches PO creation view with prefilled items and PR reference',
    ],
    uiStates: [
      { state: 'Normal', description: 'Table of open and archived requisitions.', visualBehavior: 'Tabular list with priority pills' },
      { state: 'Loading', description: 'Shimmer rows.', visualBehavior: '8 skeleton rows' },
      { state: 'Empty', description: 'No pending requisitions for current department.', visualBehavior: 'Empty state illustration' },
      { state: 'Permission Restricted', description: 'Approve/Reject buttons hidden for Purchase Executive and Operator roles.', visualBehavior: 'Read-only view without approval CTAs' },
    ],
  },

  purchaseOrder: {
    screenId: 'SCR-INV-005',
    screenName: 'Purchase Order (PO)',
    moduleSection: 'Procurement Workflow',
    purpose:
      'Manage commercial purchase contracts with approved suppliers, tax computations, delivery schedules, and subsequent GRN receiving tracking.',
    targetPersonas: ['Purchase Manager', 'Purchase Executive', 'Finance/Admin'],
    layout:
      'PO List Grid with commercial summary cards, Create PO Modal with Header / Lines / Taxes / Delivery Terms, and PO Print / PDF Preview Dialog.',
    components: [
      'PO Metric Ribbon (Total Orders, Open Value, Awaiting Delivery, Overdue)',
      'PO Table with PO#, Vendor, Amount, Expected Delivery, and GRN Inward Status',
      'Create PO Full-Featured Builder (PR reference loader, line taxation, freight)',
      'PO Formal Print / PDF Document Viewer (Tax invoice layout with signoff)',
      'PO Approval Modal with budget variance check',
      'PO -> GRN -> Stock visual pipeline tracker',
    ],
    dataFields: [
      { field: 'poNumber', type: 'Alphanumeric', required: true, description: 'Unique ERP Purchase Order number (e.g., PO-2026-0129)' },
      { field: 'supplierName', type: 'Foreign Key', required: true, description: 'Selected vendor from Master' },
      { field: 'billingAddress', type: 'Text', required: true, description: 'Company tax registered office address' },
      { field: 'shippingAddress', type: 'Text', required: true, description: 'Target warehouse receiving dock address' },
      { field: 'paymentTerms', type: 'String Enum', required: true, description: 'Net 30, Net 45, Advance, Letter of Credit' },
      { field: 'subtotal', type: 'Currency', required: true, description: 'Sum of line item base prices' },
      { field: 'taxAmount', type: 'Currency', required: true, description: 'Calculated GST/VAT based on item tax rates' },
      { field: 'grandTotal', type: 'Currency', required: true, description: 'Subtotal - Discount + Tax + Freight' },
      { field: 'grnStatus', type: 'Enum', required: true, description: 'Pending, Partial GRN, Fully Received' },
    ],
    userActions: [
      { action: 'Create PO', shortcut: 'Ctrl+N', trigger: 'Click + New Purchase Order', result: 'Opens PO creation form' },
      { action: 'Print / Preview PO', shortcut: 'Ctrl+P', trigger: 'Click Print on row', result: 'Opens professional ERP printable PO document' },
      { action: 'Create Inward GRN', shortcut: 'Click Action', trigger: 'Click "Receive GRN" on row', result: 'Opens Create GRN modal prefilled with PO items' },
      { action: 'Approve PO', shortcut: 'Click Approve', trigger: 'Click Approve button in PO details', result: 'Promotes PO to Approved status' },
    ],
    businessRules: [
      'PO must be in Approved state before goods can be accepted at receiving bay.',
      'Line item quantity cannot exceed PR quantity by more than 5% without override.',
      'GRN status updates automatically from Pending -> Partial GRN -> Fully Received.',
    ],
    validationRules: [
      'Vendor must have valid GSTIN/Tax ID in master.',
      'Delivery date must be later than PO date.',
      'Rate must be strictly greater than 0.',
    ],
    navigationPaths: [
      'Click "Receive GRN" -> opens Create GRN screen with PO lines preloaded',
      'Click "PR Reference" -> navigates to linked Purchase Requisition',
    ],
    uiStates: [
      { state: 'Normal', description: 'Complete order registry with financial summary cards.', visualBehavior: 'Data grid with commercial totals' },
      { state: 'Loading', description: 'Table rows pulse with skeletons.', visualBehavior: 'Shimmer grid' },
      { state: 'Empty', description: 'No orders placed in selected date range.', visualBehavior: 'Clean empty state card' },
      { state: 'Permission Restricted', description: 'Commercial pricing redacted for store operators.', visualBehavior: 'Rates blurred or omitted' },
    ],
  },

  poApproval: {
    screenId: 'SCR-INV-006',
    screenName: 'Purchase Order Approval Inbox',
    moduleSection: 'Procurement Workflow',
    purpose:
      'Dedicated executive inbox for reviewing, analyzing commercial terms, verifying budget availability, and executing formal approval or rejection of pending POs.',
    targetPersonas: ['Purchase Manager', 'Finance/Admin', 'System Administrator'],
    layout:
      'Dual pane layout: Left list of Pending POs with priority and amounts -> Right detailed review workspace with line item breakdown, terms inspection, and Action Bar.',
    components: [
      'Pending Approvals Queue Counter',
      'PO Review Detail Card with vendor financial rating',
      'Line Item Comparison Table (Order Rate vs Master Standard Cost)',
      'Budget Utilization Progress Bar',
      'Approve / Reject Dialog with mandatory remarks input',
    ],
    dataFields: [
      { field: 'approvalStatus', type: 'Enum', required: true, description: 'Pending Approval, Approved, Rejected' },
      { field: 'approvedBy', type: 'String', required: false, description: 'Manager executing approval' },
      { field: 'approvalNotes', type: 'Text', required: false, description: 'Reason for approval or specific rejection grounds' },
    ],
    userActions: [
      { action: 'Approve Purchase Order', trigger: 'Click "Approve Order"', result: 'Locks PO, generates signed status, enables warehouse GRN receiving' },
      { action: 'Reject Purchase Order', trigger: 'Click "Reject Order"', result: 'Prompts for reason, returns PO to Draft for revision' },
    ],
    businessRules: [
      'Self-approval prohibited (Creator cannot approve their own PO).',
      'Rejected POs notify author with rejection explanation.',
    ],
    validationRules: [
      'Rejection requires at least 15 characters of explanatory comments.',
    ],
    navigationPaths: ['Approve -> switches PO to ready for GRN receipt'],
    uiStates: [
      { state: 'Normal', description: 'Active approval cards with approve/reject triggers.', visualBehavior: 'Actionable workflow cards' },
      { state: 'Empty', description: 'Inbox zero message: "All purchase orders have been processed."', visualBehavior: 'Success badge and empty illustration' },
      { state: 'Permission Restricted', description: 'Non-managerial roles blocked with "Insufficient Approval Authority" notice.', visualBehavior: 'Access blocked notice' },
    ],
  },

  grn: {
    screenId: 'SCR-INV-007',
    screenName: 'Goods Receipt Note (GRN) & QC Inspection',
    moduleSection: 'Store Operations',
    purpose:
      'Inward material verification against Purchase Orders, physical count check, Quality Control (QC) inspection, batch/lot allocation, and automatic stock posting.',
    targetPersonas: ['Store Manager', 'Warehouse Operator', 'Inventory Manager'],
    layout:
      'GRN Registry Table with QC status indicators, "Create GRN from PO" workflow modal, QC Inspection Sub-form, and GRN Formal Print / Inspection Certificate.',
    components: [
      'GRN Action Toolbar (+ Inward New Consignment, Filter by QC Status)',
      'GRN Registry Grid (GRN#, Inward Date, PO#, Supplier, QC Status, Post Status)',
      'Inward GRN Creator: PO selector -> PO Items Autoloader -> Quantity Received vs Ordered -> Batch & Expiry Entry -> QC Disposition (Accept / Reject) -> Putaway Bin Picker',
      'Instant "Stock Updated Successfully" notification banner',
      'GRN Printable Receipt with Gate Inward Stamp',
    ],
    dataFields: [
      { field: 'grnNumber', type: 'Alphanumeric', required: true, description: 'System-generated sequential GRN number (e.g., GRN-2026-0084)' },
      { field: 'poNumber', type: 'Foreign Key', required: true, description: 'Reference Purchase Order being fulfilled' },
      { field: 'supplierInvoiceNo', type: 'String', required: true, description: 'Vendor delivery challan or tax invoice number' },
      { field: 'quantityReceived', type: 'Numeric', required: true, description: 'Gross physical quantity unloaded at dock' },
      { field: 'quantityAccepted', type: 'Numeric', required: true, description: 'Net good quantity passed by QC inspection' },
      { field: 'quantityRejected', type: 'Numeric', required: true, description: 'Defective or out-of-spec quantity sent to quarantine' },
      { field: 'batchLotNumber', type: 'Alphanumeric', required: true, description: 'Assigned inward batch number for traceability' },
      { field: 'binLocation', type: 'String', required: true, description: 'Target rack-shelf bin where accepted material is put away' },
    ],
    userActions: [
      { action: 'Create Inward GRN', shortcut: 'Ctrl+N', trigger: 'Click + Inward Consignment', result: 'Opens GRN wizard against PO' },
      { action: 'Execute QC Inspection', shortcut: 'Click QC', trigger: 'Inspect button in GRN details', result: 'Opens Quality inspection verdict form' },
      { action: 'Post to Stock Ledger', shortcut: 'Click Post', trigger: 'Click "Post Stock to Ledger"', result: 'Increments inventory stock, creates transaction, updates PO GRN status' },
      { action: 'Print GRN Voucher', shortcut: 'Ctrl+P', trigger: 'Click Print on row', result: 'Opens formal GRN receipt document' },
    ],
    businessRules: [
      'Posting a GRN increases Available Stock in the specified warehouse and bin immediately.',
      'An immutable Inventory Transaction record is generated upon posting with type "Purchase Receipt (GRN)".',
      'If Accepted Qty < Ordered Qty, PO grnStatus becomes "Partial GRN"; if fully received, becomes "Fully Received".',
    ],
    validationRules: [
      'Received Qty cannot exceed Pending PO Ordered Qty by more than 10% (tolerance check).',
      'Accepted Qty + Rejected Qty must equal Received Qty exactly.',
      'Batch number and Expiry date mandatory if item has batchTracking=true.',
    ],
    navigationPaths: [
      'Post Stock -> prompts link to view updated stock balance in Item Inventory or Ledger',
    ],
    uiStates: [
      { state: 'Normal', description: 'Table of posted and pending GRNs.', visualBehavior: 'Status grid with inspection tags' },
      { state: 'Loading', description: 'Pulsing skeletons.', visualBehavior: '8 skeleton rows' },
      { state: 'Empty', description: 'No goods inwarded in current shift.', visualBehavior: 'Empty receiving bay prompt' },
      { state: 'Permission Restricted', description: 'QC decision making disabled for standard warehouse operators.', visualBehavior: 'QC inputs read-only' },
    ],
  },

  itemIssue: {
    screenId: 'SCR-INV-008',
    screenName: 'Item Issue to Production & Departments',
    moduleSection: 'Store Operations',
    purpose:
      'Discharge materials from warehouse to manufacturing lines, maintenance work orders, or research departments with real-time stock validation preventing over-issue.',
    targetPersonas: ['Store Manager', 'Warehouse Operator', 'Production Manager', 'Inventory Manager'],
    layout:
      'Issue Registry Table, Issue Creation Form with dynamic real-time Available Stock indicator, Issue Quantity validation, and Issue Slip Document Generator.',
    components: [
      'Issue Action Toolbar (+ Issue Material, Filter by Department)',
      'Issue Records Grid (Issue#, Date, Warehouse, Dept, WO#, Qty, Total Value)',
      'Create Material Issue Slip Form: Dept / Work Order selector -> Item selector with real-time Available Stock, Requested Qty, Issue Qty, Batch selection -> Remaining Stock Live Preview',
      'Strict Over-Issue Blocker alert banner',
      'Material Issue Slip Printable Voucher with recipient signature lines',
    ],
    dataFields: [
      { field: 'issueNumber', type: 'Alphanumeric', required: true, description: 'Sequential Issue identifier (e.g., ISS-2026-0192)' },
      { field: 'workOrderRef', type: 'Foreign Key', required: true, description: 'Production Work Order (e.g., WO-2026-8841) or cost center' },
      { field: 'department', type: 'String', required: true, description: 'Receiving shop floor department' },
      { field: 'issuedTo', type: 'String', required: true, description: 'Technician or operator physically receiving material' },
      { field: 'availableStock', type: 'Numeric (Read-only)', required: true, description: 'Live warehouse stock for selected item' },
      { field: 'issueQuantity', type: 'Numeric', required: true, description: 'Quantity to be deducted from inventory' },
    ],
    userActions: [
      { action: 'Create Issue', shortcut: 'Ctrl+N', trigger: 'Click + Issue Material', result: 'Opens Issue creation form' },
      { action: 'Post Issue', shortcut: 'Ctrl+S', trigger: 'Click "Confirm & Dispatch Material"', result: 'Decrements Available Stock and creates audit transaction' },
      { action: 'Print Issue Slip', shortcut: 'Ctrl+P', trigger: 'Click Print on row', result: 'Generates formal Material Issue Voucher' },
    ],
    businessRules: [
      'The UI strictly prevents issuing more quantity than currently available in warehouse.',
      'Confirmed issue decrements Available Stock immediately.',
      'Generates transaction entry in Inventory Transactions ledger with type "Item Issue".',
    ],
    validationRules: [
      'Issue Quantity must be > 0 and <= Available Stock.',
      'Work Order / Job Card reference is mandatory.',
      'Recipient name cannot be blank.',
    ],
    navigationPaths: [
      'Post Issue -> prompts link to Item Consumption or Stock Ledger',
    ],
    uiStates: [
      { state: 'Normal', description: 'Table of executed material issues.', visualBehavior: 'Data table with department tags' },
      { state: 'Loading', description: 'Skeletons.', visualBehavior: '8 skeleton rows' },
      { state: 'Empty', description: 'No materials issued today.', visualBehavior: 'Empty state illustration' },
      { state: 'Permission Restricted', description: 'Only Store/Warehouse roles can execute physical dispatch.', visualBehavior: 'Create button disabled for Viewer' },
    ],
  },

  itemConsumption: {
    screenId: 'SCR-INV-009',
    screenName: 'Item Consumption & WIP Accounting',
    moduleSection: 'Store Operations',
    purpose:
      'Record actual material consumption and scrap generation against manufacturing orders, establishing the relationship: Issue -> Consumption -> Production.',
    targetPersonas: ['Production Manager', 'Store Manager', 'Inventory Manager', 'Finance/Admin'],
    layout:
      'Consumption Registry Table, Log Consumption Form with scrap calculation, and Visual Relationship Tracker (Issue -> Consumption -> Production).',
    components: [
      'Log Consumption Action Button',
      'Consumption Table with WO#, Operator, Consumed Qty, Scrap Qty',
      'Record Consumption Form linking issued lot to finished production yield',
      'Scrap Variance Indicator (highlights high scrap percentages)',
      'Traceability Flow Card linking Issue Slip -> Consumption Log -> Finished Good Batch',
    ],
    dataFields: [
      { field: 'consumptionNumber', type: 'Alphanumeric', required: true, description: 'Consumption voucher ID (e.g., CON-2026-0105)' },
      { field: 'productionOrderNo', type: 'Foreign Key', required: true, description: 'Work Order where material was transformed' },
      { field: 'quantityConsumed', type: 'Numeric', required: true, description: 'Net quantity embedded into final product' },
      { field: 'scrapQuantity', type: 'Numeric', required: false, description: 'Off-cut or rejected material loss during processing' },
      { field: 'operator', type: 'String', required: true, description: 'Line operator who executed fabrication' },
    ],
    userActions: [
      { action: 'Record Consumption', shortcut: 'Ctrl+N', trigger: 'Click + Log Consumption', result: 'Opens consumption dialog' },
      { action: 'Post Consumption', shortcut: 'Click Save', trigger: 'Click "Post Consumption"', result: 'Updates WIP cost, registers scrap, writes ledger entry' },
    ],
    businessRules: [
      'Consumption quantity cannot exceed issued quantity on the referenced Work Order.',
      'Scrap exceeding 5% triggers a quality notification to production head.',
    ],
    validationRules: [
      'Quantity Consumed must be strictly greater than zero.',
      'Production Order must be in "In Progress" status.',
    ],
    navigationPaths: ['Links directly to Work Order production record'],
    uiStates: [
      { state: 'Normal', description: 'Logged consumptions list.', visualBehavior: 'List with scrap percentage counters' },
      { state: 'Loading', description: 'Skeletons.', visualBehavior: '8 skeleton rows' },
      { state: 'Empty', description: 'No consumptions logged today.', visualBehavior: 'Clean state card' },
      { state: 'Permission Restricted', description: 'Only Production and Store roles can log consumption.', visualBehavior: 'Button hidden for Purchase roles' },
    ],
  },

  returnToStock: {
    screenId: 'SCR-INV-010',
    screenName: 'Return to Stock',
    moduleSection: 'Store Operations',
    purpose:
      'Restock unused or excess issued materials back into inventory with inspection classification (Usable, Re-test, Scrap), increasing stock upon confirmation.',
    targetPersonas: ['Store Manager', 'Warehouse Operator', 'Inventory Manager'],
    layout:
      'Return Registry Grid, Create Return Form against Issue Slip with Return Reason and Material Condition assessment, and Restock Confirmation Banner.',
    components: [
      'Return Action Toolbar (+ Return to Stock)',
      'Returns Table (Return#, Date, Original Issue#, Reason, Condition, Restocked Qty)',
      'Create Return Slip: Reference Issue picker -> Items loader -> Return Qty -> Condition evaluation (Usable, Needs Re-test, Scrap) -> Target Bin',
      'Restock Success Notification confirming inventory stock increment',
    ],
    dataFields: [
      { field: 'returnNumber', type: 'Alphanumeric', required: true, description: 'Sequential Return slip identifier (e.g., RET-2026-0053)' },
      { field: 'originalIssueNumber', type: 'Foreign Key', required: true, description: 'Original Issue voucher ID' },
      { field: 'reason', type: 'Enum', required: true, description: 'Excess Issued Material, Work Order Alteration, Defective Lot' },
      { field: 'condition', type: 'Enum', required: true, description: 'Usable / Good, Requires QC Re-test, Scrap / Damaged' },
    ],
    userActions: [
      { action: 'Create Return', shortcut: 'Ctrl+N', trigger: 'Click + Return to Stock', result: 'Opens Return to Stock dialog' },
      { action: 'Post Return', shortcut: 'Click Restock', trigger: 'Click "Restock & Update Inventory"', result: 'Increases warehouse Available Stock and records ledger credit' },
    ],
    businessRules: [
      'Returned items marked as "Usable / Good" increment Available Stock immediately.',
      'Items marked as "Requires QC Re-test" are moved into Quarantine Bin and not available for issue.',
      'Creates transaction ledger entry with type "Return to Stock".',
    ],
    validationRules: [
      'Returned quantity cannot exceed original Issued Quantity.',
      'Original Issue slip number is mandatory.',
    ],
    navigationPaths: ['Post Return -> shows updated item quantity in stock ledger'],
    uiStates: [
      { state: 'Normal', description: 'Table of completed returns to stock.', visualBehavior: 'Data rows with condition tags' },
      { state: 'Loading', description: 'Skeletons.', visualBehavior: '6 skeleton rows' },
      { state: 'Empty', description: 'No returns processed in current period.', visualBehavior: 'Empty state notice' },
      { state: 'Permission Restricted', description: 'Operators cannot authorize quarantine overrides.', visualBehavior: 'Inputs locked' },
    ],
  },

  transactions: {
    screenId: 'SCR-INV-011',
    screenName: 'Inventory Transactions / Stock Ledger',
    moduleSection: 'Ledger & Audit',
    purpose:
      'Centralized, immutable audit ledger recording every physical movement (GRN, Issue, Consumption, Return, Transfer, Adjustment) with running balance and valuation.',
    targetPersonas: ['Inventory Manager', 'Finance/Admin', 'System Administrator', 'Store Manager'],
    layout:
      'Ledger Data Grid with Transaction Type filter chips, Item filter, Date range selector, Debit/Credit Quantity columns, Running Balance, and CSV export.',
    components: [
      'Transaction Type quick filters (All, Opening, GRN, Issue, Consumption, Return, Adjustment)',
      'Item Code Search & Warehouse selector',
      'Immutable Ledger Grid with 13 audit columns and monospace numbers',
      'Transaction Movement Details Drawer',
      'Audit Export Button (CSV / JSON)',
    ],
    dataFields: [
      { field: 'transactionId', type: 'Alphanumeric', required: true, description: 'Immutable sequential ledger record ID' },
      { field: 'date', type: 'Timestamp', required: true, description: 'Exact system timestamp of transaction posting' },
      { field: 'itemCode', type: 'Foreign Key', required: true, description: 'Master Item Code' },
      { field: 'transactionType', type: 'Enum', required: true, description: 'GRN, Issue, Consumption, Return, Adjustment' },
      { field: 'referenceNumber', type: 'String', required: true, description: 'Source document voucher ID' },
      { field: 'quantityIn', type: 'Numeric', required: true, description: 'Receipt quantity (+credit to stock)' },
      { field: 'quantityOut', type: 'Numeric', required: true, description: 'Issue quantity (-debit from stock)' },
      { field: 'runningBalance', type: 'Numeric', required: true, description: 'Net balance remaining in warehouse post-transaction' },
      { field: 'rate', type: 'Currency', required: true, description: 'Unit cost associated with transaction' },
      { field: 'value', type: 'Currency', required: true, description: 'Total transaction value (Qty * Rate)' },
    ],
    userActions: [
      { action: 'Filter by Transaction Type', trigger: 'Click type chip', result: 'Filters ledger by GRN, Issue, etc.' },
      { action: 'Search by Item Code', trigger: 'Type in search', result: 'Shows chronological lifecycle of single material' },
      { action: 'Export Ledger', trigger: 'Click Export Ledger', result: 'Downloads complete CSV ledger' },
    ],
    businessRules: [
      'Ledger records are strictly append-only and immutable. Deletion is forbidden by ERP database constraints.',
      'Running Balance must be mathematically consistent: PreviousBalance + QuantityIn - QuantityOut.',
    ],
    validationRules: ['None (Read-only generated records)'],
    navigationPaths: ['Click Reference Document -> jumps to source GRN / Issue / PO document'],
    uiStates: [
      { state: 'Normal', description: 'Tabular audit ledger with green/red inward/outward styling.', visualBehavior: 'Data grid with monospace numbers' },
      { state: 'Loading', description: 'Skeletons.', visualBehavior: '10 skeleton rows' },
      { state: 'Empty', description: 'No records found matching filters.', visualBehavior: 'Clean empty state' },
      { state: 'Permission Restricted', description: 'Financial columns rate and value hidden for non-finance users.', visualBehavior: 'Value columns omitted' },
    ],
  },

  reports: {
    screenId: 'SCR-INV-012',
    screenName: 'Stock Reports & Supply Chain Intelligence',
    moduleSection: 'Reports & Intelligence',
    purpose:
      'Enterprise inventory analytical reports: Warehouse-wise Stock, Valuation (FIFO/WAC), Reorder Deficit Alerts, Aging Analysis (0-30, 31-60, 61-90, 90+ days), and Fast/Slow Moving Items.',
    targetPersonas: ['Inventory Manager', 'Finance/Admin', 'Purchase Manager', 'Store Manager'],
    layout:
      'Report Selector Tabs -> Configuration & Filter Toolbar -> Summary Cards -> Detailed Analytical Grid -> Print & Export Actions.',
    components: [
      'Report Type Tabs (Warehouse-wise, Valuation, Reorder Alerts, Aging Analysis, Fast/Slow Moving)',
      'Aging Distribution Buckets (0-30, 31-60, 61-90, >90 Days)',
      'Critical Reorder Shortage Matrix with recommended replenishment quantities',
      'Valuation Summary with Total Asset Valuation in INR/USD',
      'Print Report & Export to Excel/CSV triggers',
    ],
    dataFields: [
      { field: 'warehouseName', type: 'String', required: true, description: 'Warehouse facility name' },
      { field: 'totalValue', type: 'Currency', required: true, description: 'Total inventory valuation' },
      { field: 'reorderDeficit', type: 'Numeric', required: true, description: 'Shortfall below reorder level' },
      { field: 'agingBucket', type: 'Enum', required: true, description: '0-30 Days, 31-60 Days, 61-90 Days, >90 Days (Slow)' },
      { field: 'turnoverRatio', type: 'Decimal', required: true, description: 'Annualized inventory turnover velocity' },
    ],
    userActions: [
      { action: 'Switch Report Type', trigger: 'Click Tab', result: 'Loads specialized data grid and metric cards' },
      { action: 'Export Report', trigger: 'Click Export', result: 'Exports formatted report to CSV' },
      { action: 'Print Report', trigger: 'Click Print', result: 'Opens browser print dialog with printable stylesheet' },
    ],
    businessRules: [
      'Aging calculated from last GRN receipt date relative to current system date.',
      'Items with zero issues in 90+ days classified as "Slow Moving / Non-Moving".',
    ],
    validationRules: ['Export file name includes report type and ISO timestamp.'],
    navigationPaths: ['Reorder report rows -> direct link to create PR'],
    uiStates: [
      { state: 'Normal', description: 'Analytical grid with aging metrics.', visualBehavior: 'Data grid with colorful distribution bars' },
      { state: 'Loading', description: 'Skeletons.', visualBehavior: '10 skeleton rows' },
      { state: 'Empty', description: 'No records matching report criteria.', visualBehavior: 'Empty report state' },
      { state: 'Permission Restricted', description: 'Full access granted to all roles, but Valuation restricted for Operators.', visualBehavior: 'Masked values' },
    ],
  },
};
