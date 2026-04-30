import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import type { InvoiceData, InvoiceItem, Customer, MasterItem } from '../types';
import { getCustomers, getMasterItems } from '../lib/storage';

interface InvoiceFormProps {
  data: InvoiceData;
  onChange: (data: InvoiceData) => void;
  onGenerate: () => void;
}

export function InvoiceForm({ data, onChange, onGenerate }: InvoiceFormProps) {
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [itemsMaster, setItemsMaster] = React.useState<MasterItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchMasters() {
      try {
        const [cData, iData] = await Promise.all([getCustomers(), getMasterItems()]);
        setCustomers(cData);
        setItemsMaster(iData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchMasters();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onChange({ ...data, [name]: value });
  };

  const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const customerId = e.target.value;
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      onChange({
        ...data,
        customerId,
        receiverName: customer.name,
        receiverAddress: customer.address,
        receiverState: customer.state,
        receiverStateCode: customer.stateCode,
        receiverGstin: customer.gstin,
      });
    } else {
      onChange({ ...data, customerId: '' });
    }
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: uuidv4(),
      description: '',
      hsnCode: '',
      qty: 1,
      unit: '',
      inclusiveRate: 0,
      gstRate: 0,
    };
    onChange({ ...data, items: [...data.items, newItem] });
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    const newItems = data.items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    );
    onChange({ ...data, items: newItems });
  };

  const handleItemMasterChange = (id: string, itemId: string) => {
    const masterItem = itemsMaster.find(i => i.id === itemId);
    if (masterItem) {
      const newItems = data.items.map(item => 
        item.id === id ? { 
          ...item, 
          description: masterItem.description,
          hsnCode: masterItem.hsnCode,
          unit: masterItem.unit,
          gstRate: masterItem.gstRate
        } : item
      );
      onChange({ ...data, items: newItems });
    }
  };

  const removeItem = (id: string) => {
    onChange({ ...data, items: data.items.filter(item => item.id !== id) });
  };

  if (loading) {
    return <div className="card"><div className="card-body">Loading Master Data...</div></div>;
  }

  return (
    <div className="no-print">
      <div className="card mb-4">
        <div className="card-header">
          <h2>Select Customer</h2>
        </div>
        <div className="card-body form-row">
          <div className="form-col" style={{ flex: '100%' }}>
            <label className="form-label">Customer</label>
            <select className="form-control" name="customerId" value={data.customerId || ''} onChange={handleCustomerChange}>
              <option value="">-- Select Customer --</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name} - {c.gstin}</option>
              ))}
            </select>
          </div>
          {data.customerId && (
            <div className="form-col" style={{ flex: '100%' }}>
              <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                <strong>Address:</strong> {data.receiverAddress} <br/>
                <strong>State:</strong> {data.receiverState} ({data.receiverStateCode})
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <h2>Invoice Details</h2>
        </div>
        <div className="card-body form-row">
          <div className="form-col">
            <label className="form-label">Invoice No.</label>
            <input type="text" className="form-control" name="invoiceNo" value={data.invoiceNo} onChange={handleChange} />
          </div>
          <div className="form-col">
            <label className="form-label">Date of Supply</label>
            <input type="date" className="form-control" name="dateOfSupply" value={data.dateOfSupply} onChange={handleChange} />
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header flex justify-between items-center">
          <h2>Items (Enter Inclusive Rates)</h2>
          <button className="btn btn-primary" onClick={addItem}>
            <Plus size={16} /> Add Item
          </button>
        </div>
        <div className="card-body">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: '30%' }}>Item</th>
                  <th>HSN Code</th>
                  <th>GST %</th>
                  <th>Qty</th>
                  <th>Unit</th>
                  <th>Rate (Inc. GST)</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <select className="form-control" value={itemsMaster.find(i => i.description === item.description)?.id || ''} onChange={(e) => handleItemMasterChange(item.id, e.target.value)}>
                        <option value="">-- Select --</option>
                        {itemsMaster.map(i => (
                          <option key={i.id} value={i.id}>{i.description}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input type="text" className="form-control" value={item.hsnCode} readOnly style={{ backgroundColor: 'var(--bg-color)' }} />
                    </td>
                    <td>
                      <input type="text" className="form-control" value={item.gstRate + '%'} readOnly style={{ backgroundColor: 'var(--bg-color)' }} />
                    </td>
                    <td>
                      <input type="number" className="form-control" value={item.qty} onChange={(e) => updateItem(item.id, 'qty', parseFloat(e.target.value))} />
                    </td>
                    <td>
                      <input type="text" className="form-control" value={item.unit} readOnly style={{ backgroundColor: 'var(--bg-color)' }} />
                    </td>
                    <td>
                      <input type="number" className="form-control" value={item.inclusiveRate} onChange={(e) => updateItem(item.id, 'inclusiveRate', parseFloat(e.target.value))} placeholder="Inclusive Rate" />
                    </td>
                    <td>
                      <button className="btn btn-danger btn-icon" onClick={() => removeItem(item.id)}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <h2>Hamali Charges</h2>
        </div>
        <div className="card-body form-row">
          <div className="form-col">
            <label className="form-label">Hamali (Rs.)</label>
            <input type="number" className="form-control" name="hamali" value={data.hamali} onChange={(e) => onChange({ ...data, hamali: parseFloat(e.target.value) || 0 })} />
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <button className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }} onClick={onGenerate} disabled={!data.customerId || data.items.length === 0}>
          Save & Generate Invoice
        </button>
      </div>
    </div>
  );
}
