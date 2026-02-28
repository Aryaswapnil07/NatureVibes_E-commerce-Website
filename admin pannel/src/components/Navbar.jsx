const Navbar = ({ onMenuClick, onLogout }) => {
  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <button
          type="button"
          className="rounded-md border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 md:hidden"
          onClick={onMenuClick}
        >
          Menu
        </button>

        <div className="hidden md:block">
          <p className="text-sm text-gray-500">Admin Control Panel</p>
        </div>

        <button
          type="button"
          className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
          onClick={onLogout}
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;
