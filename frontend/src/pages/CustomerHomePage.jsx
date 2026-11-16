import { useEffect, useState } from 'react';
import {
  FiArrowRight,
  FiAward,
  FiBriefcase,
  FiCalendar,
  FiCheck,
  FiClock,
  FiFacebook,
  FiInstagram,
  FiMapPin,
  FiMessageCircle,
  FiSearch,
  FiShield,
  FiUser,
  FiWifi,
} from 'react-icons/fi';
import { FaHotel } from 'react-icons/fa6';
import { Link } from 'react-router-dom';
import ToastNotification from '../components/ToastNotification';

const roomTypes = [
  {
    name: 'Phòng loại A',
    badge: 'Tiêu chuẩn',
    description:
      'Phòng tiêu chuẩn ấm cúng, nội thất hiện đại tinh tế, ánh sáng êm dịu mang đến không gian thư giãn…',
    image: '/images/room-type-a.jpeg',
    features: ['1 Giường Queen', 'Wi-Fi tốc độ cao', '28 m²'],
    price: '150.000 VNĐ',
  },
  {
    name: 'Phòng loại B',
    badge: 'Phổ biến',
    description:
      'Phòng cao cấp rộng rãi với không gian sinh hoạt nâng cao, tầm nhìn thoáng đãng và ban…',
    image: '/images/room-type-b.jpeg',
    features: ['1 Giường King', 'Hướng phố', '38 m²'],
    price: '170.000 VNĐ',
  },
  {
    name: 'Phòng loại C',
    badge: 'Thượng hạng',
    description:
      'Phòng Suite thượng hạng với phòng khách riêng biệt, bồn tắm thư giãn cao cấp và dịch vụ…',
    image: '/images/room-type-c.jpeg',
    features: ['Suite Thượng Hạng', 'Bồn tắm nằm', '54 m²'],
    price: '200.000 VNĐ',
  },
];

const facilities = [
  {
    icon: FiClock,
    title: 'Lễ tân trực 24/7',
    description:
      'Hỗ trợ nhận/trả phòng mọi thời điểm, hướng dẫn dịch vụ và tư vấn chu đáo suốt kỳ nghỉ.',
  },
  {
    icon: FiWifi,
    title: 'Wi-Fi tốc độ cao',
    description:
      'Kết nối Internet không dây ổn định, mượt mà trong toàn bộ khuôn viên.',
  },
  {
    icon: FiAward,
    title: 'Dọn phòng hàng ngày',
    description:
      'Chăm sóc buồng phòng chu đáo, thay drap gối cao cấp và đảm bảo tiêu chuẩn vệ sinh.',
  },
  {
    icon: FiBriefcase,
    title: 'Bảo quản hành lý',
    description:
      'Dịch vụ giữ hành lý an toàn, hỗ trợ sắp xếp trước giờ nhận phòng hoặc sau giờ trả phòng.',
  },
];

const navigation = [
  { label: 'Trang chủ', target: 'home', active: true },
  { label: 'Phòng nghỉ', target: 'rooms' },
  { label: 'Tiện ích', target: 'facilities' },
  { label: 'Về chúng tôi', target: 'about' },
  { label: 'Liên hệ', target: 'contact' },
];

const policies = [
  'Quy chế lưu trú khách sạn',
  'Chính sách đặt cọc 30%',
  'Quy định phụ thu khách & Quốc tịch',
  'Bảo mật thông tin khách hàng',
];

function CustomerHomePage() {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  const scrollTo = (target) => {
    document.getElementById(target)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const handleNavigation = (event, target) => {
    event.preventDefault();
    scrollTo(target);
  };

  const handleSearch = (event) => {
    event.preventDefault();
    setToast({
      message: 'Các hạng phòng phù hợp với lựa chọn của bạn.',
      type: 'success',
    });
    scrollTo('rooms');
  };

  return (
    <div className="min-h-screen w-full bg-[#F7FBFF] text-[#526575]">
      <header className="sticky top-0 z-40 h-20 border-b border-[#DCECF8] bg-white/95 shadow-[0_2px_5px_rgba(7,90,156,0.04)] backdrop-blur-[24px]">
        <div className="mx-auto flex h-full w-full items-center justify-between px-4 sm:px-8">
          <Link
            to="/"
            className="flex shrink-0 items-center gap-2 text-[#075A9C]"
            aria-label="Grand Hotel - Trang chủ"
          >
            <FaHotel aria-hidden="true" className="h-[22px] w-[22px]" />
            <span className="text-xl font-bold">Grand Hotel</span>
          </Link>

          <nav
            aria-label="Điều hướng chính"
            className="hidden items-center gap-8 lg:flex"
          >
            {navigation.map(({ label, target, active }) => (
              <a
                key={target}
                href={`#${target}`}
                onClick={(event) => handleNavigation(event, target)}
                className={`whitespace-nowrap text-sm ${
                  active
                    ? 'font-bold text-[#0D8BEA]'
                    : 'font-semibold text-[#526575]'
                }`}
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            <Link
              to="/login"
              className="inline-flex h-10 items-center justify-center rounded-lg border border-[#DCECF8] bg-[#F7FBFF] px-3 text-sm font-bold text-[#526575] sm:px-4"
            >
              Đăng nhập
            </Link>
            <button
              type="button"
              onClick={() => scrollTo('booking-search')}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-[#0D8BEA] px-3 text-sm font-bold text-white shadow-[0_1px_1px_rgba(0,0,0,0.05)] sm:px-5"
            >
              Đặt phòng
            </button>
            <Link
              to="/login"
              aria-label="Tài khoản"
              className="hidden h-9 w-9 items-center justify-center rounded-full border border-[#DCECF8] bg-[#E8F5FF] text-[#075A9C] sm:flex"
            >
              <FiUser aria-hidden="true" className="h-[14px] w-[14px]" />
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section
          id="home"
          className="flex h-[500px] scroll-mt-20 items-center justify-center overflow-hidden bg-cover bg-center px-5 pb-40 pt-24 text-center text-white sm:px-8"
          style={{
            backgroundImage:
              'linear-gradient(to bottom, rgba(7,90,156,0.8), rgba(7,90,156,0.6) 50%, rgba(7,90,156,0.9)), url("/images/customer-home-hero.jpeg")',
          }}
        >
          <div className="flex w-full max-w-[1024px] flex-col items-center">
            <h1 className="mb-4 max-w-[896px] text-4xl font-extrabold leading-tight drop-shadow-[0_1px_1px_rgba(0,0,0,0.05)] sm:text-5xl">
              Bắt đầu kỳ nghỉ trọn vẹn của bạn
            </h1>
            <p className="mb-8 max-w-[672px] text-base font-bold leading-normal sm:text-lg">
              Khám phá không gian nghỉ dưỡng tiện nghi, dịch vụ tận tâm và những
              trải nghiệm đáng nhớ được chuẩn bị chu đáo tại Grand Hotel.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <button
                type="button"
                onClick={() => scrollTo('rooms')}
                className="inline-flex h-[47px] items-center justify-center gap-2 rounded-xl bg-[#0D8BEA] px-8 text-sm font-bold text-white shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)]"
              >
                <FiSearch aria-hidden="true" className="h-4 w-4" />
                Khám phá phòng nghỉ
              </button>
              <button
                type="button"
                onClick={() => scrollTo('about')}
                className="inline-flex h-[49px] items-center justify-center gap-2 rounded-xl border border-white/35 bg-white/15 px-[33px] text-sm font-bold text-white backdrop-blur-[12px]"
              >
                Khám phá khách sạn
                <FiArrowRight aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        <section
          id="booking-search"
          aria-labelledby="booking-search-title"
          className="relative z-10 mx-auto -mt-24 w-[calc(100%-2rem)] max-w-[1200px] rounded-2xl border border-[#DCECF8] bg-white p-5 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] sm:p-8"
        >
          <h2
            id="booking-search-title"
            className="mb-6 flex items-center gap-2 text-xl font-bold text-[#075A9C]"
          >
            <FiCalendar aria-hidden="true" className="h-5 w-[18px]" />
            Lên kế hoạch đặt phòng
          </h2>
          <form
            onSubmit={handleSearch}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            <label className="flex flex-col gap-1.5 text-sm font-bold text-[#526575]">
              <span className="flex items-center gap-1.5">
                Ngày nhận phòng
              </span>
              <input
                aria-label="Ngày nhận phòng"
                type="text"
                inputMode="numeric"
                defaultValue="25/10/2026"
                className="h-12 w-full rounded-lg border border-[#DCECF8] bg-white px-[17px] text-sm font-normal text-[#526575] outline-none focus:border-[#0D8BEA]"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-bold text-[#526575]">
              <span className="flex items-center gap-1.5">
                Ngày trả phòng
              </span>
              <input
                aria-label="Ngày trả phòng"
                type="text"
                inputMode="numeric"
                defaultValue="28/10/2026"
                className="h-12 w-full rounded-lg border border-[#DCECF8] bg-white px-[17px] text-sm font-normal text-[#526575] outline-none focus:border-[#0D8BEA]"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-bold text-[#526575]">
              <span className="flex items-center gap-1.5">
                Số khách
              </span>
              <select
                aria-label="Số khách"
                defaultValue="2 khách"
                className="h-12 w-full appearance-none rounded-lg border border-[#DCECF8] bg-white px-[17px] text-sm font-normal text-[#526575] outline-none focus:border-[#0D8BEA]"
              >
                {['1 khách', '2 khách', '3 khách', '4 khách'].map((guest) => (
                  <option key={guest} value={guest}>
                    {guest}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              className="mt-auto inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#0D8BEA] px-6 text-sm font-bold text-white shadow-[0_1px_1px_rgba(0,0,0,0.05)]"
            >
              <FiSearch aria-hidden="true" className="h-[15px] w-[15px]" />
              Tìm phòng
            </button>
          </form>
        </section>

        <section
          id="rooms"
          aria-labelledby="rooms-title"
          className="scroll-mt-20 bg-[#F7FBFF] px-5 py-12 sm:px-8"
        >
          <div className="mx-auto flex max-w-[1376px] flex-col items-center gap-10">
            <div className="flex max-w-[672px] flex-col items-center gap-2 text-center">
              <p className="text-sm font-bold text-[#0D8BEA]">HẠNG PHÒNG</p>
              <h2
                id="rooms-title"
                className="text-[28px] font-bold leading-tight text-[#075A9C] sm:text-[32px]"
              >
                Tìm phòng nghỉ phù hợp
              </h2>
              <p className="text-base leading-normal text-[#526575]">
                Lựa chọn không gian nghỉ ngơi lý tưởng được thiết kế tinh tế,
                mang lại sự thoải mái và trải nghiệm lưu trú trọn vẹn.
              </p>
            </div>

            <div className="grid w-full grid-cols-1 gap-8 lg:grid-cols-3">
              {roomTypes.map((room) => (
                <article
                  key={room.name}
                  className="flex h-[497px] min-w-0 flex-col overflow-hidden rounded-2xl border border-[#DCECF8] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
                >
                  <div className="relative h-[240px] shrink-0">
                    <img
                      src={room.image}
                      alt={room.name}
                      className="h-full w-full object-cover"
                    />
                    <span
                      className={`absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-semibold shadow-[0_1px_1px_rgba(0,0,0,0.05)] ${
                        room.name === 'Phòng loại A'
                          ? 'border border-[#DCECF8] bg-white text-[#075A9C] backdrop-blur-[12px]'
                          : room.name === 'Phòng loại B'
                            ? 'bg-[#0D8BEA] text-white'
                            : 'bg-[#075A9C] text-white'
                      }`}
                    >
                      {room.badge}
                    </span>
                  </div>
                  <div className="flex min-h-0 flex-1 flex-col justify-between p-6">
                    <div className="flex min-h-0 flex-col">
                      <h3 className="mb-2 text-xl font-bold text-[#075A9C]">
                        {room.name}
                      </h3>
                      <p className="line-clamp-3 min-h-[67px] text-sm leading-normal text-[#526575]">
                        {room.description}
                      </p>
                      <ul className="mt-2 flex flex-wrap gap-2">
                        {room.features.map((feature, index) => (
                          <li
                            key={feature}
                            className="inline-flex h-[26px] items-center gap-1 rounded-md border border-[#DCECF8] bg-[#E8F5FF] px-[11px] text-xs font-semibold text-[#075A9C]"
                          >
                            {index === 0 ? (
                              <FiCheck aria-hidden="true" className="h-3 w-3" />
                            ) : index === 1 ? (
                              <FiWifi aria-hidden="true" className="h-3 w-3" />
                            ) : (
                              <FiAward aria-hidden="true" className="h-3 w-3" />
                            )}
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex items-end justify-between border-t border-[#DCECF8] pt-[9px]">
                      <div>
                        <p className="text-xs text-[#526575]">Giá từ</p>
                        <p className="whitespace-nowrap text-xl font-bold text-[#0D8BEA]">
                          {room.price}
                          <span className="ml-1 text-xs font-normal text-[#526575]">
                            / đêm
                          </span>
                        </p>
                      </div>
                      <a
                        href="#booking-search"
                        onClick={(event) =>
                          handleNavigation(event, 'booking-search')
                        }
                        className="inline-flex h-10 items-center gap-1 rounded-lg bg-white text-sm font-bold text-[#0D8BEA] underline"
                      >
                        Xem chi tiết
                        <FiArrowRight aria-hidden="true" className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="facilities"
          aria-labelledby="facilities-title"
          className="scroll-mt-20 border-y border-[#DCECF8] bg-[#E8F5FF]/60 px-5 py-[49px] sm:px-8"
        >
          <div className="mx-auto flex max-w-[1376px] flex-col items-center gap-10">
            <div className="flex max-w-[672px] flex-col items-center gap-2 text-center">
              <p className="text-sm font-bold text-[#0D8BEA]">
                TIỆN ÍCH VÀ DỊCH VỤ
              </p>
              <h2
                id="facilities-title"
                className="text-[28px] font-bold leading-tight text-[#075A9C] sm:text-[32px]"
              >
                Tiện nghi dành cho bạn
              </h2>
              <p className="text-base leading-normal text-[#526575]">
                Dịch vụ lưu trú chu đáo được tuyển chọn nhằm mang đến kỳ nghỉ
                nhẹ nhàng, thư thái và thuận tiện nhất.
              </p>
            </div>

            <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
              {facilities.map(({ icon: Icon, title, description }) => (
                <article
                  key={title}
                  className="flex min-h-[204px] flex-col items-center rounded-2xl border border-[#DCECF8] bg-white p-[25px] text-center shadow-[0_1px_1px_rgba(0,0,0,0.05)]"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#DCECF8] bg-[#E8F5FF] text-[#0D8BEA]">
                    <Icon aria-hidden="true" className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 whitespace-nowrap text-lg font-bold text-[#075A9C]">
                    {title}
                  </h3>
                  <p className="mt-2 max-w-[206px] text-sm leading-normal text-[#526575]">
                    {description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="about"
          aria-labelledby="about-title"
          className="scroll-mt-20 bg-[#F7FBFF] px-5 py-12 sm:px-8"
        >
          <div className="mx-auto grid max-w-[1376px] grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-12">
            <div className="overflow-hidden rounded-2xl border border-[#DCECF8] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)]">
              <img
                src="/images/room-type-c.jpeg"
                alt="Sảnh tiếp đón Grand Hotel"
                className="h-[400px] w-full object-cover"
              />
            </div>
            <div>
              <p className="mb-1.5 text-sm font-bold text-[#0D8BEA]">
                VỀ GRAND HOTEL
              </p>
              <h2
                id="about-title"
                className="mb-4 text-[28px] font-bold leading-tight text-[#075A9C] sm:text-[32px]"
              >
                Dịch vụ tận tâm, trải nghiệm thoải mái
              </h2>
              <p className="mb-6 text-base leading-normal text-[#526575]">
                Tại Grand Hotel, chúng tôi tin rằng trải nghiệm lưu trú tuyệt
                vời bắt nguồn từ sự tỉ mỉ trong từng chi tiết. Từ không gian
                phòng nghỉ thanh lịch đến quy trình đặt phòng trực tuyến thuận
                tiện, mọi trải nghiệm đều hướng đến sự an tâm và hài lòng của
                quý khách.
              </p>
              <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  {
                    icon: FiClock,
                    title: 'Nhanh chóng',
                    description: 'Đặt phòng trực tuyến nhanh',
                  },
                  {
                    icon: FiCheck,
                    title: 'Minh bạch',
                    description: 'Giá phòng niêm yết rõ ràng',
                  },
                  {
                    icon: FiShield,
                    title: 'Tận tâm',
                    description: 'Hỗ trợ khách hàng tận tâm',
                  },
                ].map(({ icon: Icon, title, description }) => (
                  <article
                    key={title}
                    className="flex min-h-[76px] flex-col gap-1 rounded-xl border border-[#DCECF8] bg-white p-[17px]"
                  >
                    <h3 className="flex items-center gap-1.5 whitespace-nowrap text-sm font-bold text-[#0D8BEA]">
                      <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
                      {title}
                    </h3>
                    <p className="text-sm leading-normal text-[#526575]">
                      {description}
                    </p>
                  </article>
                ))}
              </div>
              <a
                href="#rooms"
                onClick={(event) => handleNavigation(event, 'rooms')}
                className="inline-flex items-center gap-1.5 text-sm font-bold text-[#0D8BEA]"
              >
                Tìm hiểu thêm về các hạng phòng
                <FiArrowRight aria-hidden="true" className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer
        id="contact"
        className="scroll-mt-20 border-t border-[#DCECF8] bg-white px-5 pb-8 pt-8 sm:px-8"
      >
        <div className="mx-auto max-w-[1376px]">
          <div className="grid grid-cols-1 gap-8 border-b border-[#DCECF8] pb-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col items-start gap-4">
              <Link
                to="/"
                className="flex items-center gap-2 text-[#075A9C]"
                aria-label="Grand Hotel - Trang chủ"
              >
                <FaHotel aria-hidden="true" className="h-[23px] w-[23px]" />
                <span className="text-xl font-bold">Grand Hotel</span>
              </Link>
              <p className="max-w-[320px] text-xs leading-normal text-[#526575]">
                Hệ thống nghỉ dưỡng cao cấp chuẩn mực quốc tế, mang lại trải
                nghiệm lưu trú sang trọng, chu đáo và thư thái cho quý khách.
              </p>
              <div className="flex items-center gap-3 text-[#075A9C]">
                <a
                  href="#contact"
                  aria-label="Facebook"
                  className="flex h-6 w-6 items-center justify-center rounded-full border border-[#DCECF8]"
                >
                  <FiFacebook aria-hidden="true" className="h-3.5 w-3.5" />
                </a>
                <a
                  href="#contact"
                  aria-label="Instagram"
                  className="flex h-6 w-6 items-center justify-center rounded-full border border-[#DCECF8]"
                >
                  <FiInstagram aria-hidden="true" className="h-3.5 w-3.5" />
                </a>
                <a
                  href="#contact"
                  aria-label="Liên hệ"
                  className="flex h-6 w-6 items-center justify-center rounded-full border border-[#DCECF8]"
                >
                  <FiMessageCircle aria-hidden="true" className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>

            <div>
              <h2 className="mb-2 text-sm font-bold text-[#075A9C]">
                KHÁM PHÁ
              </h2>
              <ul className="flex flex-col gap-2 text-sm text-[#526575]">
                <li>
                  <a
                    href="#rooms"
                    onClick={(event) => handleNavigation(event, 'rooms')}
                  >
                    Danh sách hạng phòng
                  </a>
                </li>
                <li>
                  <a
                    href="#facilities"
                    onClick={(event) => handleNavigation(event, 'facilities')}
                  >
                    Dịch vụ &amp; Tiện ích
                  </a>
                </li>
                <li>Ưu đãi đặc biệt</li>
                <li>Hỗ trợ check-in</li>
              </ul>
            </div>

            <div>
              <h2 className="mb-2 text-sm font-bold text-[#075A9C]">
                CHÍNH SÁCH &amp; QUY ĐỊNH
              </h2>
              <ul className="flex flex-col gap-1.5 text-sm text-[#526575]">
                {policies.map((policy) => (
                  <li key={policy}>{policy}</li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col items-start gap-2">
              <h2 className="mb-1 text-sm font-bold text-[#075A9C]">
                LIÊN HỆ
              </h2>
              <p className="flex items-start gap-1 text-sm text-[#526575]">
                <FiMapPin aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
                120 Đại Lộ Hoàng Gia, TP. Hồ Chí Minh
              </p>
              <p className="text-sm text-[#526575]">+84 (0) 28 3822 8888</p>
              <p className="text-sm text-[#526575]">booking@grandhotel.vn</p>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-3 pt-6 text-xs text-[#526575] sm:flex-row sm:items-center">
            <p>© 2026 Grand Hotel Group. Bảo lưu mọi quyền.</p>
            <div className="flex items-center gap-4">
              <span>Điều khoản</span>
              <span>Bảo mật</span>
              <span>Quy chế</span>
            </div>
          </div>
        </div>
      </footer>

      <button
        type="button"
        onClick={() =>
          setToast({
            message: 'Trợ lý Grand Hotel sẵn sàng hỗ trợ bạn.',
            type: 'success',
          })
        }
        className="fixed bottom-6 right-6 z-40 inline-flex h-14 items-center gap-2 rounded-full border border-white/30 bg-[#0D8BEA] px-6 text-sm font-semibold tracking-[0.35px] text-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] sm:right-8"
      >
        <span className="h-2.5 w-2.5 rounded-full bg-[#FFC542] shadow-[0_0_0_3px_rgba(255,197,66,0.25)]" />
        <FiMessageCircle aria-hidden="true" className="h-5 w-5" />
        Trợ lý Grand Hotel
      </button>

      <ToastNotification message={toast?.message} type={toast?.type} />
    </div>
  );
}

export default CustomerHomePage;
