import { FiAlertCircle, FiCheck } from 'react-icons/fi';

function ToastNotification({ message, type = 'error' }) {
  if (!message) {
    return null;
  }

  const isSuccess = type === 'success';
  const Icon = isSuccess ? FiCheck : FiAlertCircle;

  return (
    <div
      role="alert"
      className={`fixed right-4 bottom-6 z-[60] flex max-w-[calc(100vw-2rem)] items-center gap-2 rounded-lg border-[0.5px] bg-white px-4 py-3 shadow-[0_4px_8px_rgba(0,0,0,0.1)] sm:max-w-sm ${
        isSuccess ? 'border-[#16A34A]' : 'border-[#FF3B30]'
      }`}
    >
      <Icon
        aria-hidden="true"
        className={`h-6 w-6 shrink-0 ${
          isSuccess ? 'text-[#2E8B57]' : 'text-[#D9534F]'
        }`}
      />
      <p
        className={`text-xs leading-normal ${
          isSuccess ? 'text-[#2E8B57]' : 'text-[#D9534F]'
        }`}
      >
        {message}
      </p>
    </div>
  );
}

export default ToastNotification;
