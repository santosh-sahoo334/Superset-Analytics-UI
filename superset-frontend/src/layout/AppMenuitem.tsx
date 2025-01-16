/* eslint-disable */
// @ts-nocheck
import React from "react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
// import { useLocation, useSearchParams, useNavigate } from "react-router-dom";
import { Ripple } from "primereact/ripple";
import { classNames } from "primereact/utils";
import { useContext, useEffect, useRef, useState } from "react";
import { LayoutContext } from "./context/layoutcontext";
import { MenuContext } from "./context/menucontext";
import { useSubmenuOverlayPosition } from "./hooks/useSubmenuOverlayPosition";
import { AppMenuItemProps } from "../types/layout";
import {
  DownOutlined
} from '@ant-design/icons';
import {  useSelector } from 'react-redux';
import {
  DashboardLayout,
  RootState,
} from 'src/dashboard/types';

// import { useDashboardActiveNavItem } from 'src/dashboard/containers/DashboardPage';



const AppMenuitem = (props: AppMenuItemProps) => {
  const { activeMenu, setActiveMenu } = useContext(MenuContext);
  const {
    isSlim,
    isCompact,
    isHorizontal,
    isDesktop,
    setLayoutState,
    layoutState,
    layoutConfig,
  } = useContext(LayoutContext);
  // const navigate = useNavigate();
  // const searchParams = useSearchParams();
  const { search } = useLocation();
  const { pathname } = useLocation();
  const submenuRef = useRef(null);
  const menuitemRef = useRef(null);
  const item = props.item;
  const key = props.parentKey
    ? props.parentKey + "-" + props.index
    : String(props.index);
  const isActiveRoute = item.to && pathname === item.to;
  const nonClickableItems = ["Observe", "Optimize", "Operate", "Budget"];
  const paddedItems = ["Observe", "Optimize", "Operate"];
  const isPadded = paddedItems.includes(item.label);
  const isHoverable = !nonClickableItems.includes(item.label);

  const active =
    activeMenu === key || !!(activeMenu && activeMenu.startsWith(key + "-"));

  const dashboardLayout = useSelector<RootState, DashboardLayout>(
    state => state.dashboardLayout.present,
  );

  const { clickedNavItem,activeNavItem, setActiveNavItem,setClickedNavItem } = useContext(LayoutContext);

  const tabRedirectionDetails = [
    'Cost',
    'Utilization',
    'Tags',
    'Billing Plans',
    'Observability',
    'Anomaly',
    'Recommendations',
    'Governance',
    'Executive Report',
    'Budget vs Actuals',
    'OnPrem',
    'GreenOps'
  ]

  useEffect(() => {
    if(tabRedirectionDetails.includes(activeNavItem)){
      setTimeout(() => {
        tabOptionClick(activeNavItem);
      }, 1000);
    }
  }, [activeNavItem]);

 
  useSubmenuOverlayPosition({
    target: menuitemRef.current,
    overlay: submenuRef.current,
    container:
      menuitemRef.current &&
      menuitemRef.current.closest(".layout-menu-container"),
    when:
      props.root &&
      active &&
      (isSlim() || isCompact() || isHorizontal()) &&
      isDesktop(),
  });

  useEffect(() => {
    if (layoutState.resetMenu) {
      setActiveMenu("");
      setLayoutState((prevLayoutState) => ({
        ...prevLayoutState,
        resetMenu: false,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layoutState]);

  useEffect(() => {
    if (!(isSlim() || isHorizontal() || isCompact()) && isActiveRoute) {
      setActiveMenu(key);
    }
  }, [layoutConfig]);



  useEffect(() => {
    // const url = pathname + searchParams.toString();

    // const onRouteChange = (url) => {
    //   if (
    //     !(isSlim() || isHorizontal() || isCompact()) &&
    //     item.to &&
    //     item.to === url
    //   ) {
    //     setActiveMenu(key);
    //   }
    // };
    // onRouteChange(url);

  }, [pathname]);



  function findTabIdByName(data: Record<string, any>, tabName: string): { id: string; parent: string } | null {
    for (const key in data) {
      // Check if the key starts with "TAB-"
      if (key.startsWith("TAB-")) {
        const tab = data[key];
        // Check if `meta.text` matches `tabName`
        if (tab.meta?.text === tabName) {
          // Check if any item in `parents` starts with "TABS-"
          const parentTab = tab.parents.find((parent: string) => parent.startsWith("TABS-"));
          if (parentTab) {
            return { id: tab.id, parent: parentTab };
          }
        }
      }
    }
    return null;
  }

  const hidTabBar = () => {
    if(dashboardLayout){
      const tabValues = Object.keys(dashboardLayout)
      .filter(key => key.startsWith('TABS')) 
      .map(key => dashboardLayout[key]);  
      if(tabValues && tabValues.length>0 && tabValues[0]?.id){
        // Find the div element by its id
        const parentElement = document.getElementById(tabValues[0].id);
        if (parentElement) {
          // Find the first child element with role="tablist"
          const tabListElement = parentElement.querySelector(":scope > [role='tablist']");
          if (tabListElement) {
            // Hide the tablist element
            tabListElement.style.display = 'none';
          } 
        } 
      }
    }
  }


  const tabOptionClick = async(itemTab?:any) => {
    hidTabBar();
    const findTab = findTabIdByName(dashboardLayout, itemTab || item.tabName);
    if(findTab){
        // Search for the tab element by ID
      const tabElement = document.getElementById(
        `${findTab.parent}-tab-${findTab.id}`
      );

      // Trigger the click event if the element exists
      if (tabElement) {
        tabElement.click();
      } else {
        console.error("Tab element not found!");
      }
    }
  }



  const itemClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    //avoid processing disabled items
    if (item.disabled) {
      event.preventDefault();
      return;
    }

    tabOptionClick();
    event.preventDefault();

    // navigate with hover
    if (props.root && (isSlim() || isHorizontal() || isCompact())) {
      const isSubmenu =
        event.currentTarget.closest(
          ".layout-root-menuitem.active-menuitem > ul"
        ) !== null;
      if (isSubmenu)
        setLayoutState((prevLayoutState) => ({
          ...prevLayoutState,
          menuHoverActive: true,
        }));
      else
        setLayoutState((prevLayoutState) => ({
          ...prevLayoutState,
          menuHoverActive: !prevLayoutState.menuHoverActive,
        }));
    }

    //execute command
    if (item.command) {
      item.command({ originalEvent: event, item: item });
    }

    // toggle active state
    if (item.items) {
      setActiveMenu(active ? props.parentKey : key);

      if (
        props.root &&
        !active &&
        (isSlim() || isHorizontal() || isCompact())
      ) {
        setLayoutState((prevLayoutState) => ({
          ...prevLayoutState,
          overlaySubmenuActive: true,
        }));
      }
    } else {
      if (!isDesktop()) {
        setLayoutState((prevLayoutState) => ({
          ...prevLayoutState,
          staticMenuMobileActive: !prevLayoutState.staticMenuMobileActive,
        }));
      }

      if (isSlim() || isHorizontal() || isCompact()) {
        setLayoutState((prevLayoutState) => ({
          ...prevLayoutState,
          menuHoverActive: false,
        }));
      }

      setActiveMenu(key);
    }
  };

  const onMouseEnter = () => {
    // activate item on hover
    if (
      props.root &&
      (isSlim() || isHorizontal() || isCompact()) &&
      isDesktop()
    ) {
      if (!active && layoutState.menuHoverActive) {
        setActiveMenu(key);
      }
    }
  };

  const subMenu =
    item.items && item.visible !== false ? (
      <ul ref={submenuRef}>
        {item.items.map((child, i) => {
          return (
            <AppMenuitem
              item={child}
              index={i}
              className={child.badgeClass}
              parentKey={key}
              key={child.label}
            />
          );
        })}
      </ul>
    ) : null;

  return (
    <div
      className={`${isHoverable ? "menu-item-hover" : ""} ${
        isActiveRoute ? "active-menu-item" : ""
      } ${isPadded ? "menu-item-padded" : ""}`}
    >
      <li
        ref={menuitemRef}
        className={classNames({
          "layout-root-menuitem": props.root,
          "active-menuitem": active,
        })}
      >
        {props.root && item.visible !== false   && (
          <>
            {nonClickableItems.includes(item.label) && !item?.tabName ? (
              <div className="flex flex-col justify-content-start items-center">
                {item.image && (
                  <div className="flex px-2 align-items-center">
                    {" "}
                    <img
                      src={`${item.image}`}
                      alt={item.label}
                      width={25}
                      height={25}
                    />
                  </div>
                )}
                <div className="layout-menuitem-root-text py-2 flex align-items-center">
                  {" "}
                  {item.label}
                </div>
              </div>
            ) : (
              <Link
                to={`${item.to || "#"}`}
                onClick={(e) => {
                 // navigate(`${item.to || "#"}`);
                 if(item?.tabName){
                  setClickedNavItem(item?.label || '');
                  setActiveNavItem(item?.tabName || '');
                  itemClick(e);
                 }else {
                  setActiveNavItem(item?.label || '');
                  setClickedNavItem(item?.label || '');
                 }
                }}
                className={`flex flex-col ${
                  item.label === clickedNavItem ? 'selected' : ''
                }`}
              >
                {item.image && (
                  <div className="cursor-pointer flex pl-3 pr-2 align-items-center">
                    <img
                      src={`${item.image}`}
                      alt={item.label}
                      width={25}
                      height={25}
                    />
                  </div>
                )}
                <div 
                  className={`layout-menuitem-root-text py-2 cursor-pointer flex align-items-center`}
                >
                  {item.label}
                </div>
              </Link>
            )}
          </>
        )}
        {( item.items) && item.visible !== false ? (
          <>
            <a
              href={item.url}
              onClick={(e) => itemClick(e)}
              className={classNames(item.class, "p-ripple tooltip-target")}
              target={item.target}
              data-pr-tooltip={item.label}
              data-pr-disabled={
                !(isSlim() && props.root && !layoutState.menuHoverActive)
              }
              tabIndex={0}
              onMouseEnter={onMouseEnter}
            >
              {item.icon}
              <span className="layout-menuitem-text">{item.label}</span>
              {item.items && (
                <DownOutlined  className="pi pi-fw pi-angle-down layout-submenu-toggler"></DownOutlined>
              )}
              <Ripple />
            </a>
          </>
        ) : null}

        { !item.items && item.visible !== false ? (
          <div className={`${item.label === clickedNavItem ? 'selected' : ''}`}>
            <Link
              to={{
                pathname: item.to,
              }}
              replace={item.replaceUrl}
              onClick={(e) => {
                setClickedNavItem(item?.label || '');
                setActiveNavItem(item?.tabName || '');
                itemClick(e);
              }}
              className={classNames(
                item.class,
                "p-ripple",
                {
                  "active-route": isActiveRoute,
                },
                item?.className || ""
              )}
              tabIndex={0}
              onMouseEnter={onMouseEnter}
            >
              <i className={classNames("layout-menuitem-icon", )}></i>
              {item.image && (
                <div className="flex align-items-center mr-2">
                  <img
                    src={`${item.image}`}
                    alt={item.label}
                    width={18}
                    height={18}
                  />
                </div>
              )}
              <span className="layout-menuitem-text">{item.label}</span>
              {item.items && (
                <DownOutlined className="pi pi-fw pi-angle-down layout-submenu-toggler"></DownOutlined>
              )}
              <Ripple />
            </Link>
          </div>
        ) : null}
        {subMenu}
      </li>
    </div>
  );
};

export default AppMenuitem;
