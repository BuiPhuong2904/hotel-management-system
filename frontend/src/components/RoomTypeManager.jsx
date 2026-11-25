import { useEffect, useRef, useState } from 'react';

const button = 'rounded-lg border border-[#DCECF8] px-3 py-2 text-sm font-semibold text-[#075A9C] disabled:opacity-50';
const primary = 'rounded-lg bg-[#075A9C] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50';
const input = 'mt-1 w-full rounded-lg border border-[#DCECF8] p-2 font-normal text-slate-800';

export default function RoomTypeManager({ types, busy, error, clearError, onClose, onSave }) {
  const dialog = useRef(null);
  const [editor, setEditor] = useState(null);
  const [standard, setStandard] = useState(2);

  useEffect(() => {
    const node = dialog.current;
    node.showModal();
    return () => node.close();
  }, []);

  function showList() {
    setEditor(null);
    clearError();
  }

  function openEditor(type) {
    clearError();
    setEditor(type);
    setStandard(type.StandardGuests ?? 2);
  }

  function submit(event) {
    event.preventDefault();
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    onSave(editor.RoomTypeID, fields, showList);
  }

  return (
    <dialog ref={dialog} aria-labelledby="room-types-title"
      onCancel={(event) => { event.preventDefault(); if (!busy) onClose(); }}
      className="fixed inset-0 m-auto max-h-[90dvh] w-[min(94vw,42rem)] overflow-auto rounded-xl bg-white p-6 shadow-xl backdrop:bg-black/35">
      <header className="mb-5 flex items-center justify-between gap-4">
        <h2 id="room-types-title" className="text-xl font-bold text-[#075A9C]">
          {editor ? 'Sửa hạng phòng' : 'Quản lý hạng phòng'}
        </h2>
        <button className={button} disabled={busy} onClick={onClose}>Đóng</button>
      </header>
      {error && <p role="alert" className="mb-3 text-red-700">{error}</p>}
      {editor ? (
        <form onSubmit={submit} className="grid gap-4 text-sm font-semibold text-[#075A9C] sm:grid-cols-2">
          <label>Mã hạng<input className={input} name="RoomTypeID" defaultValue={editor.RoomTypeID}
            disabled={Boolean(editor.RoomTypeID)} required maxLength={10} pattern="[A-Za-z0-9_\-]{1,10}" /></label>
          <label>Tên hạng<input className={input} name="TypeName" defaultValue={editor.TypeName} required maxLength={50} /></label>
          <label>Đơn giá (VNĐ)<input className={input} name="BasePrice" type="number" min="0" max="9999999999"
            step="0.01" required defaultValue={editor.BasePrice} /></label>
          <label>Số khách tiêu chuẩn<input className={input} name="StandardGuests" type="number" min="1"
            required value={standard} onChange={(event) => setStandard(event.target.value)} /></label>
          <label>Số khách tối đa<input className={input} name="MaxGuests" type="number" min={standard || 1}
            defaultValue={editor.MaxGuests ?? 3} required /></label>
          <label className="sm:col-span-2">Ghi chú<textarea className={input} name="Note" maxLength={255}
            defaultValue={editor.Note ?? ''} /></label>
          <div className="flex justify-end gap-2 sm:col-span-2">
            <button type="button" className={button} disabled={busy} onClick={showList}>Hủy</button>
            <button className={primary} disabled={busy}>Lưu hạng phòng</button>
          </div>
        </form>
      ) : (
        <>
          <ul className="mt-4 divide-y divide-slate-200">
            {types.map((type) => (
              <li key={type.RoomTypeID} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div><strong>{type.TypeName} ({type.RoomTypeID})</strong>
                  <p className="text-sm text-slate-600">{Number(type.BasePrice).toLocaleString('vi-VN')} ₫ · Tối đa {type.MaxGuests} khách · {type.RoomCount} phòng</p>
                </div>
                <div className="flex gap-2">
                  <button className={button} aria-label={`Sửa hạng ${type.RoomTypeID}`} onClick={() => openEditor(type)}>Sửa</button>

                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </dialog>
  );
}
