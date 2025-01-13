/* eslint-disable */
// @ts-nocheck
import React, {
  forwardRef,
  useImperativeHandle,
  useContext,
  useRef,
  useState,
} from "react";

import { Link } from "react-router-dom";
import AppBreadCrumb from "./AppBreadCrumb";
import { LayoutContext } from "./context/layoutcontext";
import AppSidebar from "./AppSidebar";
import { Menu } from "primereact/menu";
import "primeicons/primeicons.css";
import {
  LeftOutlined, RightOutlined, BellOutlined,SlidersOutlined, SettingOutlined
} from '@ant-design/icons';
import { useAuth } from "../../src/components/CsightCommon/context/AuthContext";

// import { useRouter } from "next/router";
const AppTopbar = forwardRef(
  (props: { sidebarRef: React.RefObject<HTMLDivElement> }, ref) => {
    const menubuttonRef = useRef(null);
    const { onMenuToggle, showRightSidebar, layoutConfig,layoutState } =
      useContext(LayoutContext);
      const { logout } = useAuth();

    useImperativeHandle(ref, () => ({
      menubutton: menubuttonRef.current,
    }));

    const menuLeft = useRef(null);

    // State to track if the menu is open
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const items = [
      {
        label: "",
        items: [
          {
            label: "Profile",
            icon: "pi pi-user",
          },
          {
            label: "Logout",
            icon: "pi pi-power-off",
            command: () => {
              logout(); // Call the logout function
            },
          },
        ],
      },
    ];

    // Function to toggle the menu
    const toggleMenu = (event:any) => {
      menuLeft?.current?.toggle(event);
      setIsMenuOpen(!isMenuOpen); // Toggle menu state
    };

    // Function to close the menu and reset the icon state
    const onHide = () => {
      setIsMenuOpen(false); // Reset the icon state when menu closes
    };
    

    return (
      <div className="layout-topbar">
        <div className="topbar-left">
          <button
            ref={menubuttonRef}
            type="button"
            className="menu-button p-link"
            onClick={onMenuToggle}
          >
            {
              layoutState?.staticMenuDesktopInactive ?  <RightOutlined  /> : <LeftOutlined/>
            }
           
          </button>

          <Link to="/" className="horizontal-logo">
            <img
              id="logo-horizontal"
              src={`/static/assets/images/layout/images/logo-${
                layoutConfig.menuTheme === "white" ||
                layoutConfig.menuTheme === "orange"
                  ? "dark"
                  : "white"
              }.svg`}
              alt="diamond-layout"
            />
          </Link>

          <span className="topbar-separator"></span>

          <AppBreadCrumb />
          <img
            id="logo-mobile"
            className="mobile-logo"
            src={`/static/assets/images/layout/images/logo-${
              layoutConfig.colorScheme == "light" ? "dark" : "white"
            }.svg`}
            alt="diamond-layout"
          />
        </div>

        <div className="layout-topbar-menu-section">
          <AppSidebar sidebarRef={props.sidebarRef} />
        </div>
        <div className="layout-mask modal-in"></div>

        <div className="topbar-right">
          <ul className="topbar-menu">
            <li>
            
              <BellOutlined
                className="pi pi-bell m-1 p-1 icon-hover"
                style={{ fontSize: "1.6rem", cursor: "pointer" }}
              ></BellOutlined>
            </li>
            <li>
              <SlidersOutlined
                className="pi pi-sliders-h m-1 p-1 icon-hover"
                style={{ fontSize: "1.6rem", cursor: "pointer" }}
              ></SlidersOutlined>
            </li>
            <Menu
              model={items}
              popup
              ref={menuLeft}
              id="popup_menu_left"
              onHide={onHide} // Close handler
              className="custom-menu"
              style={{ width: "10rem" }}
            />

            <li>
              <SettingOutlined
                className={`pi pi-cog m-1 p-1 ${
                  isMenuOpen ? "icon-active" : ""
                } icon-hover`} // Apply active style when the menu is open
                style={{ fontSize: "1.6rem", cursor: "pointer" }}
                onClick={toggleMenu}
                aria-controls="popup_menu_left"
                aria-haspopup
              ></SettingOutlined>
            </li>

            <li className="right-sidebar-item hidden">
              <a onClick={showRightSidebar}>
                <i className="pi pi-align-right"></i>
              </a>
            </li>
          </ul>
        </div>
      </div>
    );
  }
);
export default AppTopbar;

AppTopbar.displayName = "AppTopbar";
