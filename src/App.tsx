import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { InvoiceForm } from './components/InvoiceForm';
import { InvoicePreview } from './components/InvoicePreview';
import { Dashboard } from './views/Dashboard';
import { Reports } from './views/Reports';
import { Customers } from './views/Customers';
import { Items } from './views/Items';
import type { InvoiceData } from './types';
import { saveInvoice, getInvoiceByNo } from './lib/storage';
import { Receipt, LayoutDashboard, FileSpreadsheet, PlusCircle, Users, Package } from 'lucide-react';

function Sidebar() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="sidebar no-print">
      <div className="sidebar-header">
        <Receipt size={28} />
        <span>Billing App</span>
      </div>
      <nav className="sidebar-nav">
        <Link to="/" className={`btn ${isActive('/') ? 'btn-primary' : 'btn-secondary'}`} style={{ justifyContent: 'flex-start', border: 'none', boxShadow: 'none', backgroundColor: isActive('/') ? '' : 'transparent' }}>
          <LayoutDashboard size={18} /> Dashboard
        </Link>
        <Link to="/new" className={`btn ${isActive('/new') ? 'btn-primary' : 'btn-secondary'}`} style={{ justifyContent: 'flex-start', border: 'none', boxShadow: 'none', backgroundColor: isActive('/new') ? '' : 'transparent' }}>
          <PlusCircle size={18} /> New Invoice
        </Link>
        <Link to="/reports" className={`btn ${isActive('/reports') ? 'btn-primary' : 'btn-secondary'}`} style={{ justifyContent: 'flex-start', border: 'none', boxShadow: 'none', backgroundColor: isActive('/reports') ? '' : 'transparent' }}>
          <FileSpreadsheet size={18} /> Reports
        </Link>
        <Link to="/customers" className={`btn ${isActive('/customers') ? 'btn-primary' : 'btn-secondary'}`} style={{ justifyContent: 'flex-start', border: 'none', boxShadow: 'none', backgroundColor: isActive('/customers') ? '' : 'transparent' }}>
          <Users size={18} /> Customers
        </Link>
        <Link to="/items" className={`btn ${isActive('/items') ? 'btn-primary' : 'btn-secondary'}`} style={{ justifyContent: 'flex-start', border: 'none', boxShadow: 'none', backgroundColor: isActive('/items') ? '' : 'transparent' }}>
          <Package size={18} /> Items
        </Link>
      </nav>
    </div>
  );
}

function NewInvoiceWrapper() {
  const navigate = useNavigate();
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
    
    loadingCharges: '',
    transportCharges: '',
    otherCharges: '',
    hamali: '',
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
      <div className="app-container">
        <Sidebar />
        <main className="main-content" style={{ overflowY: 'auto' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/new" element={<NewInvoiceWrapper />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/items" element={<Items />} />
            <Route path="/preview/:invoiceNo" element={<PreviewWrapper />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
