const db = require('../config/db');

const BOOKING_COLUMNS = `BookingID, UserID, GuestName, GuestPhone, CreatedBy, BookingSource,
  BookingDate, ExpectedCheckIn, ExpectedCheckOut, Status, Deposit, Note`;

// ---------- Các hàm dùng chung cho transaction ----------

// Chạy một nhóm câu lệnh trong MỘT transaction: thành công thì ghi hết, lỗi thì hủy hết
const withTransaction = async (work) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const result = await work(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

const modelError = (code, roomIds) => Object.assign(new Error(code), { code, roomIds });

// Khóa các phòng để hai người thao tác cùng một phòng cùng lúc không đè nhau
const lockRooms = async (conn, roomIds) => {
  const [rooms] = await conn.query(
    'SELECT RoomID, Status FROM Rooms WHERE RoomID IN (?) FOR UPDATE',
    [roomIds]
  );
  return rooms;
};

// Phòng có đơn đã cọc (Confirmed) hoặc đang ở (CheckedIn)
const findConflicts = async (conn, roomIds, from, to, excludeBookingId = 0) => {
  const [rows] = await conn.query(
    `SELECT DISTINCT bd.RoomID
     FROM BookingDetails bd
     JOIN Bookings b ON b.BookingID = bd.BookingID
     WHERE bd.RoomID IN (?)
       AND b.BookingID <> ?
       AND b.Status IN ('Confirmed', 'CheckedIn')
       AND b.ExpectedCheckIn < ?
       AND b.ExpectedCheckOut > ?`,
    [roomIds, excludeBookingId, to, from]
  );
  return rows.map((r) => r.RoomID);
};

// Phòng không tồn tại hoặc đang bảo trì
const missingOrMaintenance = (roomIds, lockedRooms) => {
  const result = new Set(roomIds.filter((id) => !lockedRooms.some((r) => r.RoomID === id)));
  lockedRooms.filter((r) => r.Status === 'Maintenance').forEach((r) => result.add(r.RoomID));
  return result;
};

// Ghi một đơn cùng các phòng
const insertBooking = async (conn, booking, details) => {
  const [result] = await conn.query(
    `INSERT INTO Bookings (UserID, GuestName, GuestPhone, CreatedBy, BookingSource,
                           ExpectedCheckIn, ExpectedCheckOut, Status, Deposit, Note)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      booking.UserID,
      booking.GuestName,
      booking.GuestPhone,
      booking.CreatedBy,
      booking.BookingSource,
      booking.ExpectedCheckIn,
      booking.ExpectedCheckOut,
      booking.Status,
      booking.Deposit,
      booking.Note,
    ]
  );
  const bookingId = result.insertId;

  for (const d of details) {
    const [detailResult] = await conn.query(
      `INSERT INTO BookingDetails (BookingID, RoomID, PriceAtBooking, ActualCheckIn,
                                   AppliedSurchargeRate, AppliedForeignerRate, GuestCount,
                                   HasForeigner, RentalDays, SubTotal, TimeSurcharge)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        bookingId,
        d.RoomID,
        d.PriceAtBooking,
        d.ActualCheckIn ?? null,
        d.AppliedSurchargeRate,
        d.AppliedForeignerRate,
        d.GuestCount,
        d.HasForeigner,
        d.RentalDays,
        d.SubTotal,
        d.TimeSurcharge ?? 0,
      ]
    );
    for (const g of d.Guests || []) {
      await conn.query(
        `INSERT INTO RoomGuests (DetailID, FullName, IdentityNumber, CustomerType, Address)
         VALUES (?, ?, ?, ?, ?)`,
        [detailResult.insertId, g.FullName, g.IdentityNumber, g.CustomerType, g.Address]
      );
    }
  }
  return bookingId;
};

const BookingModel = {
  // Thông tin các phòng
  async getRoomsForBooking(roomIds) {
    const [rows] = await db.query(
      `SELECT r.RoomID, r.RoomNumber, r.Status, rt.RoomTypeID, rt.TypeName,
              rt.BasePrice, rt.StandardGuests, rt.MaxGuests
       FROM Rooms r
       JOIN RoomTypes rt ON rt.RoomTypeID = r.RoomTypeID
       WHERE r.RoomID IN (?)`,
      [roomIds]
    );
    return rows;
  },

  // ĐẶT PHÒNG ONLINE
  async createWithDetails({ booking, details }) {
    return withTransaction(async (conn) => {
      const roomIds = details.map((d) => d.RoomID);
      const locked = await lockRooms(conn, roomIds);
      const unavailable = missingOrMaintenance(roomIds, locked);
      (await findConflicts(conn, roomIds, booking.ExpectedCheckIn, booking.ExpectedCheckOut)).forEach(
        (id) => unavailable.add(id)
      );
      if (unavailable.size > 0) throw modelError('ROOMS_UNAVAILABLE', [...unavailable]);

      return insertBooking(conn, booking, details);
    });
  },

  // LẬP PHIẾU THUÊ cho khách vãng lai
  async createDirect({ booking, details }) {
    return withTransaction(async (conn) => {
      const roomIds = details.map((d) => d.RoomID);
      const locked = await lockRooms(conn, roomIds);
      const notReady = new Set(roomIds.filter((id) => !locked.some((r) => r.RoomID === id)));
      locked.filter((r) => r.Status !== 'Available').forEach((r) => notReady.add(r.RoomID));
      if (notReady.size > 0) throw modelError('ROOMS_NOT_READY', [...notReady]);

      const conflicts = await findConflicts(
        conn,
        roomIds,
        booking.ExpectedCheckIn,
        booking.ExpectedCheckOut
      );
      if (conflicts.length > 0) throw modelError('ROOMS_UNAVAILABLE', conflicts);

      const bookingId = await insertBooking(conn, booking, details);
      await conn.query('UPDATE Rooms SET Status = ? WHERE RoomID IN (?)', ['Occupied', roomIds]);
      return bookingId;
    });
  },

  // XÁC NHẬN CỌC cho đơn đang chờ cọc
  async confirmDeposit(bookingId, deposit) {
    return withTransaction(async (conn) => {
      const [rows] = await conn.query(
        'SELECT Status, ExpectedCheckIn, ExpectedCheckOut FROM Bookings WHERE BookingID = ? FOR UPDATE',
        [bookingId]
      );
      const booking = rows[0];
      if (!booking || booking.Status !== 'Pending') throw modelError('BOOKING_STATE');

      const [details] = await conn.query('SELECT RoomID FROM BookingDetails WHERE BookingID = ?', [
        bookingId,
      ]);
      const roomIds = details.map((d) => d.RoomID);
      const locked = await lockRooms(conn, roomIds);
      const unavailable = missingOrMaintenance(roomIds, locked);
      (
        await findConflicts(conn, roomIds, booking.ExpectedCheckIn, booking.ExpectedCheckOut, bookingId)
      ).forEach((id) => unavailable.add(id));
      if (unavailable.size > 0) throw modelError('ROOMS_UNAVAILABLE', [...unavailable]);

      await conn.query("UPDATE Bookings SET Status = 'Confirmed', Deposit = ? WHERE BookingID = ?", [
        deposit,
        bookingId,
      ]);
    });
  },

  // NHẬN PHÒNG (check-in) cho đơn đã cọc (Confirmed)
  async checkIn(bookingId, rooms) {
    return withTransaction(async (conn) => {
      const [rows] = await conn.query('SELECT Status FROM Bookings WHERE BookingID = ? FOR UPDATE', [
        bookingId,
      ]);
      if (!rows[0] || rows[0].Status !== 'Confirmed') throw modelError('BOOKING_STATE');

      const roomIds = rooms.map((r) => r.RoomID);
      const locked = await lockRooms(conn, roomIds);
      const notReady = roomIds.filter((id) => {
        const room = locked.find((r) => r.RoomID === id);
        return !room || room.Status !== 'Available';
      });
      if (notReady.length > 0) throw modelError('ROOMS_NOT_READY', notReady);

      for (const r of rooms) {
        const [detail] = await conn.query(
          'SELECT DetailID FROM BookingDetails WHERE BookingID = ? AND RoomID = ?',
          [bookingId, r.RoomID]
        );
        const detailId = detail[0].DetailID;
        await conn.query(
          `UPDATE BookingDetails
           SET ActualCheckIn = ?, GuestCount = ?, HasForeigner = ?, SubTotal = ?, TimeSurcharge = ?
           WHERE DetailID = ?`,
          [r.ActualCheckIn, r.GuestCount, r.HasForeigner, r.SubTotal, r.TimeSurcharge, detailId]
        );
        await conn.query('DELETE FROM RoomGuests WHERE DetailID = ?', [detailId]);
        for (const g of r.Guests) {
          await conn.query(
            `INSERT INTO RoomGuests (DetailID, FullName, IdentityNumber, CustomerType, Address)
             VALUES (?, ?, ?, ?, ?)`,
            [detailId, g.FullName, g.IdentityNumber, g.CustomerType, g.Address]
          );
        }
      }
      await conn.query('UPDATE Rooms SET Status = ? WHERE RoomID IN (?)', ['Occupied', roomIds]);
      await conn.query("UPDATE Bookings SET Status = 'CheckedIn' WHERE BookingID = ?", [bookingId]);
    });
  },

  // Một đơn kèm danh sách phòng và khách ở từng phòng
  async getById(id) {
    const [rows] = await db.query(`SELECT ${BOOKING_COLUMNS} FROM Bookings WHERE BookingID = ?`, [
      id,
    ]);
    if (!rows[0]) return null;

    const [details] = await db.query(
      `SELECT bd.DetailID, bd.RoomID, r.RoomNumber, r.RoomTypeID, rt.TypeName,
              bd.PriceAtBooking, bd.AppliedSurchargeRate, bd.AppliedForeignerRate,
              bd.GuestCount, bd.HasForeigner, bd.RentalDays, bd.SubTotal, bd.TimeSurcharge,
              bd.ActualCheckIn, bd.ActualCheckOut
       FROM BookingDetails bd
       JOIN Rooms r ON r.RoomID = bd.RoomID
       JOIN RoomTypes rt ON rt.RoomTypeID = r.RoomTypeID
       WHERE bd.BookingID = ?
       ORDER BY bd.DetailID`,
      [id]
    );
    const [guests] = await db.query(
      `SELECT g.GuestID, g.DetailID, g.FullName, g.IdentityNumber, g.CustomerType, g.Address
       FROM RoomGuests g
       JOIN BookingDetails bd ON bd.DetailID = g.DetailID
       WHERE bd.BookingID = ?
       ORDER BY g.GuestID`,
      [id]
    );
    return {
      ...rows[0],
      Rooms: details.map((d) => ({
        ...d,
        HasForeigner: Boolean(d.HasForeigner),
        Guests: guests.filter((g) => g.DetailID === d.DetailID),
      })),
    };
  },

  // Các đơn của một tài khoản (mới nhất trước)
  async getByUser(userId) {
    const [rows] = await db.query(
      `SELECT b.BookingID, b.GuestName, b.BookingSource, b.BookingDate, b.ExpectedCheckIn,
              b.ExpectedCheckOut, b.Status, b.Deposit,
              COUNT(bd.DetailID) AS RoomCount,
              COALESCE(SUM(bd.SubTotal), 0) AS EstimatedTotal
       FROM Bookings b
       LEFT JOIN BookingDetails bd ON bd.BookingID = b.BookingID
       WHERE b.UserID = ?
       GROUP BY b.BookingID, b.GuestName, b.BookingSource, b.BookingDate,
                b.ExpectedCheckIn, b.ExpectedCheckOut, b.Status, b.Deposit
       ORDER BY b.BookingDate DESC, b.BookingID DESC`,
      [userId]
    );
    return rows;
  },

  // Hủy đơn
  async cancel(id) {
    const [result] = await db.query(
      `UPDATE Bookings SET Status = 'Cancelled'
       WHERE BookingID = ? AND Status IN ('Pending', 'Confirmed')`,
      [id]
    );
    return result.affectedRows > 0;
  },
};

module.exports = BookingModel;