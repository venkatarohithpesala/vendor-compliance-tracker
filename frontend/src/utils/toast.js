import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './toast.css';

const toastOptions = {
  bodyClassName: "text-sm",
  hideProgressBar: true,
  autoClose: 4000,
  closeOnClick: true,
  pauseOnHover: false,
  pauseOnFocusLoss: false,
};

export const showToast = {
  success: (message) => toast.success(message, toastOptions),
  error: (message) => toast.error(message, toastOptions),
  warning: (message) => toast.warning(message, toastOptions),
  info: (message) => toast.info(message, toastOptions),
  loading: (message) => toast.loading(message, toastOptions),
  update: (toastId, message, type = 'default') => {
    toast.update(toastId, {
      render: message,
      type,
      isLoading: false,
      ...toastOptions,
    });
  },
  dismiss: (toastId) => toast.dismiss(toastId),
  dismissAll: () => toast.dismiss(),
};
