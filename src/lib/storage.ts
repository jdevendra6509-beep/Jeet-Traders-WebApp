import type { InvoiceData, Customer, MasterItem } from '../types';
import { client } from './amplifyClient';

export const saveInvoice = async (invoice: InvoiceData): Promise<void> => {
  const sanitizedItems = invoice.items.map(item => ({
    ...item,
    qty: Number(item.qty) || 0,
    inclusiveRate: Number(item.inclusiveRate) || 0
  }));

  const payload = {
    invoiceNo: invoice.invoiceNo,
    dateOfSupply: invoice.dateOfSupply,
    poNo: invoice.poNo,
    poDate: invoice.poDate,
    vehicleNo: invoice.vehicleNo,
    nameOfTransport: invoice.nameOfTransport,
    placeOfSupply: invoice.placeOfSupply,
    modeOfTransport: invoice.modeOfTransport,
    customerId: invoice.customerId || null,
    receiverName: invoice.receiverName,
    receiverAddress: invoice.receiverAddress,
    receiverState: invoice.receiverState,
    receiverStateCode: invoice.receiverStateCode,
    receiverGstin: invoice.receiverGstin,
    loadingCharges: Number(invoice.loadingCharges) || 0,
    transportCharges: Number(invoice.transportCharges) || 0,
    otherCharges: Number(invoice.otherCharges) || 0,
    hamali: Number(invoice.hamali) || 0,
    items: JSON.stringify(sanitizedItems)
  };

  // Amplify Data has no single upsert call: create() rejects an existing key
  // and update() rejects a missing one, so check first (mirrors the old
  // Supabase upsert(), which is used here for both new and edited invoices).
  const existing = await client.models.Invoice.get({ invoiceNo: invoice.invoiceNo }, { authMode: 'apiKey' });
  const { errors } = existing.data
    ? await client.models.Invoice.update(payload, { authMode: 'apiKey' })
    : await client.models.Invoice.create(payload, { authMode: 'apiKey' });

  if (errors) {
    console.error('Error saving invoice to Amplify:', errors);
    throw new Error(errors.map(e => e.message).join(', '));
  }
};

export const getInvoices = async (): Promise<InvoiceData[]> => {
  const { data, errors } = await client.models.Invoice.list({ authMode: 'apiKey' });
  if (errors) {
    console.error('Error fetching invoices from Amplify:', errors);
    return [];
  }

  return data
    .sort((a, b) => (b.dateOfSupply ?? '').localeCompare(a.dateOfSupply ?? ''))
    .map(row => ({
      invoiceNo: row.invoiceNo,
      dateOfSupply: row.dateOfSupply,
      poNo: row.poNo || '',
      poDate: row.poDate || '',
      vehicleNo: row.vehicleNo || '',
      nameOfTransport: row.nameOfTransport || '',
      placeOfSupply: row.placeOfSupply || '',
      modeOfTransport: row.modeOfTransport || '',
      customerId: row.customerId ?? undefined,
      receiverName: row.receiverName,
      receiverAddress: row.receiverAddress,
      receiverState: row.receiverState,
      receiverStateCode: row.receiverStateCode,
      receiverGstin: row.receiverGstin,
      loadingCharges: row.loadingCharges ?? 0,
      transportCharges: row.transportCharges ?? 0,
      otherCharges: row.otherCharges ?? 0,
      hamali: row.hamali ?? 0,
      items: JSON.parse(row.items as string) as InvoiceData['items']
    }));
};

export const getInvoiceByNo = async (invoiceNo: string): Promise<InvoiceData | undefined> => {
  const { data, errors } = await client.models.Invoice.get({ invoiceNo }, { authMode: 'apiKey' });
  if (errors || !data) {
    console.error('Error fetching single invoice:', errors);
    return undefined;
  }

  return {
    invoiceNo: data.invoiceNo,
    dateOfSupply: data.dateOfSupply,
    poNo: data.poNo || '',
    poDate: data.poDate || '',
    vehicleNo: data.vehicleNo || '',
    nameOfTransport: data.nameOfTransport || '',
    placeOfSupply: data.placeOfSupply || '',
    modeOfTransport: data.modeOfTransport || '',
    customerId: data.customerId ?? undefined,
    receiverName: data.receiverName,
    receiverAddress: data.receiverAddress,
    receiverState: data.receiverState,
    receiverStateCode: data.receiverStateCode,
    receiverGstin: data.receiverGstin,
    loadingCharges: data.loadingCharges ?? 0,
    transportCharges: data.transportCharges ?? 0,
    otherCharges: data.otherCharges ?? 0,
    hamali: data.hamali ?? 0,
    items: JSON.parse(data.items as string) as InvoiceData['items']
  };
};

export const deleteInvoice = async (invoiceNo: string): Promise<void> => {
  const { errors } = await client.models.Invoice.delete({ invoiceNo }, { authMode: 'apiKey' });
  if (errors) throw new Error(errors.map(e => e.message).join(', '));
};

export const getCustomers = async (): Promise<Customer[]> => {
  const { data, errors } = await client.models.Customer.list({ authMode: 'apiKey' });
  if (errors) {
    console.error('Error fetching customers:', errors);
    return [];
  }
  return data
    .map(row => ({
      id: row.id,
      name: row.name,
      address: row.address,
      state: row.state,
      stateCode: row.stateCode,
      gstin: row.gstin
    }))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
};

export const getMasterItems = async (): Promise<MasterItem[]> => {
  const { data, errors } = await client.models.MasterItem.list({ authMode: 'apiKey' });
  if (errors) {
    console.error('Error fetching items:', errors);
    return [];
  }
  return data.map(row => ({
    id: row.id,
    description: row.description,
    hsnCode: row.hsnCode,
    unit: row.unit,
    gstRate: row.gstRate
  }));
};

export const addCustomer = async (customer: Omit<Customer, 'id'>): Promise<void> => {
  const { errors } = await client.models.Customer.create({
    name: customer.name,
    address: customer.address,
    state: customer.state,
    stateCode: customer.stateCode,
    gstin: customer.gstin
  }, { authMode: 'apiKey' });
  if (errors) throw new Error(errors.map(e => e.message).join(', '));
};

export const deleteCustomer = async (id: string): Promise<void> => {
  const { errors } = await client.models.Customer.delete({ id }, { authMode: 'apiKey' });
  if (errors) throw new Error(errors.map(e => e.message).join(', '));
};

export const addMasterItem = async (item: Omit<MasterItem, 'id'>): Promise<void> => {
  const { errors } = await client.models.MasterItem.create({
    description: item.description,
    hsnCode: item.hsnCode,
    unit: item.unit,
    gstRate: item.gstRate
  }, { authMode: 'apiKey' });
  if (errors) throw new Error(errors.map(e => e.message).join(', '));
};

export const deleteMasterItem = async (id: string): Promise<void> => {
  const { errors } = await client.models.MasterItem.delete({ id }, { authMode: 'apiKey' });
  if (errors) throw new Error(errors.map(e => e.message).join(', '));
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
