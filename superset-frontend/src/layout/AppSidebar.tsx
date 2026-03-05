/* eslint-disable */
// @ts-nocheck
import React from 'react';
import { Link } from "react-router-dom";
import { useContext, useEffect } from "react";
// import { useRouter } from "next/router"; // Import useRouter
import AppMenu from "./AppMenu";
import { LayoutContext } from "./context/layoutcontext";
import { MenuProvider } from "./context/menucontext";

const AppSidebar = (
  props: { sidebarRef: React.RefObject<HTMLDivElement> },
  pathName: any
) => {
  const { setLayoutState, layoutConfig, layoutState } =
    useContext(LayoutContext);

  const anchor = () => {
    setLayoutState((prevLayoutState) => ({
      ...prevLayoutState,
      anchored: !prevLayoutState.anchored,
    }));
  };

  const logoColor = () => {
    let logo: string;

    if (layoutConfig.colorScheme == "light") {
      logo =
        layoutConfig.menuTheme === "white" ||
        layoutConfig.menuTheme === "orange"
          ? "dark"
          : "white";
    } else {
      logo = "dark";
    }
    return logo;
  };

  useEffect(() => {
    return () => {
      resetOverlay();
    };
  }, []);

  const resetOverlay = () => {
    if (layoutState.overlayMenuActive) {
      setLayoutState((prevLayoutState) => ({
        ...prevLayoutState,
        overlayMenuActive: false,
      }));
    }
  };

  let timeout = null;

  const onMouseEnter = () => {
    if (!layoutState.anchored) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      setLayoutState((prevLayoutState) => ({
        ...prevLayoutState,
        sidebarActive: true,
      }));
    }
  };

  const onMouseLeave = () => {
    if (!layoutState.anchored) {
      if (!timeout) {
        timeout = setTimeout(
          () =>
            setLayoutState((prevLayoutState) => ({
              ...prevLayoutState,
              sidebarActive: false,
            })),
          300
        );
      }
    }
  };

  return (
    <>
      <div
        ref={props.sidebarRef}
        className="layout-sidebar"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div className="sidebar-header">
          <Link to="/" className="logo">
            <div className="logo-img">
              <img
                src="/static/assets/images/everyops-logo-for-csight.png"
                style={{ width: "90px", height: "74px" }}
                alt="csight"
              />
            </div>
          </Link>
          <div className="logo-text">
            {process.env.REACT_APP_LOGO_TEXT || "CSight"}
          </div>
        </div>

        <div className="layout-menu-container pl-2 mt-6 overflow-auto">
          <MenuProvider>
            {/* Conditionally render Dashboard link */}

            <AppMenu />
          </MenuProvider>
        </div>
      </div>
    </>
  );
};

export default AppSidebar;
