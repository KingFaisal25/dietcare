// Shop-wide TypeScript types
export interface ShopProduct {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  image_url: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  category: string;
  is_healthy: boolean;
  is_nutritionist_recommended: boolean;
  nutritionist_label: string | null;
  stock: number;
  is_active: boolean;
  created_at: string;
}

export interface CartItem {
  product: ShopProduct;
  quantity: number;
}

export interface ShopOrderItem {
  id: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
  product: {
    id: number;
    name: string;
    slug: string;
    image_url: string;
    calories: number;
  } | null;
}

export interface ShopOrder {
  id: number;
  order_number: string;
  user?: { id: number; name: string; email: string } | null;
  customer_name: string;
  address: string;
  phone: string;
  delivery_type: 'instant' | 'scheduled';
  delivery_time: 'pagi' | 'siang' | 'malam' | null;
  payment_method: 'cod' | 'transfer' | 'ewallet';
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: 'pending' | 'diproses' | 'dikirim' | 'sampai' | 'dibatalkan';
  status_label: string;
  tracking_code: string | null;
  notes: string | null;
  processed_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  created_at: string;
  items: ShopOrderItem[];
}
