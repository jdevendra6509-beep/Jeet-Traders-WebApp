import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getInvoices, deleteInvoice } from '../lib/storage';
import type { InvoiceData } from '../types';
import { FileText, Search, Plus, Eye, Pencil, Printer, Trash2 } from 'lucide-react';

export function Invoices() {
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchInvoices() {
      try {
        const data = await getInvoices();
        // Sort by invoice list order, showing newest first
        setInvoices(data.reverse());
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
    if (confirm(`Are you sure you want to delete invoice ${invoiceNo}? This action cannot be undone.`)) {
      try {
        await deleteInvoice(invoiceNo);
        setInvoices(invoices.filter(i => i.invoiceNo !== invoiceNo));
      } catch (e) {
        alert('Failed to delete invoice');
        console.error(e);
      }
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    const query = searchQuery.toLowerCase();
    return (
      inv.invoiceNo.toLowerCase().includes(query) ||
      inv.receiverName.toLowerCase().includes(query) ||
      inv.dateOfSupply.includes(query)
    );
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2>Invoices</h2>
        <Link to="/new" className="btn btn-primary">
          <Plus size={16} /> New Invoice
        </Link>
      </div>

      {/* Search Filter Card */}
      <div className="card mb-4">
        <div className="card-body" style={{ padding: '1rem 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'relative' }}>
            <Search size={18} style={{ color: 'var(--text-muted)', position: 'absolute', left: '10px' }} />
            <input
              type="text"
              placeholder="Search by Invoice No. or Client Name..."
              className="form-control"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '36px', borderBottom: '1px solid var(--border-color)' }}
            />
          </div>
        </div>
      </div>

      {/* Invoices List Card */}
      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="text-center" style={{ padding: '2rem', color: 'var(--text-muted)' }}>
              <p>Loading invoices...</p>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="text-center" style={{ padding: '3rem', color: 'var(--text-muted)' }}>
              <FileText size={56} style={{ margin: '0 auto', marginBottom: '1.5rem', opacity: 0.4 }} />
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No Invoices Found</h3>
              <p style={{ fontSize: '0.9rem' }}>
                {searchQuery ? 'Try adjusting your search term.' : 'Click "New Invoice" to generate one.'}
              </p>
            </div>
          ) : (
            <div className="table-container" style={{ border: 'none', marginTop: 0, marginBottom: 0 }}>
              <table className="table responsive-table">
                <thead>
                  <tr>
                    <th style={{ width: '18%' }}>Invoice No.</th>
                    <th style={{ width: '15%' }}>Date</th>
                    <th style={{ width: '35%' }}>Customer</th>
                    <th style={{ width: '15%', textAlign: 'right' }}>Total Amount</th>
                    <th style={{ width: '17%', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((inv) => (
                    <tr key={inv.invoiceNo}>
                      <td data-label="Invoice No.">
                        <Link 
                          to={`/preview/${encodeURIComponent(inv.invoiceNo)}`}
                          style={{ fontWeight: '600', color: 'var(--primary)', textDecoration: 'none' }}
                        >
                          {inv.invoiceNo}
                        </Link>
                      </td>
                      <td data-label="Date">{inv.dateOfSupply}</td>
                      <td data-label="Customer">
                        <div style={{ fontWeight: '500', color: 'var(--text-main)' }}>{inv.receiverName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>GSTIN: {inv.receiverGstin || 'N/A'}</div>
                      </td>
                      <td data-label="Total Amount" style={{ textAlign: 'right', fontWeight: '700' }}>
                        ₹{calculateTotal(inv).toLocaleString('en-IN')}
                      </td>
                      <td data-label="Actions" style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '0.5rem', justifyContent: 'center' }}>
                          <button
                            className="btn btn-secondary btn-icon"
                            onClick={() => navigate(`/preview/${encodeURIComponent(inv.invoiceNo)}`)}
                            title="View Invoice"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            className="btn btn-secondary btn-icon"
                            onClick={() => navigate(`/edit/${encodeURIComponent(inv.invoiceNo)}`)}
                            title="Edit Invoice"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            className="btn btn-secondary btn-icon"
                            onClick={() => navigate(`/preview/${encodeURIComponent(inv.invoiceNo)}?print=true`)}
                            title="Print Invoice"
                          >
                            <Printer size={16} />
                          </button>
                          <button
                            className="btn btn-danger btn-icon"
                            onClick={() => handleDelete(inv.invoiceNo)}
                            title="Delete Invoice"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <div style={{ height: '80px' }} className="print-hidden"></div>
    </div>
  );
}
