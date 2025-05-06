import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { useSettings } from "@/hooks/use-settings";
import { useState } from "react";
import { MARKETS } from "@/lib/market-data";

interface SettingsModalProps {
  onClose: () => void;
}

export default function SettingsModal({ onClose }: SettingsModalProps) {
  const { settings, updateSettings } = useSettings();
  
  // Create local state for settings
  const [localSettings, setLocalSettings] = useState({...settings});
  
  const handleVolumeChange = (value: number[]) => {
    setLocalSettings({
      ...localSettings,
      volume: value[0]
    });
  };
  
  const handleCheckboxChange = (marketId: string, checked: boolean) => {
    let newMarketsToMonitor = [...localSettings.marketsToMonitor];
    
    if (checked) {
      if (!newMarketsToMonitor.includes(marketId)) {
        newMarketsToMonitor.push(marketId);
      }
    } else {
      newMarketsToMonitor = newMarketsToMonitor.filter(id => id !== marketId);
    }
    
    setLocalSettings({
      ...localSettings,
      marketsToMonitor: newMarketsToMonitor
    });
  };
  
  const handleSaveSettings = () => {
    updateSettings(localSettings);
    onClose();
  };
  
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <span className="material-icons mr-2">settings</span>
            Settings
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="mb-6">
            <h3 className="font-medium mb-2 text-[#333333]">Notification Settings</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="browserNotifications" className="text-[#333333]">
                  Enable Browser Notifications
                </Label>
                <Switch 
                  id="browserNotifications"
                  checked={localSettings.enableNotifications}
                  onCheckedChange={(checked) => 
                    setLocalSettings({...localSettings, enableNotifications: checked})
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="soundAlerts" className="text-[#333333]">
                  Enable Sound Alerts
                </Label>
                <Switch 
                  id="soundAlerts"
                  checked={localSettings.enableSounds}
                  onCheckedChange={(checked) => 
                    setLocalSettings({...localSettings, enableSounds: checked})
                  }
                />
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-medium mb-2 text-[#333333]">Alert Volume</h3>
            <Slider 
              defaultValue={[localSettings.volume]} 
              max={100} 
              step={1}
              onValueChange={handleVolumeChange}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-medium mb-2 text-[#333333]">Markets to Monitor</h3>
            <div className="space-y-2">
              {MARKETS.map((market) => (
                <div key={market.id} className="flex items-center">
                  <Checkbox 
                    id={`${market.id}-monitor`}
                    checked={localSettings.marketsToMonitor.includes(market.id)}
                    onCheckedChange={(checked) => 
                      handleCheckboxChange(market.id, checked as boolean)
                    }
                    className="h-5 w-5 text-[#1565C0]"
                  />
                  <Label 
                    htmlFor={`${market.id}-monitor`} 
                    className="ml-2 text-[#333333]"
                  >
                    {market.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex justify-end space-x-3">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveSettings}
            className="px-4 py-2 bg-[#1565C0] text-white rounded-md hover:bg-[#1565C0]/90 transition-colors"
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
