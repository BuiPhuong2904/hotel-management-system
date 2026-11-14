import { Link, useLocation } from 'react-router-dom';
import {
  FiBarChart2,
  FiBookOpen,
  FiBriefcase,
  FiCalendar,
  FiFileText,
  FiGrid,
  FiLogOut,
  FiSettings,
  FiTag,
  FiUser,
  FiUsers,
} from 'react-icons/fi';

const navigation = [
  { label: 'Tổng quan', icon: FiGrid, to: '/dashboard' },
  { label: 'Quản lý phòng', icon: FiBriefcase, to: '/rooms' },
  { label: 'Đặt phòng', icon: FiCalendar, to: '/bookings' },
  { label: 'Danh mục dịch vụ', icon: FiBookOpen, to: '/services' },
  { label: 'Dịch vụ phát sinh', icon: FiFileText, to: '/service-usage' },
  { label: 'Hóa đơn thanh toán', icon: FiFileText, to: '/invoices' },
  { label: 'Hồ sơ khách hàng', icon: FiUsers, to: '/customers' },
  { label: 'Quản lý nhân viên', icon: FiUser, to: '/staff' },
  { label: 'Quản lý khuyến mãi', icon: FiTag, to: '/promotions' },
  { label: 'Báo cáo doanh thu', icon: FiBarChart2, to: '/reports' },
];

function Sidebar({ mobileOpen = false, onNavigate }) {
  const { pathname } = useLocation();

  return (
    <aside
      className={`${
        mobileOpen ? 'flex' : 'hidden'
      } fixed inset-y-0 left-0 z-30 w-64 flex-col justify-between border-r border-[#DCECF8] bg-white py-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)] lg:flex`}
    >
      <div>
        <Link
          to="/dashboard"
          onClick={onNavigate}
          className="flex items-center gap-3 px-5 py-2"
        >
          <img
            src="/images/grand-hotel-logo.png"
            alt="Grand Hotel"
            className="h-8 w-8 shrink-0 object-contain"
          />
          <span className="text-xl font-bold tracking-tight text-[#075A9C]">
            GRAND HOTEL
          </span>
        </Link>

        <nav aria-label="Điều hướng chính" className="mt-4 flex flex-col gap-1 px-3">
          {navigation.map(({ label, icon: Icon, to }) => {
            const active =
              (to === '/dashboard' &&
                (pathname === '/' || pathname === '/dashboard')) ||
              (to !== '#' && to !== '/dashboard' && pathname === to);

            return (
              <Link
                key={label}
                to={to}
                onClick={onNavigate}
                aria-current={active ? 'page' : undefined}
                className={`flex min-h-10 items-center gap-3 rounded px-3 py-2 text-sm transition-colors ${
                  active
                    ? 'bg-[#E8F5FF] font-semibold text-[#0D8BEA]'
                    : 'font-medium text-[#526575] hover:bg-[#F7FBFF]'
                }`}
              >
                <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex flex-col gap-2 border-t border-[#DCECF8] p-3">
        <Link
          to="/settings"
          onClick={onNavigate}
          className={`flex min-h-10 items-center gap-3 rounded px-3 py-2 text-sm transition-colors ${
            pathname === '/settings'
              ? 'bg-[#E8F5FF] font-semibold text-[#0D8BEA]'
              : 'font-medium text-[#526575] hover:bg-[#F7FBFF]'
          }`}
        >
          <FiSettings aria-hidden="true" className="h-4 w-4 shrink-0" />
          <span>Cài đặt quy định</span>
        </Link>

        <button
          type="button"
          className="flex min-h-10 w-full items-center justify-between rounded-lg border border-[#D9534F] px-3 text-sm font-semibold text-[#D9534F] hover:bg-[#FDF2F2]"
        >
          <span className="flex items-center gap-2">
            <FiLogOut aria-hidden="true" className="h-4 w-4" />
            Đăng xuất
          </span>
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;