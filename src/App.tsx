import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { InvoiceForm } from './components/InvoiceForm';
import { InvoicePreview } from './components/InvoicePreview';
import { Dashboard } from './views/Dashboard';
import { Reports } from './views/Reports';
import type { InvoiceData } from './types';
import { saveInvoice, getInvoiceByNo } from './lib/storage';
import { Receipt, LayoutDashboard, FileSpreadsheet, PlusCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

function Sidebar() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="sidebar no-print" style={{ width: '250px', backgroundColor: 'var(--surface)', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 'bold', fontSize: '1.25rem', color: 'var(--primary)', borderBottom: '1px solid var(--border-color)' }}>
        <Receipt size={28} />
        <span>Billing App</span>
      </div>
      <nav style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <Link to="/" className={`btn ${isActive('/') ? 'btn-primary' : 'btn-secondary'}`} style={{ justifyContent: 'flex-start', border: 'none', boxShadow: 'none', backgroundColor: isActive('/') ? '' : 'transparent' }}>
          <LayoutDashboard size={18} /> Dashboard
        </Link>
        <Link to="/new" className={`btn ${isActive('/new') ? 'btn-primary' : 'btn-secondary'}`} style={{ justifyContent: 'flex-start', border: 'none', boxShadow: 'none', backgroundColor: isActive('/new') ? '' : 'transparent' }}>
          <PlusCircle size={18} /> New Invoice
        </Link>
        <Link to="/reports" className={`btn ${isActive('/reports') ? 'btn-primary' : 'btn-secondary'}`} style={{ justifyContent: 'flex-start', border: 'none', boxShadow: 'none', backgroundColor: isActive('/reports') ? '' : 'transparent' }}>
          <FileSpreadsheet size={18} /> Reports
        </Link>
      </nav>
    </div>
  );
}

function NewInvoiceWrapper() {
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];
  const formattedToday = `${new Date().getDate().toString().padStart(2, '0')}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${new Date().getFullYear()}`;

  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    invoiceNo: `JT/${new Date().getFullYear().toString().slice(-2)}-${(new Date().getFullYear() + 1).toString().slice(-2)}/${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
    dateOfSupply: formattedToday,
    poNo: '',
    poDate: '',
    vehicleNo: '',
    nameOfTransport: 'Private',
    placeOfSupply: 'Amalner, Jalgoan',
    modeOfTransport: 'By Road',
    
    customerId: '',
    receiverName: '',
    receiverAddress: '',
    receiverState: '',
    receiverStateCode: '',
    receiverGstin: '',
    
    items: [],
    
    loadingCharges: 0,
    transportCharges: 0,
    otherCharges: 0,
    hamali: 0,
  });

  const handleGenerate = async () => {
    try {
      await saveInvoice(invoiceData);
      navigate(`/preview/${encodeURIComponent(invoiceData.invoiceNo)}`);
    } catch (e) {
      alert('Failed to save invoice. Please check your database connection.');
      console.error(e);
    }
  };

  return <InvoiceForm data={invoiceData} onChange={setInvoiceData} onGenerate={handleGenerate} />;
}

function PreviewWrapper() {
  const { invoiceNo } = useParams();
  const navigate = useNavigate();
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    async function fetchInv() {
      if (!invoiceNo) return;
      try {
        const data = await getInvoiceByNo(decodeURIComponent(invoiceNo));
        setInvoiceData(data || null);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchInv();
  }, [invoiceNo]);

  if (loading) {
    return <div className="card"><div className="card-body">Loading Invoice...</div></div>;
  }

  if (!invoiceData) {
    return <div className="card"><div className="card-body">Invoice not found!</div></div>;
  }

  return <InvoicePreview data={invoiceData} onEdit={() => navigate(-1)} />;
}

function App() {
  return (
    <BrowserRouter>
      <div className="app-container" style={{ flexDirection: 'row', height: '100vh', overflow: 'hidden' }}>
        <Sidebar />
        <main className="main-content" style={{ overflowY: 'auto', height: '100vh' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/new" element={<NewInvoiceWrapper />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/preview/:invoiceNo" element={<PreviewWrapper />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
