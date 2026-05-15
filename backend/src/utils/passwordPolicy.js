export const passwordPolicyMessage =
  "Mật khẩu phải có hơn 6 ký tự, gồm ít nhất 1 chữ hoa, 1 chữ thường, 1 chữ số và 1 ký tự đặc biệt";

export const validatePasswordPolicy = (password) => {
  if (typeof password !== "string") return false;

  return (
    password.length > 6 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
};
