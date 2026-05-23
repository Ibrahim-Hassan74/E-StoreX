
import { UUID } from 'crypto';
import { Address } from './auth';
import { BasketItem } from './basket';

export interface OrderToCreate {
  basketId: string;
  deliveryMethodId: string;
  shippingAddress: Address;
}

export interface Order {
  id: string;
  buyerEmail: string;
  orderDate: string;
  shippingAddress: Address;
  deliveryMethod: string;
  orderItems: OrderItem[];
  subTotal: number;
  total: number;
  status: string;
  paymentIntentId: string;
}

export interface OrderItem {
  productItemId: UUID;
  productName: string;
  mainImage: string;
  price: number;
  quantity: number;
}

export interface DeliveryMethod {
  id: string;
  name: string;
  deliveryTime: string;
  description: string;
  price: number;
}

export interface PaymentIntentResponse {
  paymentIntentId: string;
  clientSecret: string;
}
