import { useEffect, useState } from 'react';
import { getCustomers, addCustomer, deleteCustomer } from '../lib/storage';
import type { Customer } from '../types';
import { Trash2, Plus } from 'lucide-react';

export function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    state: '',
    stateCode: '',
    gstin: ''
  });

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const data = await getCustomers();
      setCustomers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addCustomer(formData);
      setFormData({ name: '', address: '', state: '', stateCode: '', gstin: '' });
      fetchCustomers();
    } catch (error) {
      alert('Failed to add customer');
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      try {
        await deleteCustomer(id);
        fetchCustomers();
      } catch (error) {
        alert('Failed to delete customer');
        console.error(error);
      }
    }
  };

  return (
    <div>
      <div className="header mb-4" style={{ position: 'relative', border: 'none', padding: 0, backgroundColor: 'transparent', boxShadow: 'none' }}>
        <h1 className="header-title">Customer Master</h1>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <h2 style={{ fontSize: '1.1rem' }}>Add New Customer</h2>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-col">
                <label className="form-label">Name</label>
                <input required type="text" className="form-control" name="name" value={formData.name} onChange={handleChange} />
              </div>
              <div className="form-col" style={{ flex: 2 }}>
                <label className="form-label">Address</label>
                <input required type="text" className="form-control" name="address" value={formData.address} onChange={handleChange} />
              </div>
            </div>
            <div className="form-row mt-4">
              <div className="form-col">
                <label className="form-label">State</label>
                <input required type="text" className="form-control" name="state" value={formData.state} onChange={handleChange} />
              </div>
              <div className="form-col">
                <label className="form-label">State Code</label>
                <input required type="text" className="form-control" name="stateCode" value={formData.stateCode} onChange={handleChange} />
              </div>
              <div className="form-col">
                <label className="form-label">GSTIN</label>
                <input required type="text" className="form-control" name="gstin" value={formData.gstin} onChange={handleChange} />
              </div>
            </div>
            <div className="mt-4">
              <button type="submit" className="btn btn-primary">
                <Plus size={16} /> Add Customer
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 style={{ fontSize: '1.1rem' }}>Existing Customers</h2>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <p style={{ padding: '1.5rem' }}>Loading...</p>
          ) : (
            <div className="table-container" style={{ margin: 0, border: 'none', borderRadius: 0 }}>
              <table className="table responsive-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Address</th>
                    <th>State</th>
                    <th>GSTIN</th>
                    <th style={{ width: '50px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map(c => (
                    <tr key={c.id}>
                      <td data-label="Name" style={{ fontWeight: 500 }}>{c.name}</td>
                      <td data-label="Address">{c.address}</td>
                      <td data-label="State">{c.state} ({c.stateCode})</td>
                      <td data-label="GSTIN">{c.gstin}</td>
                      <td data-label="Action">
                        <button className="btn btn-icon btn-danger" onClick={() => handleDelete(c.id)}>
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {customers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center text-muted">No customers found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
