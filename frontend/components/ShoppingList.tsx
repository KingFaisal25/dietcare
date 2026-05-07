"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Check, ShoppingCart, MessageCircle, Share2, Wallet } from "lucide-react";

interface ShoppingItem {
  item: string;
  quantity: string;
  estimated_price_idr: number;
}

export default function ShoppingList({ data }: { data: ShoppingItem[] }) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const toggleItem = (item: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(item)) {
      newChecked.delete(item);
    } else {
      newChecked.add(item);
    }
    setCheckedItems(newChecked);
  };

  const totalPrice = data.reduce((sum, item) => sum + item.estimated_price_idr, 0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleShareWhatsApp = () => {
    const text = `*Daftar Belanja Meal Plan Saya*\n\n` + 
      data.map(item => `- ${item.item} (${item.quantity})`).join('\n') + 
      `\n\n*Estimasi Total:* ${formatPrice(totalPrice)}\n\n_Dibuat dengan AI DietCare_`;
    
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-green-100 rounded-full">
            <ShoppingCart className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Daftar Belanja</h2>
            <p className="text-sm text-gray-500">{data.length} item untuk dibeli</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          onClick={handleShareWhatsApp}
          className="flex items-center gap-2 border-green-600 text-green-600 hover:bg-green-50"
        >
          <MessageCircle className="w-4 h-4" />
          Bagikan ke WhatsApp
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="divide-y overflow-hidden">
            {data.map((item, idx) => (
              <div 
                key={idx} 
                className={`p-4 flex items-center justify-between transition-colors cursor-pointer hover:bg-gray-50 ${checkedItems.has(item.item) ? 'bg-gray-50 opacity-60' : ''}`}
                onClick={() => toggleItem(item.item)}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${checkedItems.has(item.item) ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                    {checkedItems.has(item.item) && <Check className="w-4 h-4 text-white" />}
                  </div>
                  <div>
                    <h4 className={`font-semibold ${checkedItems.has(item.item) ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                      {item.item}
                    </h4>
                    <p className="text-sm text-gray-500">{item.quantity}</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-600">
                  {formatPrice(item.estimated_price_idr)}
                </span>
              </div>
            ))}
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-6 bg-blue-50 border-blue-100">
            <div className="flex items-center gap-3 mb-4">
              <Wallet className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-blue-800">Estimasi Budget</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-blue-700">
                <span>Total Belanja</span>
                <span className="font-bold text-lg">{formatPrice(totalPrice)}</span>
              </div>
              <p className="text-xs text-blue-600 italic mt-2">
                * Harga dapat bervariasi tergantung lokasi dan musim.
              </p>
            </div>
          </Card>

          <Button 
            className="w-full py-4 bg-green-600 hover:bg-green-700 text-white"
            onClick={() => alert("Daftar belanja disimpan!")}
          >
            Simpan Daftar Belanja
          </Button>
        </div>
      </div>
    </div>
  );
}
