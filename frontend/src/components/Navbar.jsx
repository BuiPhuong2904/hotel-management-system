import { FiBell, FiChevronDown, FiMenu, FiX } from 'react-icons/fi';
import { useLocation } from 'react-router-dom';

function Navbar({ mobileOpen, onMenuClick }) {
  const { pathname } = useLocation();
  const pageTitle =
    pathname === '/rooms'
      ? 'QUẢN LÝ PHÒNG'
      : pathname === '/bookings'
        ? 'QUẢN LÝ ĐẶT PHÒNG'
        : pathname === '/services'
          ? 'DANH MỤC DỊCH VỤ'
        : 'KHU VỰC LỄ TÂN';

  return (
    <header className="fixed inset-x-0 top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-[#DCECF8] bg-white/95 px-4 backdrop-blur-md lg:left-64 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          aria-label={mobileOpen ? 'Đóng menu' : 'Mở menu'}
          aria-expanded={mobileOpen}
          onClick={onMenuClick}
          className="rounded-lg p-2 text-[#526575] hover:bg-[#E8F5FF] focus-visible:outline-2 focus-visible:outline-[#0D8BEA] lg:hidden"
        >
          {mobileOpen ? (
            <FiX aria-hidden="true" className="h-5 w-5" />
          ) : (
            <FiMenu aria-hidden="true" className="h-5 w-5" />
          )}
        </button>
        <div className="flex min-w-0 items-center gap-2 text-sm font-semibold sm:text-base">
          <span className="hidden text-[#526575] sm:inline">Grand Hotel</span>
          <span aria-hidden="true" className="text-[#64748B]">›</span>
          <span className="truncate text-[#0D8BEA]">{pageTitle}</span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <button
          type="button"
          aria-label="Thông báo"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-[#DCECF8] bg-[#F8FAFC] text-[#526575]"
        >
          <FiBell aria-hidden="true" className="h-4 w-4" />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#EF4444] text-[10px] font-bold text-white">
            3
          </span>
        </button>
        <span className="hidden items-center gap-1.5 rounded-lg bg-[#E8F5FF] px-3 py-1.5 text-xs text-[#0D8BEA] sm:inline-flex">
          <span className="h-2 w-2 rounded-full bg-[#0D8BEA]" />
          Quản trị viên / Lễ tân
        </span>
        <button
          type="button"
          aria-label="Tài khoản người dùng"
          className="flex items-center gap-2 rounded-lg p-1"
        >
          <img
            src="/images/dashboard-profile.png"
            alt=""
            className="h-8 w-8 rounded-full border border-[#DCECF8] object-cover"
          />
          <FiChevronDown aria-hidden="true" className="hidden h-3 w-3 text-[#526575] sm:block" />
        </button>
      </div>
    </header>
  );
}

export default Navbar;