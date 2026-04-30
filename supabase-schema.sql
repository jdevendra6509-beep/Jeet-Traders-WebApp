-- Execute this in your Supabase SQL Editor

-- 1. Create Customers Table
CREATE TABLE customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  state TEXT NOT NULL,
  state_code TEXT NOT NULL,
  gstin TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Items Master Table
CREATE TABLE items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  description TEXT NOT NULL,
  hsn_code TEXT NOT NULL,
  unit TEXT NOT NULL,
  gst_rate NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Invoices Table
CREATE TABLE invoices (
  invoice_no TEXT PRIMARY KEY,
  date_of_supply TEXT NOT NULL,
  po_no TEXT,
  po_date TEXT,
  vehicle_no TEXT,
  name_of_transport TEXT,
  place_of_supply TEXT,
  mode_of_transport TEXT,
  customer_id UUID REFERENCES customers(id),
  receiver_name TEXT NOT NULL,
  receiver_address TEXT NOT NULL,
  receiver_state TEXT NOT NULL,
  receiver_state_code TEXT NOT NULL,
  receiver_gstin TEXT NOT NULL,
  loading_charges NUMERIC DEFAULT 0,
  transport_charges NUMERIC DEFAULT 0,
  other_charges NUMERIC DEFAULT 0,
  hamali NUMERIC DEFAULT 0,
  items_json JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert Dummy Data for Masters
INSERT INTO customers (id, name, address, state, state_code, gstin) VALUES 
('11111111-1111-1111-1111-111111111111', 'Bajrang Supermarket', 'Godown 1, 2 And 3, Next To Chatrapati Shivaji Maharaj Auditorium, Final Plot 227, Amalner Jalgaon, Maharashtra, 425401', 'Maharashtra', '27', '27AAGHJ5402D1ZN'),
('22222222-2222-2222-2222-222222222222', 'Shree Traders', 'Main Market, Jalgaon, Maharashtra, 425001', 'Maharashtra', '27', '27ASDFG1234H1Z5');

INSERT INTO items (id, description, hsn_code, unit, gst_rate) VALUES 
('33333333-3333-3333-3333-333333333333', 'Rajwadi', '17011310', 'Kgs', 5),
('44444444-4444-4444-4444-444444444444', 'Premium Sugar', '17011490', 'Kgs', 5),
('55555555-5555-5555-5555-555555555555', 'Wheat Flour (Atta)', '11010000', 'Kgs', 0);
