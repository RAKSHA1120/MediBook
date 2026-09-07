const KEYS = {
  CURRENT_USER: "medibook_current_user",
};

const getStorage = (key, defaultValue = null) => {
  try {
    const item = sessionStorage.getItem(key);
    if (!item || item === "undefined") return defaultValue;
    return JSON.parse(item);
  } catch (error) {
    console.warn(`Error reading sessionStorage for key "${key}":`, error);
    return defaultValue;
  }
};

const setStorage = (key, value) => {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting sessionStorage for key "${key}":`, error);
  }
};

export const getCurrentUser = () => getStorage(KEYS.CURRENT_USER, null);

export const setCurrentUser = (user) => {
  setStorage(KEYS.CURRENT_USER, user);
  window.dispatchEvent(new Event("medibook_current_user_updated"));
};

export const clearCurrentUser = () => {
  sessionStorage.removeItem(KEYS.CURRENT_USER);
  window.dispatchEvent(new Event("medibook_current_user_updated"));
};

export const getCurrentPatient = () => {
  const user = getCurrentUser();
  if (user && user.role?.toLowerCase() === "patient") {
    return user;
  }
  return null;
};

export const getCurrentDoctor = () => {
  const user = getCurrentUser();
  if (user && user.role?.toLowerCase() === "doctor") {
    return user;
  }
  return null;
};
