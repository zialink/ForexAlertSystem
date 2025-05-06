import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Market } from "@/lib/market-data";
import { useSettings } from "@/hooks/use-settings";

interface MarketCardProps {
  market: Market;
}

export default function MarketCard({ market }: MarketCardProps) {
  const { settings, updateMarketNotification, updateMarketSound } = useSettings();
  
  // Check if notifications and sounds are enabled for this market
  const notificationsEnabled = settings.marketNotifications.includes(market.id);
  const soundEnabled = settings.marketSounds.includes(market.id);
  
  const statusColor = market.isOpen ? "text-[#4CAF50]" : "text-[#F44336]";
  const statusBg = market.isOpen ? "market-open" : "market-closed";
  const statusIndicator = market.isOpen ? "OPEN" : "CLOSED";
  const timeLabel = market.isOpen ? "Closes In" : "Opens In";
  
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${statusBg}`}>
      <div className="p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-medium text-lg text-[#333333]">{market.name}</h3>
          <div className="flex items-center">
            <span className={`inline-block w-3 h-3 rounded-full ${market.isOpen ? "bg-[#4CAF50]" : "bg-[#F44336]"} mr-2`}></span>
            <span className={`font-medium ${statusColor}`}>{statusIndicator}</span>
          </div>
        </div>
        
        <div className="flex justify-between mb-3">
          <div>
            <p className="text-sm text-gray-500">Opening Hours (Local)</p>
            <p className="font-medium">{market.hours}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">{timeLabel}</p>
            <p className="time-display font-bold text-[#333333]">{market.countdown}</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Switch 
              id={`${market.id}-notification`}
              checked={notificationsEnabled}
              onCheckedChange={(checked) => updateMarketNotification(market.id, checked)}
              className="mr-2"
            />
            <Label htmlFor={`${market.id}-notification`} className="text-sm">Notifications</Label>
          </div>
          <div className="flex items-center">
            <Switch 
              id={`${market.id}-sound`}
              checked={soundEnabled}
              onCheckedChange={(checked) => updateMarketSound(market.id, checked)}
              className="mr-2"
            />
            <Label htmlFor={`${market.id}-sound`} className="text-sm">Sound Alert</Label>
          </div>
        </div>
      </div>
    </div>
  );
}
