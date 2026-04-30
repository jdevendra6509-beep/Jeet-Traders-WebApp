export interface Customer {
  id: string;
  name: string;
  address: string;
  state: string;
  stateCode: string;
  gstin: string;
}

export interface MasterItem {
  id: string;
  description: string;
  hsnCode: string;
  unit: string;
  gstRate: number; // e.g. 5 for 5%
}

export interface InvoiceItem {
  id: string;
  description: string;
  hsnCode: string;
  qty: number;
  unit: string;
  inclusiveRate: number; // User inputs this
  gstRate: number; // Retrieved from master
}

export interface InvoiceData {
  invoiceNo: string;
  dateOfSupply: string;
  poNo: string;
  poDate: string;
  vehicleNo: string;
  nameOfTransport: string;
  placeOfSupply: string;
  modeOfTransport: string;
  
  customerId?: string; // Reference to master
  receiverName: string;
  receiverAddress: string;
  receiverState: string;
  receiverStateCode: string;
  receiverGstin: string;
  
  items: InvoiceItem[];
  
  loadingCharges: number;
  transportCharges: number;
  otherCharges: number;
  hamali: number;
}
