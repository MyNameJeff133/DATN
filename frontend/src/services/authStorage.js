const TOKEN_KEY = "token";
const USER_KEY = "user";

const canUseStorage = () => typeof window !== "undefined" && window.localStorage;

export const clearAuthStorage = () => {
  if (!canUseStorage()) return;

  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const getStoredUser = () => {
  if (!canUseStorage()) return null;

  const rawUser = localStorage.getItem(USER_KEY);
  if (!rawUser) return null;

  try {
    const user = JSON.parse(rawUser);
    return user && typeof user === "object" ? user : null;
  } catch {
    return null;
  }
};

export const getStoredToken = () => {
  if (!canUseStorage()) return null;

  const token = localStorage.getItem(TOKEN_KEY);
  const user = getStoredUser();

  if (!token || !user) {
    clearAuthStorage();
    return null;
  }

  return token;
};

export const saveAuthStorage = (token, user) => {
  if (!canUseStorage()) return false;

  if (!token || !user) {
    clearAuthStorage();
    return false;
  }

  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return true;
};

export const syncAuthStorage = () => {
  getStoredToken();
};
