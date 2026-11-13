import PromotionFormModal from './PromotionFormModal';

function AddPromotionModal({ promotions, onClose, onCreate }) {
  return (
    <PromotionFormModal
      title="Thêm Mã Khuyến Mãi Mới"
      submitLabel="Tạo mã mới"
      existingPromotions={promotions}
      onClose={onClose}
      onSubmit={onCreate}
      mode="add"
    />
  );
}

export default AddPromotionModal;
