import type { Customer, MasterItem } from '../types';

export const mockCustomers: Customer[] = [
  {
    id: 'c1',
    name: 'Bajrang Supermarket',
    address: 'Godown 1, 2 And 3, Next To Chatrapati Shivaji Maharaj Auditorium, Final Plot 227, Amalner Jalgaon, Maharashtra, 425401',
    state: 'Maharashtra',
    stateCode: '27',
    gstin: '27AAGHJ5402D1ZN',
  },
  {
    id: 'c2',
    name: 'Shree Traders',
    address: 'Main Market, Jalgaon, Maharashtra, 425001',
    state: 'Maharashtra',
    stateCode: '27',
    gstin: '27ASDFG1234H1Z5',
  },
  {
    id: 'c3',
    name: 'Patil Kirana',
    address: 'Station Road, Bhusawal, Maharashtra, 425201',
    state: 'Maharashtra',
    stateCode: '27',
    gstin: '27QWERT5678J1Z9',
  }
];

export const mockItems: MasterItem[] = [
  {
    id: 'i1',
    description: 'Rajwadi',
    hsnCode: '17011310',
    unit: 'Kgs',
    gstRate: 5,
  },
  {
    id: 'i2',
    description: 'Premium Sugar',
    hsnCode: '17011490',
    unit: 'Kgs',
    gstRate: 5,
  },
  {
    id: 'i3',
    description: 'Wheat Flour (Atta)',
    hsnCode: '11010000',
    unit: 'Kgs',
    gstRate: 0,
  },
  {
    id: 'i4',
    description: 'Sunflower Oil 15L',
    hsnCode: '15121910',
    unit: 'Tin',
    gstRate: 5,
  }
];
