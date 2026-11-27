ALTER TABLE Promotions
    ADD COLUMN UsageLimit INT UNSIGNED NULL DEFAULT NULL,
    ADD CONSTRAINT CHK_Promotions_UsageLimit CHECK (UsageLimit IS NULL OR UsageLimit > 0);
