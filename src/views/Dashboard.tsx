import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getInvoices, deleteInvoice, getCustomers } from '../lib/storage';
import type { InvoiceData } from '../types';
import { FileText, Trash2, TrendingUp, Users, Calendar, IndianRupee } from 'lucide-react';

export function Dashboard() {
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [customerCount, setCustomerCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        const [invData, custData] = await Promise.all([getInvoices(), getCustomers()]);
        
        // Sort invoices by latest first (assuming invoiceNo has some chronical order or using date)
        // Since we don't have a strict createdAt, we'll just reverse the array assuming they were appended
        setInvoices(invData.reverse());
        setCustomerCount(custData.length);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
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

  // Metrics Calculations
  const totalRevenue = invoices.reduce((sum, inv) => sum + calculateTotal(inv), 0);
  
  // This month's revenue
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  
  const thisMonthRevenue = invoices.reduce((sum, inv) => {
    // dateOfSupply format is DD-MM-YYYY
    const parts = inv.dateOfSupply.split('-');
    if (parts.length === 3) {
      const invMonth = parseInt(parts[1], 10);
      const invYear = parseInt(parts[2], 10);
      if (invMonth === currentMonth && invYear === currentYear) {
        return sum + calculateTotal(inv);
      }
    }
    return sum;
  }, 0);

  const recentInvoices = invoices.slice(0, 5); // Show only top 5 recent

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2>Dashboard</h2>
      </div>

      {loading ? (
        <div className="text-center" style={{ padding: '2rem', color: 'var(--text-muted)' }}>
          <p>Loading analytics...</p>
        </div>
      ) : (
        <>
          {/* Metric Cards */}
          <div className="metric-grid">
            <div className="metric-card">
              <div className="metric-card-icon"><IndianRupee size={24} /></div>
              <div className="metric-card-title">Total Revenue</div>
              <div className="metric-card-value">₹{totalRevenue.toLocaleString('en-IN')}</div>
            </div>
            <div className="metric-card">
              <div className="metric-card-icon" style={{ backgroundColor: '#E0F2FE', color: '#0284C7' }}><Calendar size={24} /></div>
              <div className="metric-card-title">This Month</div>
              <div className="metric-card-value">₹{thisMonthRevenue.toLocaleString('en-IN')}</div>
            </div>
            <div className="metric-card">
              <div className="metric-card-icon" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}><TrendingUp size={24} /></div>
              <div className="metric-card-title">Total Invoices</div>
              <div className="metric-card-value">{invoices.length}</div>
            </div>
            <div className="metric-card">
              <div className="metric-card-icon" style={{ backgroundColor: '#DCFCE7', color: '#16A34A' }}><Users size={24} /></div>
              <div className="metric-card-title">Total Clients</div>
              <div className="metric-card-value">{customerCount}</div>
            </div>
          </div>

          <div className="flex justify-between items-center mb-4">
            <h2 style={{ fontSize: '1.25rem' }}>Recent Invoices</h2>
            {invoices.length > 5 && (
              <button className="btn btn-secondary" onClick={() => navigate('/invoices')} style={{ border: 'none', color: 'var(--primary)', boxShadow: 'none', backgroundColor: 'transparent', padding: 0 }}>
                View All →
              </button>
            )}
          </div>

          <div className="card">
            <div className="card-body">
              {invoices.length === 0 ? (
                <div className="text-center" style={{ padding: '2rem', color: 'var(--text-muted)' }}>
                  <FileText size={48} style={{ margin: '0 auto', marginBottom: '1rem', opacity: 0.5 }} />
                  <p>No invoices found. Tap the + button below to create your first invoice!</p>
                </div>
              ) : (
                <div className="invoice-grid">
                  {recentInvoices.map((inv) => (
                    <div 
                      className="invoice-card" 
                      key={inv.invoiceNo} 
                      onClick={() => navigate(`/preview/${encodeURIComponent(inv.invoiceNo)}`)}
                    >
                      <div className="invoice-card-header">
                        <div className="invoice-card-icon">
                          <FileText size={20} />
                        </div>
                        <div className="invoice-card-menu" onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(inv.invoiceNo);
                        }} title="Delete Invoice">
                          <Trash2 size={16} color="var(--danger)" />
                        </div>
                      </div>
                      
                      <div>
                        <div className="invoice-card-title">{inv.receiverName}</div>
                        <div className="invoice-card-subtitle">#{inv.invoiceNo.split('/').pop()}</div>
                      </div>
                      
                      <div className="invoice-card-footer">
                        <div className="invoice-card-date">{inv.dateOfSupply}</div>
                        <div className="invoice-card-amount">₹{calculateTotal(inv)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
      <div style={{ height: '80px' }} className="print-hidden"></div>
    </div>
  );
}
