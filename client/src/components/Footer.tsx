export default function Footer() {
  return (
    <footer className="bg-white py-4 border-t border-gray-200">
      <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
        <p>Forex Market Tracker &copy; {new Date().getFullYear()} | All times are shown in their local time zones</p>
      </div>
    </footer>
  );
}
