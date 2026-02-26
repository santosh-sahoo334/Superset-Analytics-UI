/* eslint-disable */
import Cookies from "js-cookie";
import axios from "axios";

const REFRESH_TOKEN = "refresh_token";
const SLUG = "slug";
const SESSION = "session";
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];



const computeExpirationDays = (issueTime, expTime) =>
  (expTime - issueTime) / (60 * 60 * 24);

const parseJWT = (token) => {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join("")
  );
  return JSON.parse(jsonPayload);
};

const setCookies = (access, refresh) => {
  const accessPayload = parseJWT(access);
  const refreshPayload = parseJWT(refresh);
  Cookies.set(REFRESH_TOKEN, refresh, {
    expires: computeExpirationDays(refreshPayload.iat, refreshPayload.exp),
  });
};

const deleteCookies = async () => {
  Cookies.remove(REFRESH_TOKEN, { path: "/", domain: ".teksecur.com" });
  Cookies.remove(REFRESH_TOKEN, { path: "/" });
  Cookies.remove(SLUG, { path: "/", domain: ".teksecur.com" });
  Cookies.remove(SLUG, { path: "/" });
  // NOTE: Do NOT remove the "session" cookie here. That cookie belongs to
  // Superset's Flask backend (HttpOnly, server-managed). Removing it destroys
  // the Superset authentication and triggers a reload loop via SSO re-auth.
};

// const deleteCookies = async () => {
//   Cookies.remove(REFRESH_TOKEN, { path: "/", domain: ".peerislands.io" });
//   Cookies.remove(REFRESH_TOKEN, { path: "/" });
//   Cookies.remove(SLUG, { path: "/", domain: ".peerislands.io" });
//   Cookies.remove(SLUG, { path: "/" });
//   Cookies.remove(SESSION, { path: "/", domain: ".peerislands.io" });
//   Cookies.remove(SESSION, { path: "/" });
// };

const hasTokenExpired = (token) => {
  try {
    if (!token) return true;
    const { exp } = parseJWT(token);
    return Date.now() >= exp * 1000;
  } catch (error) {
    return true;
  }
};

const isCustomerAdmin = (): boolean => {
  try {
    const refreshToken = Cookies.get(REFRESH_TOKEN);
    if (!refreshToken) return false;
    const payload = parseJWT(refreshToken);
    return Array.isArray(payload.role_keys) && payload.role_keys.includes('CustomerAdmin');
  } catch {
    return false;
  }
};

const onAccessTokenRefreshed = (token) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (callback) => {
  refreshSubscribers.push(callback);
};

const refreshAccessToken = async () => {
  const refresh = Cookies.get(REFRESH_TOKEN);
  if (!refresh) {
    // No Budget API refresh token — clear only Budget API cookies.
    // Do NOT redirect to /logout/ as that destroys the Superset session
    // and triggers a full-page reload loop via SSO re-auth.
    deleteCookies();
    return null;
  }

  try {
    const response = await axios.post(
      `${process.env.REACT_APP_CSIGHT_API_URL}/api/v1/security/refresh`,
      { refresh },
      {
        headers: {
          Authorization: `Bearer ${refresh}`,
        },
      }
    );

    const newAccessToken = response.data.access_token;
    setCookies(newAccessToken, refresh);
    onAccessTokenRefreshed(newAccessToken);
    return newAccessToken;
  } catch (error) {
    // Budget API refresh failed — clear only Budget API cookies.
    // Do NOT redirect; let the calling code handle the failure gracefully.
    deleteCookies();
    return null;
  } finally {
    isRefreshing = false;
  }
};

const RAG_HTTP = axios.create({
  baseURL: `${process.env.REACT_APP_CSIGHT_API_URL}`,
});

const HTTP = axios.create({
  baseURL: `${process.env.REACT_APP_CSIGHT_API_URL}/api/v1`,
});

HTTP.interceptors.request.use(
  async (config) => {
    const accessToken = config?.headers?.Authorization;
    // Check and potentially refresh the access token if expired
    if (hasTokenExpired(accessToken)) {
      if (!isRefreshing) {
        isRefreshing = true;
        const newAccessToken = await refreshAccessToken();
        config.headers["Authorization"] = `Bearer ${newAccessToken}`;
      } else {
        return new Promise((resolve) => {
          addRefreshSubscriber((token) => {
            config.headers["Authorization"] = `Bearer ${token}`;
            resolve(config);
          });
        });
      }
    } else {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

HTTP.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;

    const status = response?.status || null;
    // Only retry if the response is a 401 error
    if (status === 401 && !config._retry) {
      config._retry = true;
      const newAccessToken = await refreshAccessToken();
      if (newAccessToken) {
        config.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return axios(config);
      }
    }

    return Promise.reject(error);
  }
);

const DWORKS_HTTP = axios.create({
  baseURL: `${process.env.REACT_APP_DWORKS_BASE_URL}/api/v1/`,
  headers: {
    'X-API-Key': `${process.env.REACT_APP_DWORKS_API_KEY}`,
    'Content-Type': 'application/json',
  }
});

export {
  RAG_HTTP,
  DWORKS_HTTP,
  HTTP,
  REFRESH_TOKEN,
  SLUG,
  SESSION,
  Cookies,
  setCookies,
  deleteCookies,
  parseJWT,
  refreshAccessToken,
  hasTokenExpired,
  isCustomerAdmin,
};
