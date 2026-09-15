import { readFileSync } from 'node:fs';
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';

const outputsPath = process.argv[2] ?? new URL('../amplify_outputs.json', import.meta.url);
const outputs = JSON.parse(readFileSync(outputsPath, 'utf-8'));

Amplify.configure(outputs);
const client = generateClient({ authMode: 'apiKey' });

const readJson = (name) => JSON.parse(readFileSync(new URL(`../migration-data/${name}.json`, import.meta.url), 'utf-8'));

const customers = readJson('customers');
const items = readJson('items');
const invoices = readJson('invoices');

const skipCustomersAndItems = process.env.ONLY_INVOICES === '1';

console.log(`Importing ${customers.length} customers, ${items.length} items, ${invoices.length} invoices...`);

for (const row of skipCustomersAndItems ? [] : customers) {
  const { errors } = await client.models.Customer.create({
    id: row.id,
    name: row.name,
    address: row.address,
    state: row.state,
    stateCode: row.state_code,
    gstin: row.gstin,
  });
  if (errors) console.error(`Customer ${row.id} failed:`, errors);
}

for (const row of skipCustomersAndItems ? [] : items) {
  const { errors } = await client.models.MasterItem.create({
    id: row.id,
    description: row.description,
    hsnCode: row.hsn_code,
    unit: row.unit,
    gstRate: row.gst_rate,
  });
  if (errors) console.error(`Item ${row.id} failed:`, errors);
}

for (const row of invoices) {
  const { errors } = await client.models.Invoice.create({
    invoiceNo: row.invoice_no,
    dateOfSupply: row.date_of_supply,
    poNo: row.po_no,
    poDate: row.po_date,
    vehicleNo: row.vehicle_no,
    nameOfTransport: row.name_of_transport,
    placeOfSupply: row.place_of_supply,
    modeOfTransport: row.mode_of_transport,
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
    items: JSON.stringify(row.items_json),
  });
  if (errors) console.error(`Invoice ${row.invoice_no} failed:`, errors);
}

console.log('Import complete.');
