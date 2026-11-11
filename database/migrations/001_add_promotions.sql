CREATE TABLE Promotions (
    PromoID INT AUTO_INCREMENT PRIMARY KEY,
    PromoCode VARCHAR(30) NOT NULL UNIQUE,
    DiscountPercent DECIMAL(5, 2) NOT NULL,
    MaxDiscountAmount DECIMAL(12, 2) NOT NULL,
    StartDate DATETIME NOT NULL,
    EndDate DATETIME NOT NULL,
    Status ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
    Note VARCHAR(255) NULL,
    CONSTRAINT CHK_Promotions_Percent CHECK (DiscountPercent > 0 AND DiscountPercent <= 100),
    CONSTRAINT CHK_Promotions_Max CHECK (MaxDiscountAmount >= 0),
    CONSTRAINT CHK_Promotions_Dates CHECK (EndDate > StartDate)
) ENGINE=InnoDB;

ALTER TABLE Bookings
    ADD COLUMN PromoID INT NULL,
    ADD CONSTRAINT FK_Bookings_Promotions FOREIGN KEY (PromoID)
        REFERENCES Promotions(PromoID) ON DELETE SET NULL;

-- Số tiền giảm thực tế đã trừ khi lập hóa đơn
ALTER TABLE Invoices
    ADD COLUMN DiscountAmount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    ADD CONSTRAINT CHK_Invoices_Discount CHECK (DiscountAmount >= 0);

-- Dữ liệu mẫu
INSERT INTO Promotions (PromoCode, DiscountPercent, MaxDiscountAmount, StartDate, EndDate, Status, Note) VALUES
('SUMMER26', 10.00, 500000.00, '2026-06-01 00:00:00', '2026-08-31 23:59:59', 'Active', 'Khuyến mãi hè 2026'),
('VIP10',    10.00, 200000.00, '2026-11-01 00:00:00', '2026-12-31 23:59:59', 'Active', 'Ưu đãi khách thân thiết');