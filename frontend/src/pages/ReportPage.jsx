import { useState } from 'react';
import {
  FiCalendar,
  FiDownload,
  FiInfo,
  FiPrinter,
  FiRefreshCw,
  FiSliders,
  FiTrendingUp,
} from 'react-icons/fi';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Cell,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const revenueData = [
  { name: 'Tuần 1 (01–07)', room: 20, service: 5, rate: 60 },
  { name: 'Tuần 2 (08–14)', room: 24, service: 7, rate: 70 },
  { name: 'Tuần 3 (15–21)', room: 26, service: 10, rate: 82 },
  { name: 'Tuần 4 (22–28)', room: 24, service: 8, rate: 75 },
  { name: 'Cuối tháng (29–31)', room: 8, service: 2, rate: 42 },
];

const roomTypes = [
  {
    name: 'Loại A (Standard)',
    description: 'Loại A (Standard Room)',
    rate: 150000,
    rateLabel: '150.000 đ/đêm',
    revenue: 120309000,
    share: 42,
    color: '#0D8BEA',
    detail: 'Đơn giá định mức: 150.000 đ/đêm • Tiện ích tiêu chuẩn',
  },
  {
    name: 'Loại B (Deluxe)',
    description: 'Loại B (Deluxe Room)',
    rate: 170000,
    rateLabel: '170.000 đ/đêm',
    revenue: 100257500,
    share: 35,
    color: '#FFC542',
    detail: 'Đơn giá định mức: 170.000 đ/đêm • Ban công view phố',
  },
  {
    name: 'Loại C (VIP Suite)',
    description: 'Loại C (VIP Executive Suite)',
    rate: 200000,
    rateLabel: '200.000 đ/đêm',
    revenue: 65883500,
    share: 23,
    color: '#2E8B57',
    detail: 'Đơn giá định mức: 200.000 đ/đêm • Dịch vụ phòng 24/7',
  },
];

const discounts = {
  description: 'Trừ chiết khấu khuyến mãi',
  revenue: -12500000,
  share: -4.4,
};

const formatMoney = (value) =>
  `${new Intl.NumberFormat('vi-VN').format(Math.abs(value))} đ`;

const formatTableMoney = (value) =>
  `${value < 0 ? '- ' : ''}${formatMoney(value)}`;

function KpiCard({ label, value, detail, color }) {
  return (
    <article className="flex h-[136px] min-w-0 flex-col gap-2 rounded-xl border border-[#DCECF8] bg-white p-[17px] shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
      <h2 className={`truncate text-sm font-bold ${color}`}>{label}</h2>
      <div className="pt-2">
        <p className={`whitespace-nowrap text-xl font-bold ${color}`}>{value}</p>
        {detail && <p className="mt-1 text-xs text-[#526575]">{detail}</p>}
      </div>
    </article>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-[#DCECF8] bg-white p-3 text-xs shadow-lg">
      <p className="mb-1 font-bold text-[#075A9C]">{label}</p>
      {payload.map((item) => (
        <p key={item.dataKey} style={{ color: item.color }}>
          {item.name}:{' '}
          {item.dataKey === 'rate'
            ? `${item.value}%`
            : `${item.value} triệu đ`}
        </p>
      ))}
    </div>
  );
}

function RoomMixChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={roomTypes}
          dataKey="share"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={48}
          outerRadius={68}
          paddingAngle={1}
          stroke="none"
        >
          {roomTypes.map((room) => (
            <Cell key={room.name} fill={room.color} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [`${value}%`, 'Tỷ trọng']} />
      </PieChart>
    </ResponsiveContainer>
  );
}

function ReportPage() {
  const [period, setPeriod] = useState('10/2026');
  const [fromDate, setFromDate] = useState('01/10/2026');
  const [toDate, setToDate] = useState('31/10/2026');

  const resetFilters = () => {
    setPeriod('10/2026');
    setFromDate('01/10/2026');
    setToDate('31/10/2026');
  };

  const exportCsv = () => {
    const rows = [
      ['#', 'Loại phòng & đơn giá quy chuẩn', 'Doanh thu', 'Tỷ lệ (%)'],
      ...roomTypes.map((room, index) => [
        index + 1,
        `${room.description} - ${room.detail}`,
        room.revenue,
        `${room.share}%`,
      ]),
      ['', discounts.description, discounts.revenue, `${discounts.share}%`],
      ['', 'TỔNG CỘNG DOANH THU THỰC NHẬN', 273950000, '100%'],
    ];
    const csv = rows
      .map((row) =>
        row
          .map((value) => `"${String(value).replaceAll('"', '""')}"`)
          .join(','),
      )
      .join('\r\n');
    const blob = new Blob([`\uFEFF${csv}`], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bao-cao-doanh-thu-${period.replace('/', '-')}.csv`;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="-mt-2 flex w-full min-w-0 flex-col gap-4">
      <section
        aria-label="Bộ lọc báo cáo"
        className="flex min-h-[74px] flex-col gap-3 rounded-xl border border-[#DCECF8] bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-4"
      >
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <label className="flex h-10 items-center gap-1 rounded-lg border border-[#DCECF8] bg-white px-3 text-sm text-[#526575]">
            <FiSliders aria-hidden="true" className="h-[14px] w-[14px]" />
            <span className="whitespace-nowrap">Kỳ báo cáo:</span>
            <select
              aria-label="Kỳ báo cáo"
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
              className="min-w-0 appearance-none bg-transparent font-bold outline-none"
            >
              <option value="10/2026">Tháng 10/2026</option>
              <option value="09/2026">Tháng 09/2026</option>
              <option value="08/2026">Tháng 08/2026</option>
            </select>
          </label>

          <label className="flex h-10 w-[192px] items-center justify-between gap-2 rounded-lg border border-[#DCECF8] px-4 text-sm text-[#526575]">
            <span>Từ:</span>
            <input
              aria-label="Từ ngày"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
              placeholder="DD/MM/YYYY"
              className="w-[90px] bg-transparent outline-none"
            />
            <FiCalendar aria-hidden="true" className="h-5 w-5 shrink-0" />
          </label>

          <label className="flex h-10 w-[192px] items-center justify-between gap-2 rounded-lg border border-[#DCECF8] px-4 text-sm text-[#526575]">
            <span>Đến:</span>
            <input
              aria-label="Đến ngày"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
              placeholder="DD/MM/YYYY"
              className="w-[90px] bg-transparent outline-none"
            />
            <FiCalendar aria-hidden="true" className="h-5 w-5 shrink-0" />
          </label>

          <button
            type="button"
            aria-label="Làm mới bộ lọc"
            onClick={resetFilters}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#DCECF8] text-[#526575] transition-colors hover:bg-[#F7FBFF] focus-visible:outline-2 focus-visible:outline-[#0D8BEA]"
          >
            <FiRefreshCw aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-3">
          <button
            type="button"
            onClick={exportCsv}
            className="flex h-10 items-center justify-center gap-2 rounded-lg border border-[#DCECF8] bg-[#F7FBFF] px-4 text-sm font-bold text-[#0D8BEA] transition-colors hover:bg-[#E8F5FF] focus-visible:outline-2 focus-visible:outline-[#0D8BEA]"
          >
            <FiDownload aria-hidden="true" className="h-4 w-4" />
            Xuất Excel
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex h-10 items-center justify-center gap-2 rounded-lg bg-[#0D8BEA] px-4 text-sm font-bold text-white shadow-[0_1px_1px_rgba(0,0,0,0.05)] transition-colors hover:bg-[#075A9C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D8BEA]"
          >
            <FiPrinter aria-hidden="true" className="h-4 w-4" />
            In báo cáo
          </button>
        </div>
      </section>

      <section aria-label="Tổng quan doanh thu" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="TỔNG DOANH THU"
          value="273.950.000 đ"
          detail="Đã trừ chiết khấu"
          color="text-[#075A9C]"
        />
        <KpiCard
          label="DOANH THU PHÒNG"
          value="218.600.000 đ"
          detail="Chiếm 76.3% tổng thu"
          color="text-[#0D8BEA]"
        />
        <KpiCard
          label="DỊCH VỤ & PHỤ THU"
          value="67.850.000 đ"
          detail="Chiếm 23.7% tổng thu"
          color="text-[#2E8B57]"
        />
        <KpiCard
          label="TỔNG CHIẾT KHẤU"
          value="- 12.500.000 đ"
          detail="Từ 56 lượt áp dụng mã"
          color="text-[#D9534F]"
        />
      </section>

      <section
        aria-label="Biểu đồ doanh thu"
        className="grid grid-cols-1 gap-3 lg:grid-cols-[2fr_1fr]"
      >
        <article className="flex min-h-[397px] flex-col rounded-xl border border-[#DCECF8] bg-white p-5 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-[#075A9C]">
                Xu hướng doanh thu tháng {period}
              </h2>
              <p className="text-xs text-[#526575]">
                Biểu đồ đối soát doanh thu tiền phòng và dịch vụ theo từng tuần
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-xs text-[#526575]">
              <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                <span className="h-2.5 w-2.5 rounded-full bg-[#0D8BEA]" />
                Tiền phòng
              </span>
              <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                <span className="h-2.5 w-2.5 rounded-full bg-[#FFC542]" />
                Dịch vụ phát sinh
              </span>
              <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                <span className="h-0.5 w-4 bg-[#075A9C]" />
                Tỷ lệ lấp đầy
              </span>
            </div>
          </div>

          <div className="mt-4 min-h-[220px] flex-1">
            <ResponsiveContainer width="100%" height="100%" minHeight={220}>
              <ComposedChart
                data={revenueData}
                margin={{ top: 4, right: 4, left: -14, bottom: 0 }}
              >
                <CartesianGrid stroke="#DEE8FF" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#526575', fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                />
                <YAxis
                  yAxisId="revenue"
                  domain={[0, 40]}
                  ticks={[0, 10, 20, 30, 40]}
                  tickFormatter={(value) => (value ? `${value} tr` : '0')}
                  tick={{ fill: '#707884', fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={42}
                />
                <YAxis
                  yAxisId="rate"
                  orientation="right"
                  domain={[0, 100]}
                  hide
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar
                  yAxisId="revenue"
                  dataKey="room"
                  name="Tiền phòng"
                  stackId="revenue"
                  fill="#0D8BEA"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  yAxisId="revenue"
                  dataKey="service"
                  name="Dịch vụ phát sinh"
                  stackId="revenue"
                  fill="#FFC542"
                  radius={[5, 5, 0, 0]}
                />
                <Line
                  yAxisId="rate"
                  dataKey="rate"
                  name="Tỷ lệ lấp đầy"
                  type="monotone"
                  stroke="#075A9C"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#E8F5FF] pt-3 text-xs text-[#64748B]">
            <p className="flex items-center gap-1.5">
              <FiTrendingUp aria-hidden="true" className="h-3.5 w-3.5 text-[#2E8B57]" />
              Tốc độ tăng trưởng thu đạt đỉnh điểm vào Tuần 3 (+25.5%) nhờ hội nghị du lịch thương vụ.
            </p>
            <span className="whitespace-nowrap">Đơn vị: VNĐ</span>
          </div>
        </article>

        <article className="flex min-h-[397px] flex-col rounded-xl border border-[#DCECF8] bg-white p-5 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
          <h2 className="text-lg font-bold text-[#075A9C]">
            Tỷ trọng theo loại phòng
          </h2>
          <p className="text-xs text-[#526575]">
            Phân bổ nguồn thu theo các phân hạng phòng
          </p>

          <div className="relative mx-auto mt-1 h-[150px] w-full max-w-[260px]">
          <RoomMixChart />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-semibold text-[#526575]">
                HẠNG A
              </span>
              <span className="text-lg font-bold text-[#075A9C]">42%</span>
            </div>
          </div>
          </div>

          <ul className="mt-auto flex flex-col divide-y divide-[#E8F5FF]">
            {roomTypes.map((room) => (
              <li
                key={room.name}
                className="flex items-center justify-between gap-2 py-2"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="h-3.5 w-3.5 shrink-0 rounded-full"
                    style={{ backgroundColor: room.color }}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-[#075A9C]">
                      {room.name}
                    </p>
                    <p className="text-[10px] text-[#64748B]">
                      {room.rateLabel}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs font-bold text-[#075A9C]">
                    {(Math.floor(room.revenue / 100000) / 10).toFixed(1)}M
                  </p>
                  <p className="text-[10px] text-[#64748B]">
                    {room.share.toFixed(1)}%
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="overflow-hidden rounded-xl border border-[#DCECF8] bg-white">
        <div className="flex h-[57px] shrink-0 items-center justify-between gap-3 border-b border-[#DCECF8] px-4 py-3">
          <h2 className="text-lg font-bold text-[#075A9C]">
            Báo cáo doanh thu theo Loại phòng
          </h2>
          <span className="hidden items-center gap-1.5 rounded-md bg-[#F7FBFF] px-2 py-1 text-[10px] text-[#64748B] sm:inline-flex">
            <FiInfo aria-hidden="true" className="h-3 w-3 text-[#0D8BEA]" />
            Dữ liệu đối soát tài chính
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] table-fixed border-collapse text-sm text-[#526575]">
            <colgroup>
              <col className="w-[5.3%]" />
              <col className="w-[45.3%]" />
              <col className="w-[24.7%]" />
              <col className="w-[24.7%]" />
            </colgroup>
            <thead className="border-b-2 border-[#DCECF8] bg-[#F8FAFC]">
              <tr className="h-12">
                <th className="px-3 text-center text-sm font-bold whitespace-nowrap text-[#526575]">
                  #
                </th>
                <th className="px-3 text-left text-sm font-bold whitespace-nowrap text-[#526575]">
                  LOẠI PHÒNG &amp; ĐƠN GIÁ QUY CHUẨN
                </th>
                <th className="px-3 text-right text-sm font-bold whitespace-nowrap text-[#526575]">
                  DOANH THU
                </th>
                <th className="px-3 text-center text-sm font-bold whitespace-nowrap text-[#526575]">
                  TỶ LỆ (%)
                </th>
              </tr>
            </thead>
            <tbody className="text-sm text-[#526575]">
              {roomTypes.map((room, index) => (
                <tr
                  key={room.name}
                  className="h-12 border-b border-[#E8F5FF] bg-white transition-colors hover:bg-[#F7FBFF]"
                >
                  <td className="px-3 text-center">{index + 1}</td>
                  <td className="px-3">
                    <p className="truncate text-sm font-bold text-[#1E293B]">
                      {room.description}
                    </p>
                    <p className="truncate text-sm text-[#64748B]">
                      {room.detail}
                    </p>
                  </td>
                  <td className="px-3 text-right text-sm">
                    {formatMoney(room.revenue)}
                  </td>
                  <td className="px-3 text-center text-sm text-[#2E8B57]">
                    {room.share.toFixed(1)}%
                  </td>
                </tr>
              ))}
              <tr className="h-12 border-b border-[#E8F5FF] bg-white transition-colors hover:bg-[#F7FBFF]">
                <td className="px-3 text-center text-[#D9534F]">4</td>
                <td className="px-3 font-bold text-[#D9534F]">
                  {discounts.description}
                </td>
                <td className="px-3 text-right text-sm text-[#D9534F]">
                  {formatTableMoney(discounts.revenue)}
                </td>
                <td className="px-3 text-center text-sm text-[#D9534F]">
                  {discounts.share.toFixed(1)}%
                </td>
              </tr>
              <tr className="h-12 bg-[#F7FBFF] text-base font-bold text-[#075A9C]">
                <td colSpan={2} className="px-4">
                  TỔNG CỘNG DOANH THU THỰC NHẬN
                </td>
                <td className="px-3 text-right whitespace-nowrap">
                  {formatMoney(273950000)}
                </td>
                <td className="px-3 text-center">100%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="flex min-h-12 items-center gap-2 border-t border-[#E8F5FF] px-4 py-2 text-xs text-[#64748B]">
          <FiInfo aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
          Số liệu đã tự động tổng hợp và hạch toán trên Folio thanh toán của toàn bộ buồng phòng trong tháng {period}.
        </p>
      </section>
    </div>
  );
}

export default ReportPage;
