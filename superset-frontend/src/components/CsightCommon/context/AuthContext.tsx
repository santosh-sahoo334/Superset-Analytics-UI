/* eslint-disable */
// @ts-nocheck
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
  editBudgetUnit?: string | number | null;
  setEditBudgetUnit: React.Dispatch<SetStateAction<string | number | null>>;
  budgetUnitCreate: boolean;
  setBudgetUnitCreate: React.Dispatch<SetStateAction<boolean>>;
  budgetUnitSteps: number;
  setBudgetUnitSteps: React.Dispatch<SetStateAction<number>>;
  budgetUnitData: any;
  setBudgetUnitData: React.Dispatch<SetStateAction<any>>;
  budgetUnitView: boolean;
  setBudgetUnitView: React.Dispatch<SetStateAction<boolean>>;
  budgetData: any;
  setBudgetData: React.Dispatch<SetStateAction<any>>;
  budgetEditView: boolean;
  setBudgetEditView: React.Dispatch<SetStateAction<boolean>>;
  createNewBudget: boolean;
  setCreateNewBudget: React.Dispatch<SetStateAction<boolean>>;
}

const routesWithoutAuth = ["/login"];

const AuthContext = createContext<AuthContextType>({
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
  login: async (_u, _p) => {},
  logout: () => {},
  setIsLoading: () => false,
  editBudgetUnit: null,
  setEditBudgetUnit: () => null,
  budgetUnitCreate: false,
  setBudgetUnitCreate: () => false,
  budgetUnitSteps: 0,
  setBudgetUnitSteps: () => 0,
  budgetUnitData: null,
  setBudgetUnitData: () => null,
  budgetUnitView: false,
  setBudgetUnitView: () => false,
  budgetData: null,
  setBudgetData: () => null,
  budgetEditView: false,
  setBudgetEditView: () => false,
  createNewBudget: false,
  setCreateNewBudget: () => false,
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
  const [editBudgetUnit, setEditBudgetUnit] = useState<string | null>(null);
  const [budgetUnitSteps, setBudgetUnitSteps] = useState<number>(0);  
  const [budgetUnitCreate, setBudgetUnitCreate] = useState<boolean>(false);
  const [budgetUnitData, setBudgetUnitData] = useState<any>(null);
  const [budgetUnitView, setBudgetUnitView] = useState<boolean>(false);
  const [budgetData, setBudgetData] = useState<any>(null);
  const [budgetEditView, setBudgetEditView] = useState<boolean>(false);
  const [createNewBudget, setCreateNewBudget] = useState<boolean>(false);

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
        `${process.env.REACT_APP_CSIGHT_API_URL}/api/v1/security/login`,
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

  // const getAccessToken = async (refresh_page = false) => {
  //   try {
  //     if (refresh_page) {
  //       setIsLoading(true);
  //     }
  //     const access_token = await refreshAccessToken();

  //     if (access_token) {
  //       setAccessToken(access_token);
  //       if (refresh_page) {
  //         history.push(routesWithoutAuth.includes(pathname) ? "/" : pathname || "/");
  //       }
  //       setIsLoading(false);
  //       return;
  //     }
  //     setIsLoading(false);
  //     setAccessToken(null);
  //     deleteCookies();
  //     setTimeout(()=>{
  //       history.replace('/logout');
  //       window.location.reload();
  //     },1000);
  //   } catch (error) {
  //     setIsLoading(false);
  //     setAccessToken(null);
  //     deleteCookies();
  //     setTimeout(()=>{
  //       history.replace('/logout');
  //       window.location.reload();
  //     },1000);
  //   }
  // };

  const logout = () => {
    setAccessToken(null);
    deleteCookies();
    setTimeout(()=>{
      window.location.href = "/logout/";
      // history.replace('/logout/');
      // window.location.reload();
    },1000);

  };

  // const autoRefreshToken = () => {
  //   setInterval(() => {
  //     const refreshToken = Cookies.get(REFRESH_TOKEN);
  //     if (refreshToken) {
  //       getAccessToken();
  //     }
  //   }, 1000 * 60 * 3);
  // };

  // const checkToken = () => {
  //   try {
  //     const oidc_refresh_token = Cookies.get("oidc_refresh_token");
  //     const oidc_access_token = Cookies.get("oidc_access_token");

  //     if (oidc_refresh_token) {
  //       setAccessToken(oidc_access_token);
  //       Cookies.set(REFRESH_TOKEN, oidc_refresh_token);
  //       Cookies.remove("oidc_refresh_token", {
  //         path: "/",
  //       });
  //       Cookies.remove("oidc_access_token", {
  //         path: "/",
  //       });
  //       Cookies.remove("oidc_refresh_token", {
  //         path: "/",
  //         domain: ".teksecur.com",
  //       });
  //       Cookies.remove("oidc_access_token", {
  //         path: "/",
  //         domain: ".teksecur.com",
  //       });
  //     }
  //     const refreshToken = Cookies.get(REFRESH_TOKEN);
  //     if (refreshToken && !hasTokenExpired(refreshToken)) {
  //       getAccessToken(true);
  //       autoRefreshToken();
  //     } else if (routesWithoutAuth.includes(pathname)) {
  //       setIsLoading(false);
  //     } else {
  //       setIsLoading(false);
  //       deleteCookies();
  //       setTimeout(()=>{
  //         window.location.href = "/logout";
  //         window.location.reload();
  //       },1000);
  //     }
  //   } catch (error) {
  //     setIsLoading(false);
  //     deleteCookies();
  //     setTimeout(()=>{
  //       window.location.href = "/logout";
  //       window.location.reload();
  //     },1000);
  //   }
  // };

  // useEffect(() => {
  //   const timeOutId = setTimeout(() => {
  //     checkToken();
  //   }, 1000);

  //   return () => clearTimeout(timeOutId);
  // }, []);

  return {
    isLoading,
    setIsLoading,
    accessToken,
    isAuthenticated,
    login,
    logout,
    editBudgetUnit,
    setEditBudgetUnit,
    budgetUnitCreate,
    setBudgetUnitCreate,
    budgetUnitSteps,
    setBudgetUnitSteps,
    budgetUnitData,
    setBudgetUnitData,
    budgetUnitView,
    setBudgetUnitView,
    budgetData,
    setBudgetData,
    budgetEditView,
    setBudgetEditView,
    createNewBudget,
    setCreateNewBudget,
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
