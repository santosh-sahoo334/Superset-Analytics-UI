/* eslint-disable */
// import Head from "next/head";
import React, { useState,ReactNode,Dispatch,SetStateAction } from "react";

export type ColorScheme = "light" | "dark" | "dim";

/* Exported types */
export type MenuMode =
  | "static"
  | "overlay"
  | "horizontal"
  | "slim"
  | "compact"
  | "reveal"
  | "drawer";

export type LayoutConfig = {
  ripple: boolean;
  inputStyle: string;
  menuMode: MenuMode;
  menuTheme: string;
  colorScheme: ColorScheme;
  theme: string;
  scale: number;
};

export interface Breadcrumb {
  labels?: string[];
  to?: string;
}

export type ChildContainerProps = {
  children: ReactNode;
};

/* Context Types */
export type LayoutState = {
  staticMenuDesktopInactive: boolean;
  overlayMenuActive: boolean;
  rightMenuVisible: boolean;
  overlaySubmenuActive: boolean;
  configSidebarVisible: boolean;
  staticMenuMobileActive: boolean;
  menuHoverActive: boolean;
  searchBarActive: boolean;
  resetMenu: boolean;
  sidebarActive: boolean;
  anchored: boolean;
};

export interface LayoutContextProps {
  layoutConfig: LayoutConfig;
  setLayoutConfig: Dispatch<SetStateAction<LayoutConfig>>;
  layoutState: LayoutState;
  setLayoutState: Dispatch<SetStateAction<LayoutState>>;
  showRightSidebar: () => void;
  onMenuToggle: (event: React.MouseEvent<HTMLButtonElement>) => void;
  isCompact: () => boolean;
  isSlim: () => boolean;
  isHorizontal: () => boolean;
  isDesktop: () => boolean;
  breadcrumbs?: Breadcrumb[];
  setBreadcrumbs: Dispatch<SetStateAction<Breadcrumb[]>>;
  onSearchHide: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  toggleSearch: (event: React.MouseEvent<HTMLAnchorElement>) => void;
  activeNavItem: string;
  setActiveNavItem: Dispatch<SetStateAction<string>>;
  clickedNavItem: string;
  setClickedNavItem: Dispatch<SetStateAction<string>>;
  previousNavItem: string;
  setPreviousNavItem: Dispatch<SetStateAction<string>>;
}

export const LayoutContext = React.createContext({} as LayoutContextProps);

export const LayoutProvider = (props: ChildContainerProps) => {
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([]);
  const [layoutConfig, setLayoutConfig] = useState<LayoutConfig>({
    ripple: false,
    inputStyle: "outlined",
    menuMode: "static",
    menuTheme: "blue",
    colorScheme: "light",
    theme: "blue",
    scale: 14,
  });


  const [activeNavItem, setActiveNavItem] = useState<string>('Dashboard');
  const [clickedNavItem, setClickedNavItem] = useState<string>('Dashboard');
  const [previousNavItem, setPreviousNavItem] = useState<string>(null);

  const [layoutState, setLayoutState] = useState({
    staticMenuDesktopInactive: false,
    overlayMenuActive: false,
    overlaySubmenuActive: false,
    rightMenuVisible: false,
    configSidebarVisible: false,
    staticMenuMobileActive: false,
    menuHoverActive: false,
    searchBarActive: false,
    resetMenu: false,
    sidebarActive: false,
    anchored: false,
  });

  const onMenuToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (isOverlay()) {
      setLayoutState((prevLayoutState) => ({
        ...prevLayoutState,
        overlayMenuActive: !prevLayoutState.overlayMenuActive,
      }));
    }
    if (isDesktop()) {
      setLayoutState((prevLayoutState) => ({
        ...prevLayoutState,
        staticMenuDesktopInactive: !prevLayoutState.staticMenuDesktopInactive,
      }));
    } else {
      setLayoutState((prevLayoutState) => ({
        ...prevLayoutState,
        staticMenuMobileActive: !prevLayoutState.staticMenuMobileActive,
      }));

      event.preventDefault();
    }
  };

  const hideOverlayMenu = () => {
    setLayoutState((prevLayoutState) => ({
      ...prevLayoutState,
      overlayMenuActive: false,
      staticMenuMobileActive: false,
    }));
  };

  const toggleSearch = () => {
    setLayoutState((prevLayoutState) => ({
      ...prevLayoutState,
      searchBarActive: !layoutState.searchBarActive,
    }));
  };

  const onSearchHide = () => {
    setLayoutState((prevLayoutState) => ({
      ...prevLayoutState,
      searchBarActive: false,
    }));
  };

  const showRightSidebar = () => {
    setLayoutState((prevLayoutState) => ({
      ...prevLayoutState,
      rightMenuVisible: true,
    }));
    hideOverlayMenu();
  };

  const isOverlay = () => {
    return layoutConfig.menuMode === "overlay";
  };

  const isSlim = () => {
    return layoutConfig.menuMode === "slim";
  };

  const isCompact = () => {
    return layoutConfig.menuMode === "compact";
  };

  const isHorizontal = () => {
    return layoutConfig.menuMode === "horizontal";
  };

  const isDesktop = () => {
    return window.innerWidth > 991;
  };

  const value = {
    layoutConfig,
    setLayoutConfig,
    layoutState,
    setLayoutState,
    isSlim,
    isCompact,
    isHorizontal,
    isDesktop,
    onMenuToggle,
    toggleSearch,
    onSearchHide,
    showRightSidebar,
    breadcrumbs,
    setBreadcrumbs,
    activeNavItem,
    setActiveNavItem,
    clickedNavItem,
    setClickedNavItem,
    previousNavItem,
    setPreviousNavItem
  };

  return (
    <LayoutContext.Provider value={value}>
      <>
        <head>
          <title>CSIGHT</title>
          <meta charSet="UTF-8" />
          <meta
            name="description"
            content="The ultimate collection of design-agnostic, flexible and accessible React UI Components."
          />
          <meta name="robots" content="index, follow" />
          <meta name="viewport" content="initial-scale=1, width=device-width" />
          <meta property="og:type" content="website"></meta>
          <meta
            property="og:title"
            content="Diamond by PrimeReact for NextJS"
          ></meta>
          <meta
            property="og:url"
            content="https://diamond.primereact.org"
          ></meta>
          <meta
            property="og:description"
            content="The ultimate collection of design-agnostic, flexible and accessible React UI Components."
          />
          <meta
            property="og:image"
            content="https://www.primefaces.org/static/social/diamond-react.png"
          ></meta>
          <meta property="og:ttl" content="604800"></meta>
          
          <link
            rel="icon"
            href={`/static/assets/images/everyops-favicon.png`}
            type="image/png"
          ></link>
        </head>
        {props.children}
      </>
    </LayoutContext.Provider>
  );
};
