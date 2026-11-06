import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobileMenu = () => setMobileOpen(false);

  return (
    <div className="min-h-screen w-full min-w-0 overflow-x-hidden bg-[#F7FBFF] text-[#526575]">
      <Sidebar mobileOpen={mobileOpen} onNavigate={closeMobileMenu} />
      {mobileOpen && (
        <button
          type="button"
          aria-label="Đóng menu"
          onClick={closeMobileMenu}
          className="fixed inset-0 z-20 bg-black/30 lg:hidden"
        />
      )}
      <Navbar
        mobileOpen={mobileOpen}
        onMenuClick={() => setMobileOpen((open) => !open)}
      />
      <main className="min-w-0 px-6 pb-6 pt-[88px] lg:ml-64">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
