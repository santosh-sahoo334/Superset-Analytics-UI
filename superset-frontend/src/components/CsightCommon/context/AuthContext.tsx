/* eslint-disable */
import LoadingContainer from "../LoadingContainer";
import {
  deleteCookies,
  hasTokenExpired,
  parseJWT,
  REFRESH_TOKEN,SLUG,SESSION,
  refreshAccessToken,
} from "../config/http-common";
import Cookies from "js-cookie";
import { useLocation, useHistory } from "react-router-dom";
import React, {
  createContext,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";

interface AuthContextType {
  accessToken: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  setIsLoading: React.Dispatch<SetStateAction<boolean>>;
}

const routesWithoutAuth = ["/login"];

const AuthContext = createContext<AuthContextType>({
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
  login: async (_u, _p) => {},
  logout: () => {},
  setIsLoading: () => false,
});

export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within a AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthState = () => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { pathname } = useLocation();
  const history = useHistory(); 

  const isAuthenticated = !!accessToken;

  const computeExpirationDays = (issueTime, expTime) =>
    (expTime - issueTime) / (60 * 60 * 24);

  const setCookies = (access, refresh) => {
    try {
      parseJWT(access);
      const refreshPayload = parseJWT(refresh);
      setAccessToken(access);
      Cookies.set(REFRESH_TOKEN, refresh, {
        expires: computeExpirationDays(refreshPayload.iat, refreshPayload.exp),
      });

      return true;
    } catch (error) {
      return false;
    }
  };

  const login = async (username: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      const loginPayload = {
        password,
        provider: "db",
        refresh: true,
        username,
      };
      

      const loginResponse = await fetch(
        `${process.env.REACT_APP_SUPERSET_BASE_URL}/api/v1/security/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(loginPayload),
        }
      );
      if (!loginResponse.ok) {
        setIsLoading(false);
        throw new Error("Failed to login");
      }
      const { access_token, refresh_token } = await loginResponse.json();
      setIsLoading(false);
      if (access_token) {
        if (setCookies(access_token, refresh_token)) {
          history.push('/');
        }
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Error fetching tokens:", error);
      throw error;
    }
  };

  const getAccessToken = async (refresh_page = false) => {
    try {
      if (refresh_page) {
        setIsLoading(true);
      }
      const access_token = await refreshAccessToken();

      if (access_token) {
        setAccessToken(access_token);
        if (refresh_page) {
          history.push(routesWithoutAuth.includes(pathname) ? "/" : pathname || "/");
        }
        setIsLoading(false);
        return;
      }
      setIsLoading(false);
      setAccessToken(null);
      deleteCookies();
      setTimeout(()=>{
        history.replace('/logout');
        window.location.reload();
      },1000);
    } catch (error) {
      setIsLoading(false);
      setAccessToken(null);
      deleteCookies();
      setTimeout(()=>{
        history.replace('/logout');
        window.location.reload();
      },1000);
    }
  };

  const logout = () => {
    setAccessToken(null);
    deleteCookies();
    setTimeout(()=>{
      history.replace('/logout');
      window.location.reload();
    },1000);
  };

  const autoRefreshToken = () => {
    setInterval(() => {
      const refreshToken = Cookies.get(REFRESH_TOKEN);
      if (refreshToken) {
        getAccessToken();
      }
    }, 1000 * 60 * 3);
  };

  const checkToken = () => {
    try {
      const oidc_refresh_token = Cookies.get("oidc_refresh_token");
      const oidc_access_token = Cookies.get("oidc_access_token");

      if (oidc_refresh_token) {
        setAccessToken(oidc_access_token);
        Cookies.set(REFRESH_TOKEN, oidc_refresh_token);
        Cookies.remove("oidc_refresh_token", {
          path: "/",
          domain: ".teksecur.com",
        });
        Cookies.remove("oidc_access_token", {
          path: "/",
          domain: ".teksecur.com",
        });
      }
      const refreshToken = Cookies.get(REFRESH_TOKEN);
      if (refreshToken && !hasTokenExpired(refreshToken)) {
        getAccessToken(true);
        autoRefreshToken();
      } else if (routesWithoutAuth.includes(pathname)) {
        setIsLoading(false);
      } else {
        setIsLoading(false);
        deleteCookies();
        setTimeout(()=>{
          window.location.href = "/logout";
          window.location.reload();
        },1000);
      }
    } catch (error) {
      setIsLoading(false);
      deleteCookies();
      setTimeout(()=>{
        window.location.href = "/logout";
        window.location.reload();
      },1000);
    }
  };

  useEffect(() => {
    const timeOutId = setTimeout(() => {
      checkToken();
    }, 1000);

    return () => clearTimeout(timeOutId);
  }, []);

  return {
    isLoading,
    setIsLoading,
    accessToken,
    isAuthenticated,
    login,
    logout,
  };
};

export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
  const values = AuthState();
  return (
    <>
      {/* {values?.isLoading && <LoadingContainer />} */}
      <AuthContext.Provider value={values}>{children}</AuthContext.Provider>
    </>
  );
}

export const useAuth = () => useContext(AuthContext);
