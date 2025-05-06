interface HeaderProps {
  onSettingsClick: () => void;
}

export default function Header({ onSettingsClick }: HeaderProps) {
  return (
    <header className="bg-[#1565C0] text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl md:text-2xl font-medium flex items-center">
          <span className="material-icons mr-2">schedule</span>
          Forex Market Tracker
        </h1>
        <button 
          onClick={onSettingsClick}
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
          aria-label="Settings"
        >
          <span className="material-icons">settings</span>
        </button>
      </div>
    </header>
  );
}
