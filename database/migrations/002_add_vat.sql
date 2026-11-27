INSERT INTO Settings (SettingKey, SettingValue, Description) VALUES
('VatRate', '0.10', 'Thuế VAT (10%), tính trên tổng hóa đơn sau khi trừ khuyến mãi');

ALTER TABLE Invoices
    ADD COLUMN VatRate DECIMAL(5, 4) NOT NULL DEFAULT 0.0000,
    ADD COLUMN VatAmount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    ADD CONSTRAINT CHK_Invoices_Vat CHECK (VatAmount >= 0);