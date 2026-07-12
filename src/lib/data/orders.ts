import { Order, Address } from "@/lib/types";

export const mockAddresses: Address[] = [
  {
    id: "addr1",
    label: "Home",
    recipientName: "Mohamed A.",
    phone: "082 555 0134",
    line1: "12 Ferreira Street",
    suburb: "West Acres",
    city: "Mbombela",
    province: "Mpumalanga",
    postalCode: "1201",
    isDefault: true,
  },
  {
    id: "addr2",
    label: "Work",
    recipientName: "Mohamed A.",
    phone: "082 555 0134",
    line1: "5 Bester Street, Riverside Mall Offices",
    suburb: "Riverside",
    city: "Mbombela",
    province: "Mpumalanga",
    postalCode: "1213",
  },
];

export const mockOrders: Order[] = [
  {
    id: "o1",
    orderNumber: "A2Z-100482",
    status: "shipped",
    fulfilmentMethod: "delivery",
    paymentMethod: "payfast",
    items: [
      {
        productId: "p1",
        title: "JBL Flip 6 Portable Speaker",
        sku: "A2Z-JBL-FLIP6",
        unitPrice: 1899,
        quantity: 1,
        colorway: "Black",
        image: "/images/products/jbl-flip6-1.jpg",
      },
    ],
    subtotal: 1899,
    deliveryFee: 99,
    total: 1998,
    address: mockAddresses[0],
    trackingNumber: "CG-ZA-88213410",
    placedAt: "2026-07-02T10:14:00Z",
  },
  {
    id: "o2",
    orderNumber: "A2Z-100411",
    status: "delivered",
    fulfilmentMethod: "collection",
    paymentMethod: "eft",
    items: [
      {
        productId: "p3",
        title: "Anker 737 Power Bank 24000mAh",
        sku: "A2Z-ANK-737",
        unitPrice: 2299,
        quantity: 1,
        image: "/images/products/anker737-1.jpg",
      },
    ],
    subtotal: 2299,
    deliveryFee: 0,
    total: 2299,
    collectionStore: "A2Z Riverside Mall, Mbombela",
    placedAt: "2026-06-18T14:02:00Z",
  },
];
