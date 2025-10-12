import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './toast.css';

// Custom toast styles
const toastOptions = {
    className: 'font-medium',
    bodyClassName: "text-sm",
    style: {
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
    },
    hideProgressBar: false,
    autoClose: 5000, // 5 seconds duration for all toasts
};

export const showToast = {
    success: (message) => {
        toast.success(message, toastOptions);
    },
    error: (message) => {
        toast.error(message, toastOptions);
    },
    warning: (message) => {
        toast.warning(message, toastOptions);
    },
    info: (message) => {
        toast.info(message, toastOptions);
    },
    loading: (message) => {
        return toast.loading(message, toastOptions);
    },
    // Update an existing toast
    update: (toastId, message, type = 'default') => {
        toast.update(toastId, {
            render: message,
            type: type,
            isLoading: false
        });
    },
    // Dismiss a specific toast
    dismiss: (toastId) => {
        toast.dismiss(toastId);
    },
    // Dismiss all toasts
    dismissAll: () => {
        toast.dismiss();
    }
};