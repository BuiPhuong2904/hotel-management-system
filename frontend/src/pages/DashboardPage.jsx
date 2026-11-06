const metrics = [
  {
    title: 'Tổng số phòng',
    value: '48',
    suffix: 'phòng',
    note: 'Quy mô cơ sở',
    color: '#075A9C',
    progress: null,
  },
  {
    title: 'Đang lưu trú',
    value: '36',
    suffix: 'phòng',
    note: '75.0% lấp đầy',
    color: '#0D8BEA',
    progress: 75,
  },
  {
    title: 'Còn trống',
    value: '08',
    suffix: 'phòng',
    note: 'Sẵn sàng đón khách',
    color: '#2E8B57',
    progress: 16.59,
  },
  {
    title: 'Đang dọn',
    value: '03',
    suffix: 'phòng',
    note: 'Đang xử lý',
    color: '#D97706',
    progress: 6.25,
  },
  {
    title: 'Bảo trì',
    value: '01',
    suffix: 'phòng',
    note: 'Phòng 402',
    color: '#D9534F',
    progress: 3.125,
  },
  {
    title: 'Nhận phòng',
    value: '07',
    suffix: '/ 12',
    note: 'Còn 5 lượt tới',
    color: '#526575',
    progress: 58.33,
  },
  {
    title: 'Trả phòng',
    value: '05',
    suffix: '/ 09',
    note: 'Đã thanh toán',
    color: '#526575',
    progress: 55.55,
  },
  {
    title: 'Doanh thu',
    value: '28.65M',
    suffix: '',
    note: '+14.2% (so với tuần trước)',
    color: '#075A9C',
    progress: null,
  },
];

const revenueData = [
  { day: '18/10', rooms: 26, services: 4, occupancy: 62 },
  { day: '19/10', rooms: 29, services: 5, occupancy: 68 },
  { day: '20/10', rooms: 33, services: 3, occupancy: 79 },
  { day: '21/10', rooms: 37, services: 3, occupancy: 94 },
  { day: '22/10', rooms: 34, services: 5, occupancy: 89 },
  { day: '23/10', rooms: 18, services: 2, occupancy: 50 },
  { day: 'Hôm nay', rooms: 27, services: 4, occupancy: 72 },
];

const roomTypes = [
  {
    name: 'Loại A (Standard)',
    rate: '150.000 đ/đêm',
    share: '42%',
    total: '12.033.000 đ',
    color: '#0D8BEA',
  },
  {
    name: 'Loại B (Deluxe)',
    rate: '170.000 đ/đêm',
    share: '35%',
    total: '10.027.000 đ',
    color: '#FFC542',
  },
  {
    name: 'Loại C (VIP Suite)',
    rate: '200.000 đ/đêm',
    share: '23%',
    total: '6.590.000 đ',
    color: '#2E8B57',
  },
];

const roomStatuses = {
  available: { color: '#2E8B57', label: 'Trống' },
  occupied: { color: 'rgba(13,139,234,0.7)', label: 'Có khách' },
  cleaning: { color: '#FFC542', label: 'Đang dọn dẹp' },
  maintenance: { color: '#D9534F', label: 'Bảo trì' },
};

const floorRooms = [
  {
    floor: 4,
    rooms: [
      ['401', 'occupied'], ['402', 'maintenance'], ['403', 'occupied'],
      ['404', 'occupied'], ['405', 'available'], ['406', 'occupied'],
      ['407', 'occupied'], ['408', 'occupied'], ['409', 'cleaning'],
      ['410', 'occupied'], ['411', 'occupied'], ['412', 'available'],
    ],
  },
  {
    floor: 3,
    rooms: [
      ['301', 'occupied'], ['302', 'occupied'], ['303', 'occupied'],
      ['304', 'available'], ['305', 'occupied'], ['306', 'occupied'],
      ['307', 'occupied'], ['308', 'occupied'], ['309', 'occupied'],
      ['310', 'available'], ['311', 'occupied'], ['312', 'occupied'],
    ],
  },
  {
    floor: 2,
    rooms: [
      ['201', 'occupied'], ['202', 'occupied'], ['203', 'occupied'],
      ['204', 'cleaning'], ['205', 'occupied'], ['206', 'available'],
      ['207', 'occupied'], ['208', 'occupied'], ['209', 'occupied'],
      ['210', 'occupied'], ['211', 'available'], ['212', 'occupied'],
    ],
  },
  {
    floor: 1,
    rooms: [
      ['101', 'occupied'], ['102', 'occupied'], ['103', 'available'],
      ['104', 'occupied'], ['105', 'occupied'], ['106', 'cleaning'],
      ['107', 'occupied'], ['108', 'occupied'], ['109', 'occupied'],
      ['110', 'available'], ['111', 'occupied'], ['112', 'available'],
    ],
  },
];

const alerts = [
  {
    title: 'Phòng 204 yêu cầu dọn phòng khẩn',
    description: 'Khách VIP gọi bổ sung khăn tắm & dọn đồ uống tràn',
    color: '#FFC542',
  },
  {
    title: 'Đoàn khách K-9821 check-in trễ',
    description: 'Chuyến bay hoãn, dự kiến đến lúc 15:30 (4 phòng)',
    color: '#0D8BEA',
  },
  {
    title: 'Phòng 305 hết hạn nước minibar',
    description: 'Kiểm kê ca sáng phát hiện 02 chai nước khoáng đã sử dụng',
    color: '#D9534F',
  },
];

function MetricCard({ metric }) {
  return (
    <article className="flex min-w-0 flex-col gap-2 rounded-xl border border-[#DCECF8] bg-white p-3.5 shadow-[0_1px_1px_rgba(0,0,0,0.05)] sm:p-[17px]">
      <h2
        className="truncate text-xs font-bold capitalize sm:text-sm"
        style={{ color: metric.color }}
      >
        {metric.title}
      </h2>
      <div className="min-w-0">
        <div className="flex items-baseline gap-1">
          <strong
            className="truncate text-xl leading-7"
            style={{ color: metric.color }}
          >
            {metric.value}
          </strong>
          {metric.suffix && (
            <span className="whitespace-nowrap text-[10px] text-[#526575] sm:text-xs">
              {metric.suffix}
            </span>
          )}
        </div>
        <p
          className="mt-0.5 min-h-4 text-[10px] leading-4 sm:text-xs"
          style={{ color: metric.progress === null ? '#526575' : metric.color }}
        >
          {metric.note}
        </p>
      </div>
      {metric.progress !== null && (
        <div
          aria-label={`${metric.title}: ${metric.progress}%`}
          className="mt-auto h-1.5 overflow-hidden rounded-full bg-[#DCECF8]"
          role="progressbar"
          aria-valuenow={metric.progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-[#0D8BEA]"
            style={{ width: `${metric.progress}%` }}
          />
        </div>
      )}
    </article>
  );
}

function RevenueChart() {
  const chart = { left: 44, right: 585, top: 18, bottom: 202 };
  const chartHeight = chart.bottom - chart.top;
  const barWidth = 12;
  const groupGap = (chart.right - chart.left) / revenueData.length;
  const linePoints = revenueData
    .map((item, index) => {
      const x = chart.left + groupGap * index + groupGap / 2;
      const y = chart.bottom - (item.occupancy / 100) * chartHeight;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg
      aria-label="Biểu đồ doanh thu và công suất buồng trong 7 ngày qua"
      className="h-full w-full"
      role="img"
      viewBox="0 0 600 230"
      preserveAspectRatio="xMidYMid meet"
    >
      {[0, 10, 20, 30, 40].map((value) => {
        const y = chart.bottom - (value / 40) * chartHeight;
        return (
          <g key={value}>
            <text
              x="36"
              y={y + 3}
              fill="#64748B"
              fontSize="10"
              textAnchor="end"
            >
              {value === 0 ? '0' : `${value}tr`}
            </text>
            <line
              x1={chart.left}
              x2={chart.right}
              y1={y}
              y2={y}
              stroke="#F1F5F9"
              strokeDasharray="3 4"
            />
          </g>
        );
      })}
      {revenueData.map((item, index) => {
        const center = chart.left + groupGap * index + groupGap / 2;
        const roomHeight = (item.rooms / 40) * chartHeight;
        const serviceHeight = (item.services / 40) * chartHeight;
        return (
          <g key={item.day}>
            <rect
              x={center - barWidth / 2}
              y={chart.bottom - roomHeight}
              width={barWidth}
              height={roomHeight}
              rx="2"
              fill="#0D8BEA"
            />
            <rect
              x={center - barWidth / 2}
              y={chart.bottom - roomHeight - serviceHeight}
              width={barWidth}
              height={serviceHeight}
              rx="2"
              fill="#FFC542"
            />
            <text
              x={center}
              y="220"
              fill={index === revenueData.length - 1 ? '#0D8BEA' : '#64748B'}
              fontSize="10"
              fontWeight={index === revenueData.length - 1 ? '700' : '400'}
              textAnchor="middle"
            >
              {item.day}
            </text>
          </g>
        );
      })}
      <polyline
        points={linePoints}
        fill="none"
        stroke="#075A9C"
        strokeWidth="2"
      />
      {revenueData.map((item, index) => {
        const cx = chart.left + groupGap * index + groupGap / 2;
        const cy = chart.bottom - (item.occupancy / 100) * chartHeight;
        return (
          <circle
            key={item.day}
            cx={cx}
            cy={cy}
            r="3"
            fill="#FFFFFF"
            stroke="#075A9C"
            strokeWidth="1.5"
          />
        );
      })}
    </svg>
  );
}

function ChartLegend({ color, label, line = false }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs text-[#475569]">
      <span
        aria-hidden="true"
        className={line ? 'h-0.5 w-3' : 'h-2.5 w-2.5 rounded-[2px]'}
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}

function Panel({ children, className = '' }) {
  return (
    <section
      className={`min-w-0 rounded-xl border border-[#DCECF8] bg-white p-4 shadow-[0_1px_1px_rgba(0,0,0,0.05)] sm:p-[17px] ${className}`}
    >
      {children}
    </section>
  );
}

function DashboardPage() {
  return (
    <div className="min-w-0">
            <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-4 sm:gap-6">
              <section
                aria-label="Chỉ số tổng quan"
                className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8 xl:gap-2"
              >
                {metrics.map((metric) => (
                  <MetricCard key={metric.title} metric={metric} />
                ))}
              </section>

              <section
                aria-label="Biểu đồ doanh thu"
                className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-12"
              >
                <Panel className="flex min-h-[340px] flex-col gap-4 xl:col-span-7 xl:min-h-[376px]">
                  <div className="flex flex-col gap-2">
                    <div>
                      <h1 className="text-base font-bold text-[#075A9C] sm:text-lg">
                        Công suất buồng &amp; Doanh thu 7 ngày qua
                      </h1>
                      <p className="mt-1 text-xs text-[#526575]">
                        Tổng hợp dữ liệu đối soát thực nhận theo ca trực
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-2">
                      <ChartLegend color="#0D8BEA" label="Doanh thu phòng" />
                      <ChartLegend color="#FFC542" label="Doanh thu dịch vụ" />
                      <ChartLegend color="#075A9C" label="% Lấp đầy" line />
                    </div>
                  </div>
                  <div className="min-h-[230px] flex-1 rounded-lg border border-[#F1F5F9] bg-[#F8FAFC]/70 p-2 sm:p-3">
                    <RevenueChart />
                  </div>
                </Panel>

                <Panel className="flex min-h-[340px] flex-col gap-5 xl:col-span-5 xl:min-h-[376px]">
                  <div>
                    <h2 className="text-base font-bold text-[#075A9C] sm:text-lg">
                      Cơ cấu doanh thu theo loại phòng
                    </h2>
                    <p className="mt-1 text-xs text-[#526575]">
                      Phân bổ tỷ trọng định mức doanh số thực thu theo loại phòng
                    </p>
                  </div>
                  <div className="flex flex-1 flex-wrap items-center justify-center gap-5 sm:gap-8">
                    <div
                      aria-label="Hạng A chiếm 42%, hạng B 35%, hạng C 23%"
                      className="relative flex h-36 w-36 shrink-0 items-center justify-center rounded-full"
                      role="img"
                      style={{
                        background:
                          'conic-gradient(#0D8BEA 0% 42%, #FFC542 42% 77%, #2E8B57 77% 100%)',
                      }}
                    >
                      <div className="flex h-[92px] w-[92px] flex-col items-center justify-center rounded-full bg-white">
                        <span className="text-[10px] font-semibold text-[#526575]">HẠNG A</span>
                        <strong className="text-xl text-[#075A9C]">42%</strong>
                      </div>
                    </div>
                    <div className="flex min-w-[170px] flex-col gap-3">
                      {roomTypes.map((type) => (
                        <div key={type.name} className="flex items-start gap-2">
                          <span
                            aria-hidden="true"
                            className="mt-1 h-2.5 w-2.5 shrink-0 rounded-[3px]"
                            style={{ backgroundColor: type.color }}
                          />
                          <div className="min-w-0">
                            <h3 className="text-xs font-bold text-[#075A9C]">
                              {type.name}
                            </h3>
                            <p className="text-[10px] leading-4 text-[#64748B]">
                              {type.rate} • {type.share}
                              <br />({type.total})
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Panel>
              </section>

              <section
                aria-label="Tình trạng phòng và cảnh báo"
                className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-12"
              >
                <Panel className="flex min-h-[304px] flex-col gap-4 xl:col-span-7">
                  <div>
                    <h2 className="text-base font-bold text-[#075A9C] sm:text-lg">
                      Sơ đồ ma trận phòng trực quan
                    </h2>
                    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1.5">
                      {Object.entries(roomStatuses).map(([key, item]) => (
                        <span
                          key={key}
                          className="inline-flex items-center gap-1.5 text-[10px] text-[#526575] sm:text-xs"
                        >
                          <span
                            aria-hidden="true"
                            className="h-2 w-2 rounded-[2px]"
                            style={{ backgroundColor: item.color }}
                          />
                          {item.label}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
                    {floorRooms.map(({ floor, rooms }) => (
                      <div
                        key={floor}
                        className="grid grid-cols-[52px_minmax(0,1fr)] items-center gap-2 sm:grid-cols-[64px_minmax(0,1fr)]"
                      >
                        <span className="text-center text-[10px] font-bold text-[#526575] sm:text-xs">
                          TẦNG {floor}
                        </span>
                        <div className="grid grid-cols-6 gap-1 sm:grid-cols-12 sm:gap-1.5">
                          {rooms.map(([number, state]) => (
                            <span
                              key={number}
                              aria-label={`Phòng ${number}: ${roomStatuses[state].label}`}
                              className="flex h-6 min-w-0 items-center justify-center rounded text-[10px] font-semibold text-white sm:text-xs"
                              style={{ backgroundColor: roomStatuses[state].color }}
                            >
                              {number}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </Panel>

                <Panel className="min-h-[304px] xl:col-span-5">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <h2 className="text-base font-bold text-[#075A9C] sm:text-lg">
                      Cảnh báo &amp; Việc cần xử lý ngay
                    </h2>
                    <span className="shrink-0 rounded-full bg-[#D9534F] px-2.5 py-1 text-[9px] font-bold text-white">
                      3 YÊU CẦU
                    </span>
                  </div>
                  <div className="flex flex-col gap-2.5">
                    {alerts.map((alert) => (
                      <article
                        key={alert.title}
                        className="rounded-lg border p-2"
                        style={{ borderColor: alert.color }}
                      >
                        <h3 className="text-[11px] font-bold leading-4 text-[#526575] sm:text-xs">
                          {alert.title}
                        </h3>
                        <p className="text-[10px] leading-4 text-[#64748B]">
                          {alert.description}
                        </p>
                      </article>
                    ))}
                  </div>
                </Panel>
              </section>
            </div>
    </div>
  );
}

export default DashboardPage;
