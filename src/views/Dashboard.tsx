import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getInvoices } from '../lib/storage';
import type { InvoiceData } from '../types';
import { FileText, Plus } from 'lucide-react';

export function Dashboard() {
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchInvoices() {
      try {
        const data = await getInvoices();
        setInvoices(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchInvoices();
  }, []);

  const calculateTotal = (invoice: InvoiceData) => {
    let subtotal = 0;
    let gst = 0;
    
    invoice.items.forEach(item => {
      // Inclusive rate logic: Taxable = Inclusive Rate / (1 + GST/100)
      const taxableRate = item.inclusiveRate / (1 + (item.gstRate / 100));
      const itemTaxableTotal = taxableRate * item.qty;
      subtotal += itemTaxableTotal;
      gst += itemTaxableTotal * (item.gstRate / 100);
    });
    
    const taxableAmount = subtotal + invoice.loadingCharges + invoice.transportCharges + invoice.otherCharges;
    const total = taxableAmount + gst + invoice.hamali;
    return Math.round(total);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2>Dashboard</h2>
        <button className="btn btn-primary" onClick={() => navigate('/new')}>
          <Plus size={16} /> Create New Invoice
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="text-center" style={{ padding: '2rem', color: 'var(--text-muted)' }}>
              <p>Loading invoices...</p>
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center" style={{ padding: '2rem', color: 'var(--text-muted)' }}>
              <FileText size={48} style={{ margin: '0 auto', marginBottom: '1rem', opacity: 0.5 }} />
              <p>No invoices found. Create your first invoice!</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Invoice No.</th>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Total Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.invoiceNo}>
                      <td>{inv.invoiceNo}</td>
                      <td>{inv.dateOfSupply}</td>
                      <td>{inv.receiverName}</td>
                      <td>₹ {calculateTotal(inv)}</td>
                      <td>
                        <button className="btn btn-secondary" onClick={() => navigate(`/preview/${encodeURIComponent(inv.invoiceNo)}`)}>
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
