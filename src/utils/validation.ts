import Swal from 'sweetalert2';

export const patterns = {
  email: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  name: /^[a-zA-Z\s]+$/,
  phone: /^\d{10}$/,
  cardNumber: /^\d{16}$/,
  cvv: /^\d{3,4}$/,
  zipCode: /^\d{5,6}$/,
  expiryDate: /^(0[1-9]|1[0-2])\/?([0-9]{2})$/
};

export const messages = {
  email: "Please enter a valid email address.",
  password: "Password must be at least 8 characters long, include 1 uppercase, 1 lowercase, 1 number, and 1 special character.",
  name: "Name should only contain letters.",
  phone: "Phone number must be exactly 10 digits.",
  cardNumber: "Card number must be 16 digits.",
  cvv: "CVV must be 3 or 4 digits.",
  zipCode: "ZIP code must be 5 or 6 digits.",
  expiryDate: "Expiry date must be in MM/YY format."
};

export const validate = (value: string, type: keyof typeof patterns): string | null => {
  if (!value) return null;
  if (!patterns[type].test(value)) return messages[type];
  return null;
};

export const showErrorToast = (message: string) => {
  Swal.fire({
    icon: 'error',
    title: 'Validation Error',
    text: message,
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true
  });
};
