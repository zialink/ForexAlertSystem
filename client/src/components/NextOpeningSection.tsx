import { Button } from "@/components/ui/button";
import { Market } from "@/lib/market-data";
import { useNotifications } from "@/hooks/use-notifications";
import { useState } from "react";
import { Smartphone } from "lucide-react";

interface NextOpeningSectionProps {
  nextMarket: Market;
  onTestNotification: () => void;
}

export default function NextOpeningSection({ 
  nextMarket, 
  onTestNotification 
}: NextOpeningSectionProps) {
  const { requestPermission, testSound, testPushNotification } = useNotifications();
  const [isSendingPush, setIsSendingPush] = useState(false);
  
  const handleTestNotification = () => {
    requestPermission();
    onTestNotification();
  };
  
  const handleTestPushNotification = async () => {
    setIsSendingPush(true);
    try {
      await testPushNotification();
    } finally {
      setIsSendingPush(false);
    }
  };
  
  return (
    <section>
      <h2 className="text-lg md:text-xl font-medium text-[#333333] mb-4 flex items-center">
        <span className="material-icons mr-2">trending_up</span>
        Next Market Opening
      </h2>
      <div className="bg-white rounded-lg shadow-md p-4 flex flex-col md:flex-row justify-between items-center">
        <div>
          <div className="text-center md:text-left mb-4 md:mb-0">
            <p className="text-lg font-medium text-[#333333] mb-1">{nextMarket.name} opens in</p>
            <div className="flex items-center justify-center md:justify-start">
              <span className="material-icons text-[#FFC107] mr-2">notifications_active</span>
              <p className="time-display text-3xl font-bold text-[#333333]">{nextMarket.countdown}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={handleTestNotification}
            className="bg-[#1565C0] text-white px-4 py-2 rounded-md flex items-center hover:bg-[#1565C0]/90 transition-colors"
          >
            <span className="material-icons mr-2">notifications</span>
            Test Notification
          </Button>
          <Button
            onClick={testSound}
            className="bg-[#FFC107] text-white px-4 py-2 rounded-md flex items-center hover:bg-[#FFC107]/90 transition-colors"
          >
            <span className="material-icons mr-2">volume_up</span>
            Test Sound
          </Button>
          <Button
            onClick={handleTestPushNotification}
            disabled={isSendingPush}
            className="bg-[#9C27B0] text-white px-4 py-2 rounded-md flex items-center hover:bg-[#9C27B0]/90 transition-colors"
          >
            <Smartphone className="h-5 w-5 mr-2" />
            {isSendingPush ? "Sending..." : "Test Mobile Push"}
          </Button>
        </div>
      </div>
    </section>
  );
}
