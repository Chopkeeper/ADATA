import { Product, Order, Coupon } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Notebook Asus TUF Gaming F15',
    description: 'Intel Core i5-11400H / 8GB / 512GB SSD / RTX 3050. The ASUS TUF Gaming F15 is a powerful Windows 10 gaming laptop that combines gaming performance with up to a narrow bezel IPS-type panel and an extended lifespan.',
    price: 24990,
    discountPercent: 10,
    category: 'Notebook',
    image: 'https://picsum.photos/500/500?random=1',
    images: [
      'https://picsum.photos/800/800?random=1',
      'https://picsum.photos/800/800?random=101',
      'https://picsum.photos/800/800?random=102',
      'https://picsum.photos/800/800?random=103'
    ],
    stock: 50,
    shippingCost: 150
  },
  {
    id: '2',
    name: 'Monitor 24" LG 24MP400-B',
    description: 'IPS / 75Hz / 5ms / HDMI / FreeSync',
    price: 3500,
    discountPercent: 0,
    category: 'Monitor',
    image: 'https://picsum.photos/500/500?random=2',
    images: [
      'https://picsum.photos/800/800?random=2',
      'https://picsum.photos/800/800?random=201'
    ],
    stock: 20,
    shippingCost: 100
  },
  {
    id: '3',
    name: 'CPU Intel Core i5-13500',
    description: 'LGA 1700 / 14 Cores / 20 Threads',
    price: 9490,
    discountPercent: 5,
    category: 'CPU',
    image: 'https://picsum.photos/500/500?random=3',
    images: ['https://picsum.photos/800/800?random=3'],
    stock: 15,
    shippingCost: 50
  },
  {
    id: '4',
    name: 'VGA GALAX GeForce RTX 4060',
    description: '8GB GDDR6 / 1-Click OC 2X',
    price: 10900,
    discountPercent: 2,
    category: 'VGA',
    image: 'https://picsum.photos/500/500?random=4',
    images: ['https://picsum.photos/800/800?random=4'],
    stock: 10,
    shippingCost: 80
  },
  {
    id: '5',
    name: 'RAM DDR5(5200) 16GB Kingston Fury Beast',
    description: '16GB / 5200MHz / CL40',
    price: 2190,
    discountPercent: 0,
    category: 'RAM',
    image: 'https://picsum.photos/500/500?random=5',
    images: ['https://picsum.photos/800/800?random=5'],
    stock: 100,
    shippingCost: 40
  },
  {
    id: '6',
    name: 'SSD M.2 PCIe 500GB WD Blue SN570',
    description: 'NVMe / Read 3500MB/s / Write 2300MB/s',
    price: 1390,
    discountPercent: 15,
    category: 'SSD',
    image: 'https://picsum.photos/500/500?random=6',
    images: ['https://picsum.photos/800/800?random=6'],
    stock: 45,
    shippingCost: 40
  }
];

export const INITIAL_COUPONS: Coupon[] = [
  { id: 'c1', code: 'WELCOME100', type: 'fixed', value: 100, isActive: true },
  { id: 'c2', code: 'SALE5', type: 'percent', value: 5, isActive: true },
  { id: 'c3', code: 'FREESHIP', type: 'free_shipping', value: 0, isActive: true },
];

export const MOCK_ORDERS: Order[] = [
  {
    id: 'ORD-001',
    userId: 'user-1',
    items: [{ ...INITIAL_PRODUCTS[0], quantity: 1 }],
    subtotal: 22491,
    shippingTotal: 150,
    taxAmount: 1574.37,
    discountTotal: 0,
    totalAmount: 24215.37,
    status: 'verified',
    paymentMethod: 'promptpay',
    timestamp: new Date('2023-10-15').getTime()
  },
  {
    id: 'ORD-002',
    userId: 'user-2',
    items: [{ ...INITIAL_PRODUCTS[2], quantity: 1 }],
    subtotal: 9015.5,
    shippingTotal: 50,
    taxAmount: 631.08,
    discountTotal: 0,
    totalAmount: 9696.58,
    status: 'verified',
    paymentMethod: 'promptpay',
    timestamp: new Date('2023-11-20').getTime()
  },
  {
    id: 'ORD-003',
    userId: 'user-3',
    items: [{ ...INITIAL_PRODUCTS[3], quantity: 1 }],
    subtotal: 10682,
    shippingTotal: 80,
    taxAmount: 747.74,
    discountTotal: 0,
    totalAmount: 11509.74,
    status: 'issue_reported',
    adminNote: 'Customer reported damaged box upon arrival.',
    paymentMethod: 'promptpay',
    timestamp: new Date('2023-12-05').getTime()
  }
];