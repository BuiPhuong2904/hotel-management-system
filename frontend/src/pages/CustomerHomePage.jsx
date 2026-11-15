import { FiArrowRight, FiAward, FiClock, FiHome } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const guestBenefits = [
  {
    icon: FiAward,
    title: 'Ưu đãi thành viên',
    description: 'Theo dõi ưu đãi và tích điểm cho kỳ nghỉ của bạn.',
  },
  {
    icon: FiClock,
    title: 'Nhận phòng thuận tiện',
    description: 'Chuẩn bị lịch trình nhận phòng chủ động, nhanh chóng.',
  },
  {
    icon: FiHome,
    title: 'Không gian nghỉ dưỡng',
    description: 'Khám phá trải nghiệm lưu trú tại Grand Hotel.',
  },
];

function CustomerHomePage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#075A9C]">
      <header className="flex items-center justify-between border-b border-[#DCECF8] bg-white px-6 py-4 lg:px-12">
        <Link to="/customer" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#075A9C] text-white">
            <FiHome aria-hidden="true" className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-lg font-bold">GRAND HOTEL</span>
            <span className="block text-xs text-[#64748B]">
              Nghỉ dưỡng Đẳng cấp &amp; Dịch vụ Tận tâm
            </span>
          </span>
        </Link>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 rounded-lg border border-[#DCECF8] px-4 py-2 text-xs font-semibold text-[#075A9C] hover:bg-[#F0F7FF]"
        >
          Đăng nhập
          <FiArrowRight aria-hidden="true" className="h-4 w-4" />
        </Link>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10 lg:px-12 lg:py-14">
        <section
          className="flex min-h-[360px] flex-col justify-end rounded-2xl bg-[#075A9C] bg-cover bg-center p-8 text-white sm:p-12"
          style={{
            backgroundImage:
              "linear-gradient(125deg, rgb(7 90 156 / 88%), rgb(10 77 130 / 92%)), url('/images/login-hotel.jpeg')",
          }}
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-blue-100">
            Chế độ Demo khách hàng
          </p>
          <h1 className="max-w-2xl text-3xl font-bold sm:text-4xl">
            Chào mừng đến với Grand Hotel
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-blue-100">
            Bạn đã truy cập giao diện dành cho khách hàng. Grand Hotel sẵn sàng
            mang đến không gian lưu trú thoải mái cùng dịch vụ tận tâm.
          </p>
          <Link
            to="/login"
            className="mt-6 inline-flex w-fit items-center gap-2 rounded-lg bg-[#0D8BEA] px-5 py-3 text-sm font-bold text-white hover:bg-[#0D8BEA]/90"
          >
            Quay lại đăng nhập
            <FiArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          {guestBenefits.map(({ icon: Icon, title, description }) => (
            <article
              key={title}
              className="rounded-xl border border-[#DCECF8] bg-white p-5"
            >
              <span className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#F0F7FF] text-[#0D8BEA]">
                <Icon aria-hidden="true" className="h-5 w-5" />
              </span>
              <h2 className="font-bold">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-[#64748B]">
                {description}
              </p>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}

export default CustomerHomePage;
