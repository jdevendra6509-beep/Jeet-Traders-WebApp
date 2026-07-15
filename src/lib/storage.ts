import type { InvoiceData, Customer, MasterItem } from '../types';
import { supabase } from './supabase';

export const saveInvoice = async (invoice: InvoiceData): Promise<void> => {
  const sanitizedItems = invoice.items.map(item => ({
    ...item,
    qty: Number(item.qty) || 0,
    inclusiveRate: Number(item.inclusiveRate) || 0
  }));

  const { error } = await supabase.from('invoices').upsert({
    invoice_no: invoice.invoiceNo,
    date_of_supply: invoice.dateOfSupply,
    po_no: invoice.poNo,
    po_date: invoice.poDate,
    vehicle_no: invoice.vehicleNo,
    name_of_transport: invoice.nameOfTransport,
    place_of_supply: invoice.placeOfSupply,
    mode_of_transport: invoice.modeOfTransport,
    customer_id: invoice.customerId || null,
    receiver_name: invoice.receiverName,
    receiver_address: invoice.receiverAddress,
    receiver_state: invoice.receiverState,
    receiver_state_code: invoice.receiverStateCode,
    receiver_gstin: invoice.receiverGstin,
    loading_charges: Number(invoice.loadingCharges) || 0,
    transport_charges: Number(invoice.transportCharges) || 0,
    other_charges: Number(invoice.otherCharges) || 0,
    hamali: Number(invoice.hamali) || 0,
    items_json: sanitizedItems
  });
  
  if (error) {
    console.error('Error saving invoice to Supabase:', error);
    throw error;
  }
};

export const getInvoices = async (): Promise<InvoiceData[]> => {
  const { data, error } = await supabase.from('invoices').select('*').order('created_at', { ascending: false });
  if (error) {
    console.error('Error fetching invoices from Supabase:', error);
    return [];
  }
  
  return data.map(row => ({
    invoiceNo: row.invoice_no,
    dateOfSupply: row.date_of_supply,
    poNo: row.po_no || '',
    poDate: row.po_date || '',
    vehicleNo: row.vehicle_no || '',
    nameOfTransport: row.name_of_transport || '',
    placeOfSupply: row.place_of_supply || '',
    modeOfTransport: row.mode_of_transport || '',
    customerId: row.customer_id,
    receiverName: row.receiver_name,
    receiverAddress: row.receiver_address,
    receiverState: row.receiver_state,
    receiverStateCode: row.receiver_state_code,
    receiverGstin: row.receiver_gstin,
    loadingCharges: row.loading_charges,
    transportCharges: row.transport_charges,
    otherCharges: row.other_charges,
    hamali: row.hamali,
    items: row.items_json
  }));
};

export const getInvoiceByNo = async (invoiceNo: string): Promise<InvoiceData | undefined> => {
  const { data, error } = await supabase.from('invoices').select('*').eq('invoice_no', invoiceNo).single();
  if (error || !data) {
    console.error('Error fetching single invoice:', error);
    return undefined;
  }
  
  return {
    invoiceNo: data.invoice_no,
    dateOfSupply: data.date_of_supply,
    poNo: data.po_no || '',
    poDate: data.po_date || '',
    vehicleNo: data.vehicle_no || '',
    nameOfTransport: data.name_of_transport || '',
    placeOfSupply: data.place_of_supply || '',
    modeOfTransport: data.mode_of_transport || '',
    customerId: data.customer_id,
    receiverName: data.receiver_name,
    receiverAddress: data.receiver_address,
    receiverState: data.receiver_state,
    receiverStateCode: data.receiver_state_code,
    receiverGstin: data.receiver_gstin,
    loadingCharges: data.loading_charges,
    transportCharges: data.transport_charges,
    otherCharges: data.other_charges,
    hamali: data.hamali,
    items: data.items_json
  };
};

export const deleteInvoice = async (invoiceNo: string): Promise<void> => {
  const { error } = await supabase.from('invoices').delete().eq('invoice_no', invoiceNo);
  if (error) throw error;
};
export const getCustomers = async (): Promise<Customer[]> => {
  const { data, error } = await supabase.from('customers').select('*');
  if (error) {
    console.error('Error fetching customers:', error);
    return [];
  }
  return data
    .map(row => ({
      id: row.id,
      name: row.name,
      address: row.address,
      state: row.state,
      stateCode: row.state_code,
      gstin: row.gstin
    }))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
};

export const getMasterItems = async (): Promise<MasterItem[]> => {
  const { data, error } = await supabase.from('items').select('*');
  if (error) {
    console.error('Error fetching items:', error);
    return [];
  }
  return data.map(row => ({
    id: row.id,
    description: row.description,
    hsnCode: row.hsn_code,
    unit: row.unit,
    gstRate: row.gst_rate
  }));
};

export const addCustomer = async (customer: Omit<Customer, 'id'>): Promise<void> => {
  const { error } = await supabase.from('customers').insert({
    name: customer.name,
    address: customer.address,
    state: customer.state,
    state_code: customer.stateCode,
    gstin: customer.gstin
  });
  if (error) throw error;
};

export const deleteCustomer = async (id: string): Promise<void> => {
  const { error } = await supabase.from('customers').delete().eq('id', id);
  if (error) throw error;
};

export const addMasterItem = async (item: Omit<MasterItem, 'id'>): Promise<void> => {
  const { error } = await supabase.from('items').insert({
    description: item.description,
    hsn_code: item.hsnCode,
    unit: item.unit,
    gst_rate: item.gstRate
  });
  if (error) throw error;
};

export const deleteMasterItem = async (id: string): Promise<void> => {
  const { error } = await supabase.from('items').delete().eq('id', id);
  if (error) throw error;
};

export const getNextInvoiceNo = async (): Promise<string> => {
  const invoices = await getInvoices();
  
  // Calculate current financial year prefix (April 1st to March 31st)
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0 is Jan, 3 is Apr
  const startYear = month < 3 ? year - 1 : year;
  const startYearStr = startYear.toString().slice(-2);
  const endYearStr = (startYear + 1).toString().slice(-2);
  const prefix = `JT/${startYearStr}-${endYearStr}/`;

  let maxNum = 0;
  
  invoices.forEach(inv => {
    if (inv.invoiceNo && inv.invoiceNo.startsWith(prefix)) {
      const parts = inv.invoiceNo.split('/');
      const suffix = parts[parts.length - 1];
      const num = parseInt(suffix, 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  });

  const nextNum = maxNum + 1;
  return `${prefix}${nextNum.toString().padStart(3, '0')}`;
};
