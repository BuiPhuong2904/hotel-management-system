import PromotionFormModal from './PromotionFormModal';

function EditPromotionModal({ promotion, promotions, onClose, onSave }) {
  if (!promotion) {
    return null;
  }

  return (
    <PromotionFormModal
      title="Chỉnh Sửa Mã Khuyến Mãi"
      submitLabel="Lưu thay đổi"
      initialValues={promotion}
      existingPromotions={promotions.filter((item) => item.id !== promotion.id)}
      onClose={onClose}
      onSubmit={onSave}
      mode="edit"
    />
  );
}

export default EditPromotionModal;
