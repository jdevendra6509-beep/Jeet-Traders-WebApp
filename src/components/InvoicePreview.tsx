import { useRef, useEffect } from 'react';
import type { InvoiceData } from '../types';
import { numberToWords } from '../lib/numberToWords';
import { ArrowLeft, Printer, Share2, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface InvoicePreviewProps {
  data: InvoiceData;
  onEdit: () => void;
}

export function InvoicePreview({ data, onEdit }: InvoicePreviewProps) {
  const printRef = useRef<HTMLDivElement>(null);

  // Math Logic (Inclusive to Exclusive)
  let subtotal = 0;
  let gstAmount = 0;
  
  data.items.forEach(item => {
    const incRate = Number(item.inclusiveRate) || 0;
    const qty = Number(item.qty) || 0;
    const taxableRate = incRate / (1 + (item.gstRate / 100));
    const itemTaxableTotal = taxableRate * qty;
    subtotal += itemTaxableTotal;
    gstAmount += itemTaxableTotal * (item.gstRate / 100);
  });
  
  const loading = Number(data.loadingCharges) || 0;
  const transport = Number(data.transportCharges) || 0;
  const other = Number(data.otherCharges) || 0;
  const hamali = Number(data.hamali) || 0;

  const taxableAmount = subtotal + loading + transport + other;
  const cgst = gstAmount / 2;
  const sgst = gstAmount / 2;

  const invoiceTotal = taxableAmount + cgst + sgst + hamali;
  const roundedTotal = Math.round(invoiceTotal);
  const totalInWords = numberToWords(roundedTotal) + ' Only';

  const generatePdfBlob = async (): Promise<Blob | null> => {
    const element = printRef.current;
    if (!element) return null;
    
    // Create canvas
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    
    // A4 dimensions: 210 x 297 mm
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    return pdf.output('blob');
  };

  const handleDownload = async () => {
    const element = printRef.current;
    if (!element) return;
    
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Invoice_${data.invoiceNo}.pdf`);
  };

  const handleShare = async () => {
    try {
      const blob = await generatePdfBlob();
      if (!blob) return;

      const file = new File([blob], `Invoice_${data.invoiceNo}.pdf`, { type: 'application/pdf' });
      
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Invoice ${data.invoiceNo}`,
          text: 'Please find attached the invoice.',
        });
      } else {
        alert('Your browser does not support sharing files directly. Please download the PDF and share it manually.');
        handleDownload(); // fallback
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  // Auto download on mount (Simulating user requirement "pdf will be downloaded and share will open immediately")
  useEffect(() => {
    // Adding a slight delay to ensure fonts/css are loaded before drawing canvas
    const timer = setTimeout(() => {
      handleDownload().then(() => {
        handleShare();
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      <div className="no-print mb-4 flex justify-between items-center">
        <button className="btn btn-secondary" onClick={onEdit}>
          <ArrowLeft size={16} /> Back
        </button>
        <div className="flex gap-2">
          <button className="btn btn-secondary" onClick={() => window.print()}>
            <Printer size={16} /> Print
          </button>
          <button className="btn btn-secondary" onClick={handleDownload}>
            <Download size={16} /> Download
          </button>
          <button className="btn btn-primary" onClick={handleShare}>
            <Share2 size={16} /> Share
          </button>
        </div>
      </div>

      <div className="invoice-print-container" ref={printRef} style={{ padding: '20px', backgroundColor: 'white' }}>
        <div style={{ border: '2px solid black', padding: '0px' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', borderBottom: '1px solid black', padding: '4px' }}>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>JEET TRADERS</h1>
          </div>
          
          <div className="flex-row" style={{ borderBottom: '1px solid black' }}>
            <div style={{ width: '15%', padding: '4px 8px', fontWeight: 'bold', borderRight: '1px solid black' }}>Reg office :</div>
            <div style={{ width: '85%', padding: '4px 8px' }}>
              13, Gangaghat, Shivaji Market, Amalner, PIN - 425401, Maharashtra
            </div>
          </div>
          
          <div style={{ textAlign: 'center', borderBottom: '1px solid black', padding: '4px', fontWeight: 'bold', fontSize: '16px' }}>
            GSTIN: 27ASXPJ0869M1ZS
          </div>
          
          <div style={{ textAlign: 'center', borderBottom: '1px solid black', padding: '4px', fontWeight: 'bold', fontSize: '18px' }}>
            TAX INVOICE
          </div>

          {/* Details Row 1 */}
          <div className="flex-row" style={{ borderBottom: '1px solid black' }}>
            <div style={{ width: '100%', padding: '4px 8px' }}>
              <div className="flex-row justify-between"><span>Invoice No. : <b>{data.invoiceNo}</b></span> <span>Date of Supply : {data.dateOfSupply}</span></div>
              <div className="flex-row justify-between"><span>P.O No.: {data.poNo}</span> <span>P.O Date : {data.poDate}</span></div>
              <div className="flex-row justify-between"><span>Vehicle No: {data.vehicleNo}</span> <span>Name of Transport : {data.nameOfTransport}</span></div>
              <div className="flex-row justify-between"><span>Place OF Supply : {data.placeOfSupply}</span> <span>Mode of Transport : {data.modeOfTransport}</span></div>
            </div>
          </div>

          {/* Receiver / Consignee */}
          <div className="flex-row" style={{ borderBottom: '1px solid black' }}>
            <div style={{ width: '100%', padding: '4px 8px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Details of Receiver (Billed to) :</div>
              <div><b>Name: {data.receiverName}</b></div>
              <div>Address: {data.receiverAddress}</div>
              <div>State: {data.receiverState}</div>
              <div>State Code: {data.receiverStateCode}</div>
              <div style={{ fontWeight: 'bold' }}>GSTIN : {data.receiverGstin}</div>
            </div>
          </div>

          {/* Table */}
          <table className="invoice-table" style={{ border: 'none', borderBottom: '1px solid black' }}>
            <thead>
              <tr>
                <th style={{ width: '5%' }}>Sr.<br/>No.</th>
                <th style={{ width: '30%' }}>Description of Goods</th>
                <th style={{ width: '10%' }}>HSN Code</th>
                <th style={{ width: '8%' }}>Qty</th>
                <th style={{ width: '8%' }}>Unit</th>
                <th style={{ width: '8%' }}>Taxable<br/>Rate</th>
                <th style={{ width: '10%' }}>Total</th>
                <th style={{ width: '8%' }}>Loading<br/>Charges</th>
                <th style={{ width: '8%' }}>Transport<br/>Charges</th>
                <th style={{ width: '8%' }}>Other<br/>Charges</th>
                <th style={{ width: '10%' }}>Taxable<br/>Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, index) => {
                const incRate = Number(item.inclusiveRate) || 0;
                const qty = Number(item.qty) || 0;
                const taxableRate = incRate / (1 + (item.gstRate / 100));
                const total = taxableRate * qty;
                
                return (
                  <tr key={item.id} style={{ borderBottom: 'none' }}>
                    <td style={{ textAlign: 'center', borderBottom: 'none', borderTop: 'none', height: '30px' }}>{index + 1}</td>
                    <td style={{ borderBottom: 'none', borderTop: 'none' }}>{item.description}</td>
                    <td style={{ textAlign: 'center', borderBottom: 'none', borderTop: 'none' }}>{item.hsnCode}</td>
                    <td style={{ textAlign: 'center', borderBottom: 'none', borderTop: 'none' }}>{qty}</td>
                    <td style={{ textAlign: 'center', borderBottom: 'none', borderTop: 'none' }}>{item.unit}</td>
                    <td style={{ textAlign: 'center', borderBottom: 'none', borderTop: 'none' }}>{taxableRate.toFixed(2)}</td>
                    <td style={{ textAlign: 'right', borderBottom: 'none', borderTop: 'none' }}>{total.toFixed(2)}</td>
                    {index === 0 ? (
                      <>
                        <td rowSpan={Math.max(2, data.items.length)} style={{ textAlign: 'center', verticalAlign: 'top', paddingTop: '10px' }}>{loading}</td>
                        <td rowSpan={Math.max(2, data.items.length)} style={{ textAlign: 'center', verticalAlign: 'top', paddingTop: '10px' }}>{transport}</td>
                        <td rowSpan={Math.max(2, data.items.length)} style={{ textAlign: 'center', verticalAlign: 'top', paddingTop: '10px' }}>{other}</td>
                        <td rowSpan={Math.max(2, data.items.length)} style={{ textAlign: 'right', verticalAlign: 'top', paddingTop: '10px' }}>{taxableAmount.toFixed(2)}</td>
                      </>
                    ) : null}
                  </tr>
                );
              })}
              <tr style={{ borderTop: '1px solid black' }}>
                <td colSpan={3} style={{ borderRight: 'none' }}></td>
                <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
                  {data.items.reduce((sum, item) => sum + (Number(item.qty) || 0), 0).toFixed(2)}
                </td>
                <td colSpan={7} style={{ borderLeft: 'none' }}></td>
              </tr>
            </tbody>
          </table>

          {/* Totals Section */}
          <div className="flex-row" style={{ borderBottom: '1px solid black' }}>
            <div style={{ width: '75%', borderRight: '1px solid black', display: 'flex', flexDirection: 'column' }}>
              <div style={{ flex: 1, padding: '8px', borderBottom: '1px solid black', textAlign: 'center', fontWeight: 'bold', fontSize: '16px' }}>
                Terms of Payment : Immediate
              </div>
              <div style={{ flex: 1, padding: '8px', fontWeight: 'bold', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                Total (In Words) : Rs. {totalInWords}.
              </div>
            </div>
            <div style={{ width: '25%' }}>
              <div className="flex-row justify-between" style={{ padding: '4px', borderBottom: '1px solid black' }}>
                <span style={{ fontWeight: 'bold' }}>Total Rs.</span>
                <span>{taxableAmount.toFixed(2)}</span>
              </div>
              <div className="flex-row justify-between" style={{ padding: '4px', borderBottom: '1px solid black' }}>
                <span style={{ fontWeight: 'bold' }}>CGST</span>
                <span></span>
                <span>{cgst.toFixed(2)}</span>
              </div>
              <div className="flex-row justify-between" style={{ padding: '4px', borderBottom: '1px solid black' }}>
                <span style={{ fontWeight: 'bold' }}>SGST</span>
                <span></span>
                <span>{sgst.toFixed(2)}</span>
              </div>
              <div className="flex-row justify-between" style={{ padding: '4px', borderBottom: '1px solid black' }}>
                <span style={{ fontWeight: 'bold' }}>HAMALI</span>
                <span>{hamali.toFixed(2)}</span>
              </div>
              <div className="flex-row justify-between" style={{ padding: '4px', borderBottom: '1px solid black' }}>
                <span style={{ fontWeight: 'bold' }}>Invoice Total</span>
                <span>{invoiceTotal.toFixed(2)}</span>
              </div>
              <div className="flex-row justify-between" style={{ padding: '4px' }}>
                <span style={{ fontWeight: 'bold' }}>Rounded Off</span>
                <span>{roundedTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer Section */}
          <div className="flex-row">
            <div style={{ width: '65%', borderRight: '1px solid black', padding: '4px 8px', fontSize: '11px' }}>
              <p>Certified that the particulars given above are true & correct and the amount indicated represents the price actually charged and there is no flow of additional consideration directly or indirectly from the buyer.</p>
              <br/>
              <p style={{ fontSize: '9px', fontWeight: 'bold' }}>TERMS & CONDITION : Interest will be recovered @ 24% p.a. on overdue unpaid bills, claim of any nature whatsoever will lapse unless raised in writing within 3 days from the date of invoice. Goods once sold cannot be returned and/or exchanged. We reserve to ourselves the right to demand payment of this bill at any time before due date. "SUBJECT TO MUMBAI JURISDICTION."</p>
            </div>
            <div style={{ width: '35%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '4px 8px', borderBottom: '1px solid black', fontSize: '12px' }}>
                <div style={{ fontWeight: 'bold' }}>Bank Details :Jeet Traders</div>
                <div style={{ fontWeight: 'bold' }}>IFSC Code: UTIB0002574</div>
                <div style={{ fontWeight: 'bold' }}>Account No: 921020000021696</div>
                <div style={{ fontWeight: 'bold' }}>Bank: Axis Bank,AMALNER</div>
              </div>
              <div style={{ padding: '4px 8px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ fontWeight: 'bold' }}>For,</div>
                <div style={{ textAlign: 'center', fontWeight: 'bold', marginTop: '10px' }}>JEET TRADERS</div>
                <div style={{ textAlign: 'right', fontWeight: 'bold', marginTop: '40px' }}>Authorised Signatory</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
