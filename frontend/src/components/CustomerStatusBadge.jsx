import { customerStatusColors } from '../utils/customerUtils';

function CustomerStatusBadge({ status, className = '' }) {
  return (
    <span
      className={`inline-flex min-h-6 items-center justify-center whitespace-nowrap rounded-full px-[10px] py-[2px] text-sm text-white ${className}`}
      style={{ backgroundColor: customerStatusColors[status] }}
    >
      {status}
    </span>
  );
}

export default CustomerStatusBadge;
