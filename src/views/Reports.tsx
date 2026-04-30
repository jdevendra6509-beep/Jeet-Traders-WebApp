import React, { useEffect, useState } from 'react';
import { getInvoices } from '../lib/storage';
import type { InvoiceData } from '../types';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';

export function Reports() {
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [loading, setLoading] = useState(true);

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

  const handleExport = () => {
    const data = invoices.map(inv => {
      let subtotal = 0;
      let gst = 0;
      
      inv.items.forEach(item => {
        const taxableRate = item.inclusiveRate / (1 + (item.gstRate / 100));
        const itemTaxableTotal = taxableRate * item.qty;
        subtotal += itemTaxableTotal;
        gst += itemTaxableTotal * (item.gstRate / 100);
      });
      
      const taxableAmount = subtotal + inv.loadingCharges + inv.transportCharges + inv.otherCharges;
      const total = Math.round(taxableAmount + gst + inv.hamali);

      return {
        'Invoice No': inv.invoiceNo,
        'Date': inv.dateOfSupply,
        'Customer': inv.receiverName,
        'GSTIN': inv.receiverGstin,
        'Taxable Amount': taxableAmount.toFixed(2),
        'CGST': (gst / 2).toFixed(2),
        'SGST': (gst / 2).toFixed(2),
        'Hamali': inv.hamali,
        'Total Amount': total
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Invoices');
    XLSX.writeFile(workbook, `Invoices_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2>Reports</h2>
        <button className="btn btn-primary" onClick={handleExport} disabled={invoices.length === 0}>
          <Download size={16} /> Export to Excel
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          {loading ? (
            <p>Loading data...</p>
          ) : (
            <>
              <p>Total Invoices Generated: <strong>{invoices.length}</strong></p>
              <p className="mt-4 text-muted">Click the "Export to Excel" button to download a detailed summary of all your invoices.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
