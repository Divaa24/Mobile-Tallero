export type Role = "ADMIN" | "MECHANIC" | "CUSTOMER";

export type BookingStatus =
  | "PENDING"
  | "CHECKED_IN"
  | "IN_PROGRESS"
  | "READY_FOR_PICKUP"
  | "COMPLETED"
  | "CANCELLED";

export type PhotoType = "BEFORE" | "AFTER";
export type PaymentMethod = "CASH" | "TRANSFER" | "QRIS";
export type PaymentStatus = "UNPAID" | "PAID";

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  address?: string | null;
  avatar?: string | null;
  role: Role;
  isActive: boolean;
  isVerified: boolean;
}

export interface Outlet {
  id: number;
  name: string;
  address: string;
  phone?: string | null;
  latitude: number;
  longitude: number;
  isActive: boolean;
}

export interface Category {
  id: number;
  name: string;
}

export interface Service {
  id: number;
  categoryId: number;
  category?: Category;
  name: string;
  price: number;
  estimatedTime: number; // dalam menit
}

export interface Vehicle {
  id: number;
  userId: number;
  licensePlate: string;
  brand: string;
  model: string;
  type: string; // "Car" | "Motorcycle"
  year: number;
}

export interface BookingPhoto {
  id: number;
  bookingId: number;
  photoPath: string;
  type: PhotoType;
  createdAt: string;
}

export interface BookingLog {
  id: number;
  bookingId: number;
  actorId: number;
  status: BookingStatus;
  notes?: string | null;
  createdAt: string;
}

export interface Review {
  id: number;
  bookingId: number;
  userId: number;
  rating: number;
  comment?: string | null;
  createdAt: string;
}

export interface Booking {
  id: number;
  bookingCode: string;
  userId: number;
  outletId: number;
  vehicleId: number;
  serviceId: number;
  mechanicId?: number | null;
  bookingDate: string;
  status: BookingStatus;
  customerNotes?: string | null;
  adminNotes?: string | null;
  paymentMethod?: PaymentMethod | null;
  paymentStatus: PaymentStatus;
  totalPrice?: number | null;
  outlet?: Outlet;
  vehicle?: Vehicle;
  service?: Service;
  mechanic?: Pick<User, "id" | "name" | "phone"> | null;
  photos?: BookingPhoto[];
  statusLogs?: BookingLog[];
  review?: Review | null;
  createdAt: string;
}