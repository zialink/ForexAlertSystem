import { TimeZone } from "@/lib/market-data";

interface TimeCardProps {
  zone: TimeZone;
}

export default function TimeCard({ zone }: TimeCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-[#333333]">{zone.name}</h3>
        <span className="text-xs font-medium bg-[#1565C0]/10 text-[#1565C0] px-2 py-1 rounded">
          {zone.abbreviation}
        </span>
      </div>
      <p className="time-display text-2xl font-bold text-[#333333] mb-1">{zone.time}</p>
      <p className="text-sm text-gray-500">{zone.date}</p>
    </div>
  );
}
