import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getInvoices, deleteInvoice } from '../lib/storage';
import type { InvoiceData } from '../types';
import { FileText, Plus, Trash2, Download } from 'lucide-react';

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
      const incRate = Number(item.inclusiveRate) || 0;
      const qty = Number(item.qty) || 0;
      // Inclusive rate logic: Taxable = Inclusive Rate / (1 + GST/100)
      const taxableRate = incRate / (1 + (item.gstRate / 100));
      const itemTaxableTotal = taxableRate * qty;
      subtotal += itemTaxableTotal;
      gst += itemTaxableTotal * (item.gstRate / 100);
    });
    
    const loading = Number(invoice.loadingCharges) || 0;
    const transport = Number(invoice.transportCharges) || 0;
    const other = Number(invoice.otherCharges) || 0;
    const hamali = Number(invoice.hamali) || 0;

    const taxableAmount = subtotal + loading + transport + other;
    const total = taxableAmount + gst + hamali;
    return Math.round(total);
  };

  const handleDelete = async (invoiceNo: string) => {
    if (confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) {
      try {
        await deleteInvoice(invoiceNo);
        setInvoices(invoices.filter(i => i.invoiceNo !== invoiceNo));
      } catch (e) {
        alert('Failed to delete invoice');
        console.error(e);
      }
    }
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
            <div className="invoice-list">
              {invoices.map((inv) => (
                <div className="invoice-card" key={inv.invoiceNo}>
                  <div className="invoice-card-header">
                    <div className="flex items-center" style={{ flex: 1 }}>
                      <div className="invoice-card-icon">
                        <FileText size={24} />
                      </div>
                      <div className="invoice-card-details">
                        <div className="invoice-card-title">{inv.receiverName}</div>
                        <div className="invoice-card-subtitle">{inv.invoiceNo} • {inv.dateOfSupply}</div>
                      </div>
                    </div>
                    <div className="invoice-card-badge">
                      Generated
                    </div>
                  </div>
                  
                  <div className="invoice-card-footer">
                    <div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>Amount</div>
                      <div className="invoice-card-amount">₹ {calculateTotal(inv)}</div>
                    </div>
                    <div className="flex gap-2">
                      <button className="btn btn-secondary" onClick={() => navigate(`/preview/${encodeURIComponent(inv.invoiceNo)}`)} title="View & Download">
                        <Download size={16} /> View
                      </button>
                      <button className="btn btn-danger btn-icon" onClick={() => handleDelete(inv.invoiceNo)} title="Delete Invoice">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
