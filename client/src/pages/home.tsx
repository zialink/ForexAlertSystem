import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TimeCard from "@/components/TimeCard";
import MarketCard from "@/components/MarketCard";
import NextOpeningSection from "@/components/NextOpeningSection";
import SettingsModal from "@/components/SettingsModal";
import NotificationToast from "@/components/NotificationToast";
import { useMarkets } from "@/hooks/use-markets";
import { useTime } from "@/hooks/use-time";
import { useSettings } from "@/hooks/use-settings";

export default function Home() {
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showNotificationDemo, setShowNotificationDemo] = useState(false);
  
  const { settings } = useSettings();
  const { timeZones } = useTime();
  const { markets, nextMarketToOpen } = useMarkets();
  
  // Filter markets based on settings
  const filteredMarkets = markets.filter(market => 
    settings.marketsToMonitor.includes(market.id)
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header onSettingsClick={() => setShowSettingsModal(true)} />
      
      <main className="flex-grow container mx-auto px-4 py-6">
        {/* Current Time Section */}
        <section className="mb-8">
          <h2 className="text-lg md:text-xl font-medium text-[#333333] mb-4 flex items-center">
            <span className="material-icons mr-2">public</span>
            Current Time Across Markets
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {timeZones.map((zone) => (
              <TimeCard key={zone.id} zone={zone} />
            ))}
          </div>
        </section>
        
        {/* Market Status Section */}
        <section className="mb-8">
          <h2 className="text-lg md:text-xl font-medium text-[#333333] mb-4 flex items-center">
            <span className="material-icons mr-2">account_balance</span>
            Market Status & Countdowns
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredMarkets.map((market) => (
              <MarketCard key={market.id} market={market} />
            ))}
          </div>
        </section>
        
        {/* Next Opening Section */}
        <NextOpeningSection 
          nextMarket={nextMarketToOpen} 
          onTestNotification={() => setShowNotificationDemo(true)}
        />
      </main>
      
      <Footer />
      
      {/* Modals and Notifications */}
      {showSettingsModal && (
        <SettingsModal onClose={() => setShowSettingsModal(false)} />
      )}
      
      {showNotificationDemo && (
        <NotificationToast 
          market={nextMarketToOpen}
          onClose={() => setShowNotificationDemo(false)}
        />
      )}
    </div>
  );
}
