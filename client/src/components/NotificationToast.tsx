import { useEffect } from "react";
import { Market } from "@/lib/market-data";

interface NotificationToastProps {
  market: Market;
  onClose: () => void;
}

export default function NotificationToast({ market, onClose }: NotificationToastProps) {
  // Auto close after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [onClose]);
  
  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg max-w-sm w-full overflow-hidden z-40">
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 bg-[#FFC107] rounded-full p-2">
            <span className="material-icons text-white">notifications_active</span>
          </div>
          <div className="ml-4 flex-1">
            <p className="font-medium text-[#333333]">{market.name} Market Opening</p>
            <p className="text-gray-500 text-sm">
              The {market.name} forex market is now open for trading.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="flex-shrink-0 text-gray-400 hover:text-gray-500"
          >
            <span className="material-icons">close</span>
          </button>
        </div>
      </div>
    </div>
  );
}
