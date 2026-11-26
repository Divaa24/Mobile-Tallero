import {
  User,
  Outlet,
  Category,
  Service,
  Vehicle,
  Booking,
  BookingStatus,
} from "../types/models";

export const formatRupiah = (amount: number): string => {
  return "Rp " + amount.toLocaleString("id-ID");
};

export const STATUS_CONFIG: Record<
  BookingStatus,
  { label: string; bg: string; text: string; step: number }
> = {
  PENDING: {
    label: "Menunggu Konfirmasi",
    bg: "bg-slate-100",
    text: "text-slate-700",
    step: 1,
  },
  CHECKED_IN: {
    label: "Kendaraan Diterima",
    bg: "bg-sky-100",
    text: "text-sky-800",
    step: 2,
  },
  IN_PROGRESS: {
    label: "Sedang Dikerjakan",
    bg: "bg-amber-100",
    text: "text-amber-800",
    step: 3,
  },
  READY_FOR_PICKUP: {
    label: "Siap Diambil",
    bg: "bg-indigo-100",
    text: "text-indigo-800",
    step: 4,
  },
  COMPLETED: {
    label: "Selesai",
    bg: "bg-emerald-100",
    text: "text-emerald-800",
    step: 5,
  },
  CANCELLED: {
    label: "Dibatalkan",
    bg: "bg-rose-100",
    text: "text-rose-700",
    step: 0,
  },
};

export const MOCK_USER: User = {
  id: 1,
  name: "Budi Santoso",
  email: "budi.santoso@email.com",
  phone: "081234567890",
  address: "Jl. Raya Sawangan No. 45, Depok",
  avatar: null,
  role: "CUSTOMER",
  isActive: true,
  isVerified: true,
};

export const MOCK_VEHICLES: Vehicle[] = [
  {
    id: 1,
    userId: 1,
    licensePlate: "B 1234 TLR",
    brand: "Honda",
    model: "Civic Turbo RS",
    type: "Car",
    year: 2022,
  },
  {
    id: 2,
    userId: 1,
    licensePlate: "B 5678 KLM",
    brand: "Yamaha",
    model: "NMAX 155 Connected",
    type: "Motorcycle",
    year: 2023,
  },
];

export const MOCK_OUTLETS: Outlet[] = [
  {
    id: 1,
    name: "Tallero Flagship Margonda",
    address: "Jl. Margonda Raya No. 214, Depok",
    phone: "021-7889123",
    latitude: -6.3728,
    longitude: 106.8324,
    isActive: true,
  },
  {
    id: 2,
    name: "Tallero Service Center Cinere",
    address: "Jl. Cinere Raya Blok A No. 12, Depok",
    phone: "021-7541098",
    latitude: -6.3264,
    longitude: 106.7845,
    isActive: true,
  },
];

export const MOCK_CATEGORIES: Category[] = [
  { id: 1, name: "Perawatan Rutin" },
  { id: 2, name: "Oli & Fluida" },
  { id: 3, name: "Performa Mesin" },
  { id: 4, name: "Rem & Kaki-Kaki" },
];

export const MOCK_SERVICES: Service[] = [
  {
    id: 1,
    categoryId: 1,
    category: { id: 1, name: "Perawatan Rutin" },
    name: "Servis Berkala 10.000 KM",
    price: 450000,
    estimatedTime: 90,
  },
  {
    id: 2,
    categoryId: 2,
    category: { id: 2, name: "Oli & Fluida" },
    name: "Ganti Oli Sintetis & Filter",
    price: 280000,
    estimatedTime: 45,
  },
  {
    id: 3,
    categoryId: 3,
    category: { id: 3, name: "Performa Mesin" },
    name: "Tune Up & Scanner ECU",
    price: 375000,
    estimatedTime: 75,
  },
  {
    id: 4,
    categoryId: 4,
    category: { id: 4, name: "Rem & Kaki-Kaki" },
    name: "Servis Rem & Balancing",
    price: 320000,
    estimatedTime: 60,
  },
];

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: 101,
    bookingCode: "TLR-20261126-001",
    userId: 1,
    outletId: 1,
    vehicleId: 1,
    serviceId: 1,
    mechanicId: 5,
    bookingDate: "2026-11-26T10:00:00.000Z",
    status: "IN_PROGRESS",
    customerNotes: "Tolong cek bunyi halus di roda depan kanan saat belok.",
    adminNotes: "Dikerjakan di Bay 02, estimasi selesai 11:30 WIB.",
    paymentMethod: "QRIS",
    paymentStatus: "UNPAID",
    totalPrice: 450000,
    outlet: MOCK_OUTLETS[0],
    vehicle: MOCK_VEHICLES[0],
    service: MOCK_SERVICES[0],
    mechanic: { id: 5, name: "Andi Pratama", phone: "081398765432" },
    statusLogs: [
      {
        id: 1,
        bookingId: 101,
        actorId: 1,
        status: "PENDING",
        notes: "Booking dibuat oleh pelanggan",
        createdAt: "2026-11-26T08:15:00.000Z",
      },
      {
        id: 2,
        bookingId: 101,
        actorId: 2,
        status: "CHECKED_IN",
        notes: "Kendaraan tiba di outlet Margonda",
        createdAt: "2026-11-26T09:55:00.000Z",
      },
      {
        id: 3,
        bookingId: 101,
        actorId: 5,
        status: "IN_PROGRESS",
        notes: "Pengecekan 25 titik & penggantian oli dimulai",
        createdAt: "2026-11-26T10:10:00.000Z",
      },
    ],
    review: null,
    createdAt: "2026-11-26T08:15:00.000Z",
  },
  {
    id: 98,
    bookingCode: "TLR-20261014-019",
    userId: 1,
    outletId: 2,
    vehicleId: 2,
    serviceId: 2,
    mechanicId: 6,
    bookingDate: "2026-10-14T14:00:00.000Z",
    status: "COMPLETED",
    customerNotes: "Ganti oli rutin bulanan.",
    adminNotes: "Semua kondisi normal.",
    paymentMethod: "TRANSFER",
    paymentStatus: "PAID",
    totalPrice: 280000,
    outlet: MOCK_OUTLETS[1],
    vehicle: MOCK_VEHICLES[1],
    service: MOCK_SERVICES[1],
    mechanic: { id: 6, name: "Rizky Maulana", phone: "081211223344" },
    statusLogs: [],
    review: null,
    createdAt: "2026-10-13T19:00:00.000Z",
  },
];