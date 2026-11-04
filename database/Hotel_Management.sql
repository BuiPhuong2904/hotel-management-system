CREATE DATABASE Hotel_Management
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
USE Hotel_Management;

-- =====================================================================
-- 1. BẢNG
-- =====================================================================
CREATE TABLE Users (
    UserID INT AUTO_INCREMENT PRIMARY KEY,
    Username VARCHAR(50) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,
    Role ENUM('Admin', 'Staff', 'Customer') NOT NULL DEFAULT 'Customer',
    FullName VARCHAR(100) NOT NULL,
    IdentityNumber VARCHAR(20) NULL UNIQUE,
    Phone VARCHAR(15) NULL UNIQUE,
    Email VARCHAR(100) NULL UNIQUE,
    Status ENUM('Active', 'Inactive', 'Blocked') NOT NULL DEFAULT 'Active',
    Note VARCHAR(255) NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE Settings (
    SettingKey VARCHAR(50) PRIMARY KEY,
    SettingValue VARCHAR(100) NOT NULL,
    Description VARCHAR(255) NULL,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE RoomTypes (
    RoomTypeID VARCHAR(10) PRIMARY KEY,
    TypeName VARCHAR(50) NOT NULL,
    BasePrice DECIMAL(12, 2) NOT NULL,
    StandardGuests INT NOT NULL DEFAULT 2,
    MaxGuests INT NOT NULL DEFAULT 3,
    Note VARCHAR(255) NULL,
    CONSTRAINT CHK_RoomTypes_Price CHECK (BasePrice >= 0),
    CONSTRAINT CHK_RoomTypes_Guests CHECK (StandardGuests >= 1 AND StandardGuests <= MaxGuests)
) ENGINE=InnoDB;

CREATE TABLE Services (
    ServiceID INT AUTO_INCREMENT PRIMARY KEY,
    ServiceName VARCHAR(100) NOT NULL UNIQUE,
    Unit VARCHAR(20) NOT NULL,
    Price DECIMAL(12, 2) NOT NULL,
    Note VARCHAR(255) NULL,
    CONSTRAINT CHK_Services_Price CHECK (Price >= 0)
) ENGINE=InnoDB;

CREATE TABLE Rooms (
    RoomID INT AUTO_INCREMENT PRIMARY KEY,
    RoomNumber VARCHAR(10) NOT NULL UNIQUE,
    RoomTypeID VARCHAR(10) NOT NULL,
    Status ENUM('Available', 'Occupied', 'Cleaning', 'Maintenance') NOT NULL DEFAULT 'Available',
    Note VARCHAR(255) NULL,
    CONSTRAINT FK_Rooms_RoomTypes FOREIGN KEY (RoomTypeID) REFERENCES RoomTypes(RoomTypeID) ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE Bookings (
    BookingID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NULL,
    GuestName VARCHAR(100) NOT NULL,
    GuestPhone VARCHAR(15) NOT NULL,
    CreatedBy INT NULL,
    BookingSource ENUM('Online', 'Direct') NOT NULL DEFAULT 'Direct',
    BookingDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ExpectedCheckIn DATETIME NOT NULL,
    ExpectedCheckOut DATETIME NOT NULL,
    Status ENUM('Pending', 'Confirmed', 'CheckedIn', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Pending',
    Deposit DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    Note VARCHAR(255) NULL,
    CONSTRAINT FK_Bookings_Users FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE SET NULL,
    CONSTRAINT FK_Bookings_CreatedBy FOREIGN KEY (CreatedBy) REFERENCES Users(UserID) ON DELETE SET NULL,
    CONSTRAINT CHK_Bookings_Dates CHECK (ExpectedCheckOut > ExpectedCheckIn),
    CONSTRAINT CHK_Bookings_Deposit CHECK (Deposit >= 0)
) ENGINE=InnoDB;

CREATE TABLE BookingDetails (
    DetailID INT AUTO_INCREMENT PRIMARY KEY,
    BookingID INT NOT NULL,
    RoomID INT NOT NULL,
    PriceAtBooking DECIMAL(12, 2) NOT NULL,
    ActualCheckIn DATETIME NULL,
    ActualCheckOut DATETIME NULL,
    AppliedSurchargeRate DECIMAL(5, 2) NOT NULL DEFAULT 0.25,
    AppliedForeignerRate DECIMAL(5, 2) NOT NULL DEFAULT 1.50,
    GuestCount INT NOT NULL DEFAULT 1,
    HasForeigner BOOLEAN NOT NULL DEFAULT FALSE,
    RentalDays INT NOT NULL DEFAULT 1,
    SubTotal DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    TimeSurcharge DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    CONSTRAINT FK_BookingDetails_Bookings FOREIGN KEY (BookingID) REFERENCES Bookings(BookingID) ON DELETE CASCADE,
    CONSTRAINT FK_BookingDetails_Rooms FOREIGN KEY (RoomID) REFERENCES Rooms(RoomID) ON UPDATE CASCADE,
    CONSTRAINT CHK_BookingDetails_Guest CHECK (GuestCount >= 1),
    CONSTRAINT CHK_BookingDetails_Days CHECK (RentalDays >= 1)
) ENGINE=InnoDB;

CREATE TABLE Invoices (
    InvoiceID INT AUTO_INCREMENT PRIMARY KEY,
    BookingID INT NOT NULL UNIQUE,
    CreatedBy INT NOT NULL,
    BillingName VARCHAR(100) NOT NULL,
    BillingAddress VARCHAR(255) NULL,
    RoomTotal DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    TimeSurchargeTotal DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    ServiceTotal DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    DepositDeducted DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    TotalAmount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    AmountDue DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    PaymentStatus ENUM('Pending', 'Paid', 'Failed', 'Cancelled') NOT NULL DEFAULT 'Pending',
    PaymentMethod ENUM('Cash', 'BankTransfer', 'CreditCard') NULL,
    TransactionReference VARCHAR(100) NULL,
    PaidAt DATETIME NULL,
    CONSTRAINT FK_Invoices_Bookings FOREIGN KEY (BookingID) REFERENCES Bookings(BookingID) ON UPDATE CASCADE,
    CONSTRAINT FK_Invoices_Users FOREIGN KEY (CreatedBy) REFERENCES Users(UserID)
) ENGINE=InnoDB;

CREATE TABLE RoomGuests (
    GuestID INT AUTO_INCREMENT PRIMARY KEY,
    DetailID INT NOT NULL,
    FullName VARCHAR(100) NOT NULL,
    IdentityNumber VARCHAR(20) NOT NULL,
    CustomerType ENUM('Domestic', 'Foreign') NOT NULL DEFAULT 'Domestic',
    Address VARCHAR(255) NULL,
    CONSTRAINT FK_RoomGuests_BookingDetails FOREIGN KEY (DetailID) REFERENCES BookingDetails(DetailID) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE ServiceUsages (
    UsageID INT AUTO_INCREMENT PRIMARY KEY,
    DetailID INT NOT NULL,
    ServiceID INT NOT NULL,
    Quantity INT NOT NULL DEFAULT 1,
    PriceAtUsage DECIMAL(12, 2) NOT NULL,
    SubTotal DECIMAL(12, 2) NOT NULL,
    RecordedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_ServiceUsages_BookingDetails FOREIGN KEY (DetailID) REFERENCES BookingDetails(DetailID) ON DELETE CASCADE,
    CONSTRAINT FK_ServiceUsages_Services FOREIGN KEY (ServiceID) REFERENCES Services(ServiceID) ON UPDATE CASCADE,
    CONSTRAINT CHK_ServiceUsages_Qty CHECK (Quantity > 0)
) ENGINE=InnoDB;

-- =====================================================================
-- 2. DỮ LIỆU MẪU
-- =====================================================================

-- ---------- Users ----------
INSERT INTO Users (Username, PasswordHash, Role, FullName, IdentityNumber, Phone, Email, Status, Note) VALUES
('admin',            '$2a$12$Yo9f/CkzNlIzzJQqmhyNuO641QmY6qyYP829Smi2g3IPIjb7XLZjO', 'Admin',    'Nguyễn Chiến',     '079123456789', '0901234567', 'admin@hotel.com',      'Active',   NULL),
('letan1',           '$2a$12$T/gOEbGu1qYE7HffIpwKz.bemwYpJWRC0ctEiiiYfST1aP8nmdr86', 'Staff',    'Lê Kim',           '079987654321', '0987654321', 'letan1@hotel.com',     'Active',   'Ca sáng'),
('letan2',           '$2a$12$.Aen5hRtqA/2yEjgjNbmmezjGANHeLgHrMXRRn5iH2rXgaNZKUYC.', 'Staff',    'Lê Văn',           '079111222333', '0911112222', 'letan2@hotel.com',     'Active',   'Ca chiều'),
('letan3',           '$2a$12$To6HlxdbFar42RjNQhsgfOdPKTp9FP0b9k3lKeFZycf1Ak7JfSe/y', 'Staff',    'Phạm Tân',         '079444555666', '0944445555', 'letan3@hotel.com',     'Active',   'Ca tối'),
('khach_nguyenvana', '$2a$12$Ut7UseLDglShgOZ3o1XMU.LmLIsbnDt/hO2S83NI3GKBe7NKBoX.G', 'Customer', 'Nguyễn Văn A',     '012345678910', '0912345678', 'nva@gmail.com',        'Active',   'Khách VIP'),
('khach_tranbinh',   '$2a$12$dNZYzaVfYM4EGNAN8mmW1OT4D4wvvlvCQOniuSjLrrLFavgy.MOxC', 'Customer', 'Trần Văn Bình',    '012111111111', '0901111111', 'binhtran@gmail.com',   'Active',   NULL),
('khach_nguyencuc',  '$2a$12$iY.WusB5.XJ1SFcDQLAoR.kIjFMvrL/hKOIbE/sklfwmnv6O384H2', 'Customer', 'Nguyễn Thị Cúc',   '012222222222', '0902222222', 'cucnguyen@gmail.com',  'Active',   NULL),
('khach_ledung',     '$2a$12$qEoEiNuE1r5rP0GwDtYN.eKba2DJEW.I0BjGqthtPjd1.kaMDU1V6', 'Customer', 'Lê Văn Dũng',      '012333333333', '0903333333', 'dungle@gmail.com',     'Active',   NULL),
('khach_hoangem',    '$2a$12$0fUalwwQN4bqOtBLHmzIF.QE9PtcHH6yQ2UN30L02/F0SdUfFeJI2', 'Customer', 'Hoàng Thị Em',     '012444444444', '0904444444', 'emhoang@gmail.com',    'Active',   NULL),
('khach_dinhphong',  '$2a$12$AGjyPZtnfq9wVCz8LTOBzOmJOeMTABinQf45Pdo1HcQaRaGwIHH3G', 'Customer', 'Đinh Văn Phong',   '012555555555', '0905555555', 'phongdinh@gmail.com',  'Active',   NULL),
('khach_vothanh',    '$2a$12$5tRBd6/Wg/ORPomZ296xxuiTmid07zhDUI4SXZ4HqLvDJnQPUS.ry', 'Customer', 'Võ Thành Long',    '012666666666', '0906666666', 'longvo@gmail.com',     'Active',   NULL),
('khach_phamhoa',    '$2a$12$eY7R14N22cT31twugcJdpOUOPpUv0E/onu7iFcLjWAy2ysDs8wUWC', 'Customer', 'Phạm Thị Hoa',     '012777777777', '0907777777', 'hoapham@gmail.com',    'Active',   NULL),
('khach_buiminh',    '$2a$12$gwGmSTR40Aml2/SShoOhdOFlU33r8gz3mJncLwstlNV.k.qMF5HAG', 'Customer', 'Bùi Quang Minh',    '012888888888', '0908888888', 'minhbui@gmail.com',    'Active',   NULL),
('khach_ngothu',     '$2a$12$16MX19eojFGlhbYzaP4kPe6VJ1ubafae0OM17WGDShFMAP8TRE0O2', 'Customer', 'Ngô Thị Thu',      '012999999999', '0909999999', 'thungo@gmail.com',     'Active',   NULL),
('letan4',           '$2a$12$gqOxUmHLEhUQAkrrwVSRwOe6QAyC0Daihpb468YrpvKxqfIfdJMLC', 'Staff',    'Đặng Hải',         '079555666777', '0955556666', 'letan4@hotel.com',     'Inactive', 'Đã nghỉ việc'),
('khach_truongkhoa', '$2a$12$cfexMqTqN9Efeaoy19pciuVrsnzdc2vT.l8eY9gnNWUmYh8wzlfo.', 'Customer', 'Trương Minh Khoa',  '012101010101', '0910101010', 'khoatruong@gmail.com',  'Blocked',  'Tài khoản bị khóa do hủy đặt phòng nhiều lần');

-- ---------- Settings ----------
INSERT INTO Settings (SettingKey, SettingValue, Description) VALUES
('SurchargeThirdGuestRate',   '0.25',  'Tỉ lệ phụ thu khách thứ 3 (25%)'),
('ForeignerCoefficient',      '1.5',   'Hệ số tính tiền nếu có khách nước ngoài (x1.5)'),
('MinDepositRateOnline',      '0.30',  'Tỉ lệ cọc tối thiểu khi đặt online (30%)'),
('StandardCheckInTime',       '14:00', 'Giờ nhận phòng tiêu chuẩn'),
('StandardCheckOutTime',      '12:00', 'Giờ trả phòng tiêu chuẩn'),
('EarlyCheckInSurchargeRate', '0.30',  'Phụ thu nhận phòng sớm (tỉ lệ trên đơn giá 1 ngày)'),
('LateCheckOutSurchargeRate', '0.30',  'Phụ thu trả phòng trễ (tỉ lệ trên đơn giá 1 ngày)');

-- ---------- RoomTypes ---------
INSERT INTO RoomTypes (RoomTypeID, TypeName, BasePrice, StandardGuests, MaxGuests) VALUES
('A', 'Phòng Loại A', 150000.00, 2, 3),
('B', 'Phòng Loại B', 170000.00, 2, 3),
('C', 'Phòng Loại C', 200000.00, 2, 3);

-- ---------- Services ----------
INSERT INTO Services (ServiceName, Unit, Price, Note) VALUES
('Nước khoáng Lavie',     'Chai', 15000.00,  NULL),
('Nước ngọt Coca-Cola',   'Lon',  20000.00,  NULL),
('Giặt ủi quần áo',       'Bộ',   30000.00,  NULL),
('Mì ly Hảo Hảo',         'Ly',   15000.00,  'Kèm nước sôi'),
('Bia Tiger',             'Lon',  25000.00,  '330ml, ướp lạnh'),
('Bia Heineken',          'Lon',  30000.00,  '330ml, ướp lạnh'),
('Snack khoai tây Oishi', 'Gói',  20000.00,  'Gói lớn'),
('Thuê xe máy tay ga',    'Ngày', 150000.00, 'Chưa bao gồm xăng'),
('Thuê xe máy số',        'Ngày', 120000.00, 'Chưa bao gồm xăng'),
('Đưa đón sân bay',       'Lượt', 300000.00, 'Xe 4 chỗ, liên hệ trước 2h'),
('Gia giường phụ',        'Đêm',  100000.00, 'Theo yêu cầu của khách');

-- ---------- Rooms ----------
INSERT INTO Rooms (RoomNumber, RoomTypeID, Status, Note) VALUES
('101', 'A', 'Occupied',    NULL),
('102', 'A', 'Available',   NULL),
('103', 'A', 'Available',   NULL),
('104', 'A', 'Maintenance', 'Đang sửa điều hòa'),
('201', 'B', 'Available',   NULL),
('202', 'B', 'Available',   NULL),
('203', 'B', 'Cleaning',    'Đang dọn dẹp sau khi khách trả phòng'),
('301', 'C', 'Available',   NULL),
('302', 'C', 'Available',   NULL),
('303', 'C', 'Available',   NULL);

-- ---------- Bookings ----------
-- 1 CheckedIn
INSERT INTO Bookings (BookingID, UserID, GuestName, GuestPhone, CreatedBy, BookingSource, BookingDate, ExpectedCheckIn, ExpectedCheckOut, Status, Deposit, Note) VALUES
(1,  5,    'Nguyễn Văn A',           '0912345678',  NULL, 'Online', '2026-10-28 09:30:00', '2026-11-03 14:00:00', '2026-11-05 12:00:00', 'CheckedIn', 90000.00,  'Đặt qua website'),
(2,  NULL, 'John Doe',               '0999888777',  2,    'Direct', '2026-09-25 13:50:00', '2026-09-25 14:00:00', '2026-09-26 12:00:00', 'Completed', 0.00,      'Khách nước ngoài đến trực tiếp'),
(3,  6,    'Trần Văn Bình',          '0901111111',  NULL, 'Online', '2026-10-05 20:15:00', '2026-10-10 14:00:00', '2026-10-12 12:00:00', 'Completed', 110000.00, NULL),
(4,  7,    'Nguyễn Thị Cúc',         '0902222222',  NULL, 'Online', '2026-10-08 10:00:00', '2026-10-15 14:00:00', '2026-10-18 12:00:00', 'Completed', 200000.00, 'Trả phòng trễ 3 giờ'),
(5,  NULL, 'Phan Văn Hùng',          '0933221100',  3,    'Direct', '2026-10-20 13:00:00', '2026-10-20 14:00:00', '2026-10-21 12:00:00', 'Completed', 0.00,      'Khách vãng lai, nhận phòng sớm'),
(6,  NULL, 'Công ty TNHH Minh Phát', '02838222222', 4,    'Direct', '2026-10-22 15:00:00', '2026-10-25 14:00:00', '2026-10-27 12:00:00', 'Completed', 210000.00, 'Đoàn công tác, thuê 2 phòng'),
(7,  8,    'Lê Văn Dũng',            '0903333333',  NULL, 'Online', '2026-11-04 08:00:00', '2026-11-10 14:00:00', '2026-11-12 12:00:00', 'Pending',   0.00,      'Chờ đặt cọc'),
(8,  9,    'Hoàng Thị Em',           '0904444444',  NULL, 'Online', '2026-11-02 19:40:00', '2026-11-08 14:00:00', '2026-11-09 12:00:00', 'Confirmed', 50000.00,  NULL),
(9,  10,   'Đinh Văn Phong',         '0905555555',  NULL, 'Online', '2026-10-25 11:20:00', '2026-10-30 14:00:00', '2026-11-01 12:00:00', 'Cancelled', 0.00,      'Khách hủy trước ngày đến'),
(10, 11,   'Võ Thành Long',          '0906666666',  2,    'Direct', '2026-09-10 13:30:00', '2026-09-10 14:00:00', '2026-09-12 12:00:00', 'Completed', 0.00,      NULL),
(11, 12,   'Phạm Thị Hoa',           '0907777777',  NULL, 'Online', '2026-09-12 21:00:00', '2026-09-18 14:00:00', '2026-09-20 12:00:00', 'Completed', 120000.00, NULL);

-- ---------- BookingDetails ----------
INSERT INTO BookingDetails (DetailID, BookingID, RoomID, PriceAtBooking, ActualCheckIn, ActualCheckOut, AppliedSurchargeRate, AppliedForeignerRate, GuestCount, HasForeigner, RentalDays, SubTotal, TimeSurcharge) VALUES
(1,  1,  1,  150000.00, '2026-11-03 14:15:00', NULL,                  0.25, 1.50, 2, FALSE, 2, 300000.00, 0.00),
(2,  2,  8,  200000.00, '2026-09-25 14:00:00', '2026-09-26 11:30:00', 0.25, 1.50, 1, TRUE,  1, 300000.00, 0.00),
(3,  3,  5,  170000.00, '2026-10-10 14:20:00', '2026-10-12 11:50:00', 0.25, 1.50, 3, FALSE, 2, 425000.00, 0.00),
(4,  4,  9,  200000.00, '2026-10-15 14:10:00', '2026-10-18 15:00:00', 0.25, 1.50, 2, TRUE,  3, 900000.00, 60000.00),
(5,  5,  2,  150000.00, '2026-10-20 13:00:00', '2026-10-21 11:40:00', 0.25, 1.50, 1, FALSE, 1, 150000.00, 45000.00),
(6,  6,  6,  170000.00, '2026-10-25 14:05:00', '2026-10-27 11:30:00', 0.25, 1.50, 2, FALSE, 2, 340000.00, 0.00),
(7,  6,  7,  170000.00, '2026-10-25 14:10:00', '2026-10-27 11:35:00', 0.25, 1.50, 2, FALSE, 2, 340000.00, 0.00),
(8,  7,  10, 200000.00, NULL,                  NULL,                  0.25, 1.50, 2, FALSE, 2, 400000.00, 0.00),
(9,  8,  3,  150000.00, NULL,                  NULL,                  0.25, 1.50, 2, FALSE, 1, 150000.00, 0.00),
(10, 9,  5,  170000.00, NULL,                  NULL,                  0.25, 1.50, 2, FALSE, 2, 340000.00, 0.00),
(11, 10, 3,  150000.00, '2026-09-10 14:00:00', '2026-09-12 11:30:00', 0.25, 1.50, 2, FALSE, 2, 300000.00, 0.00),
(12, 11, 6,  170000.00, '2026-09-18 14:30:00', '2026-09-20 11:40:00', 0.25, 1.50, 3, TRUE,  2, 637500.00, 0.00);

-- ---------- RoomGuests ----------
INSERT INTO RoomGuests (DetailID, FullName, IdentityNumber, CustomerType, Address) VALUES
(1,  'Nguyễn Văn A',      '012345678910', 'Domestic', 'TP. Hồ Chí Minh'),
(1,  'Trần Thị B',        '012345678911', 'Domestic', 'TP. Hồ Chí Minh'),
(2,  'John Doe',          'PASSPORT123',  'Foreign',  'New York, USA'),
(3,  'Trần Văn Bình',     '012111111111', 'Domestic', 'Biên Hòa, Đồng Nai'),
(3,  'Trần Thị Lan',      '012111111112', 'Domestic', 'Biên Hòa, Đồng Nai'),
(3,  'Trần Minh Khang',   '012111111113', 'Domestic', 'Biên Hòa, Đồng Nai'),
(4,  'Nguyễn Thị Cúc',    '012222222222', 'Domestic', 'Cần Thơ'),
(4,  'Michael Brown',     'P1234567',     'Foreign',  'London, UK'),
(5,  'Phan Văn Hùng',     '079333222111', 'Domestic', 'Vũng Tàu'),
(6,  'Đỗ Văn Phát',       '079700000001', 'Domestic', 'TP. Hồ Chí Minh'),
(6,  'Lý Thị Mai',        '079700000002', 'Domestic', 'TP. Hồ Chí Minh'),
(7,  'Hồ Quốc Bảo',       '079700000003', 'Domestic', 'TP. Hồ Chí Minh'),
(7,  'Tạ Thị Nga',        '079700000004', 'Domestic', 'TP. Hồ Chí Minh'),
(11, 'Võ Thành Long',     '012666666666', 'Domestic', 'Đà Nẵng'),
(11, 'Trần Thị Kim',      '012666666667', 'Domestic', 'Đà Nẵng'),
(12, 'Phạm Thị Hoa',      '012777777777', 'Domestic', 'Hà Nội'),
(12, 'Phạm Văn Hải',      '012777777778', 'Domestic', 'Hà Nội'),
(12, 'Emma Wilson',       'P7654321',     'Foreign',  'Sydney, Australia');

-- ---------- ServiceUsages ----------
INSERT INTO ServiceUsages (DetailID, ServiceID, Quantity, PriceAtUsage, SubTotal, RecordedAt) VALUES
(1,  1,  2, 15000.00,  30000.00,  '2026-11-03 18:00:00'),
(1,  3,  1, 30000.00,  30000.00,  '2026-11-04 08:30:00'),
(2,  10, 1, 300000.00, 300000.00, '2026-09-26 08:00:00'),
(2,  6,  2, 30000.00,  60000.00,  '2026-09-25 20:00:00'),
(3,  3,  2, 30000.00,  60000.00,  '2026-10-11 09:00:00'),
(3,  5,  3, 25000.00,  75000.00,  '2026-10-11 21:00:00'),
(4,  8,  2, 150000.00, 300000.00, '2026-10-15 15:00:00'),
(4,  2,  4, 20000.00,  80000.00,  '2026-10-16 20:00:00'),
(5,  4,  2, 15000.00,  30000.00,  '2026-10-20 22:00:00'),
(5,  1,  1, 15000.00,  15000.00,  '2026-10-21 07:30:00'),
(6,  3,  3, 30000.00,  90000.00,  '2026-10-26 09:00:00'),
(7,  2,  2, 20000.00,  40000.00,  '2026-10-25 20:00:00'),
(7,  7,  2, 20000.00,  40000.00,  '2026-10-25 20:05:00'),
(11, 6,  4, 30000.00,  120000.00, '2026-09-11 20:30:00'),
(11, 4,  2, 15000.00,  30000.00,  '2026-09-11 23:00:00'),
(12, 10, 1, 300000.00, 300000.00, '2026-09-18 12:30:00'),
(12, 1,  3, 15000.00,  45000.00,  '2026-09-19 10:00:00');

-- ---------- Invoices ----------
INSERT INTO Invoices (InvoiceID, BookingID, CreatedBy, BillingName, BillingAddress, RoomTotal, TimeSurchargeTotal, ServiceTotal, DepositDeducted, TotalAmount, AmountDue, PaymentStatus, PaymentMethod, TransactionReference, PaidAt) VALUES
(1, 2,  2, 'John Doe',                NULL,                                    300000.00, 0.00,     360000.00, 0.00,      660000.00,  660000.00,  'Paid', 'Cash',         NULL,             '2026-09-26 11:45:00'),
(2, 3,  3, 'Trần Văn Bình',           'Biên Hòa, Đồng Nai',                    425000.00, 0.00,     135000.00, 110000.00, 560000.00,  450000.00,  'Paid', 'BankTransfer', 'VCB20261012001', '2026-10-12 12:05:00'),
(3, 4,  3, 'Nguyễn Thị Cúc',          'Cần Thơ',                               900000.00, 60000.00, 380000.00, 200000.00, 1340000.00, 1140000.00, 'Paid', 'CreditCard',   'POS-1018-0042',  '2026-10-18 15:10:00'),
(4, 5,  3, 'Phan Văn Hùng',           'Vũng Tàu',                              150000.00, 45000.00, 45000.00,  0.00,      240000.00,  240000.00,  'Paid', 'Cash',         NULL,             '2026-10-21 11:50:00'),
(5, 6,  4, 'Công ty TNHH Minh Phát',  '12 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh', 680000.00, 0.00,    170000.00, 210000.00, 850000.00,  640000.00,  'Paid', 'BankTransfer', 'MP-20261027-01', '2026-10-27 11:40:00'),
(6, 10, 2, 'Võ Thành Long',           'Đà Nẵng',                               300000.00, 0.00,     150000.00, 0.00,      450000.00,  450000.00,  'Paid', 'Cash',         NULL,             '2026-09-12 11:40:00'),
(7, 11, 2, 'Phạm Thị Hoa',            'Hà Nội',                                637500.00, 0.00,     345000.00, 120000.00, 982500.00,  862500.00,  'Paid', 'BankTransfer', 'TCB20260920777', '2026-09-20 11:55:00');
