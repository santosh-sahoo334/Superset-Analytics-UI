/* eslint-disable */
// @ts-nocheck
import React, { useContext, useEffect, useState, useMemo } from 'react'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SlidersOutlined,
  SettingOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  DashboardOutlined,
  MoneyCollectOutlined,
  DollarOutlined,
  TagsOutlined,
  EyeOutlined,
  AlertOutlined,
  LikeOutlined,
  SafetyCertificateOutlined,
  CalculatorOutlined,
  DesktopOutlined,
  ExperimentOutlined,
  CalculatorOutlined,
  DeploymentUnitOutlined,
  ReconciliationOutlined,
  CloseOutlined,
  FileExcelOutlined
} from '@ant-design/icons'
import { Layout, Menu, Button, Drawer, Dropdown, Space } from 'antd'
import { useMediaQuery } from 'react-responsive'
import { MenuInfo } from 'rc-menu/lib/interface'
// import './MainLayout.css'
import ScrollButtons from 'src/components/ScrollButtons'
import { LayoutContext } from 'src/layout/context/layoutcontext'
import { DashboardLayout } from 'src/dashboard/types'
import { RootState } from 'src/dashboard/reducers/types'
import { useSelector } from 'react-redux'
import AppBreadCrumb from 'src/layout/AppBreadCrumb'
import { useAuth } from 'src/components/CsightCommon/context/AuthContext'
import { isCustomerAdmin } from 'src/components/CsightCommon/config/http-common'
import ChatBot from "src/components/CsightChatbot";
import { useAIBotContext } from "src/components/CsightChatbot/Context";
import { LayoutDashboard, CircleDollarSign, LayoutList, FileText, Tag, Eye, ChartNetwork, ThumbsUp, Building2, FileSpreadsheet, Boxes, Combine, Leaf, LayoutPanelTop } from 'lucide-react';
// import hamburgerIcon from '../../../src/assets/images/icons/hamburger.svg'
import { v4 as uuidv4 } from "uuid";
import * as LucideIcons from 'lucide-react';
import { Header, Content, Sider } from 'antd'
import {
  FeatureFlag,
  isFeatureEnabled
} from '@superset-ui/core';
import { useHistory } from 'react-router-dom';


import getBootstrapData from 'src/utils/getBootstrapData'

const bootstrapData = getBootstrapData();
const userEmail = bootstrapData?.user?.username || null;
const adminList = process.env.ADMIN_EMAIL || [];

// Conditionally import CSS only for non-admin users
if (userEmail && !adminList?.includes(userEmail)) {
  import('./MainLayout.css');
}


interface MainLayoutProps {
  children: React.ReactNode
}

import { questionsList } from "src/components/CsightChatbot/Component/FlashCard";
import React from 'react'
import ExcelExportModal from 'src/dashboard/components/menu/DownloadMenuItems/ExcelExportModal';

// Add interface for menu config
interface MenuItemConfig {
  id: string;
  name: string;
  group?: string | null;
  icon: string;
  redirectTab: boolean;
  replaceName?: string;
  parent?: string;
  order: number;
  showLine?: boolean;
}

// Replace the separate imports with Layout components accessed through Layout
const { Header: AntHeader, Content: AntContent, Sider: AntSider } = Layout;

export default function MainLayoutCsight({ children }: MainLayoutProps) {
  const [collapsed, setCollapsed] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openKeys, setOpenKeys] = useState<string[]>([])
  const [showExcelModal, setShowExcelModal] = useState(false)
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const navigate = useHistory();

  const { setPrompts } = useAIBotContext();
  const userIsCustomerAdmin = useMemo(() => isCustomerAdmin(), []);

  const dashboardLayout = useSelector<RootState, DashboardLayout>(
    state => state.dashboardLayout.present,
  );

useEffect(() => {
  if(dashboardLayout){
    const hideTabNavigation = () => {
      const tabValues = Object.keys(dashboardLayout)
        .filter(key => {
          const parents = dashboardLayout[key]?.parents;
          return key.startsWith('TABS') && 
                 Array.isArray(parents) && 
                 parents.length === 2 &&
                 parents.includes('ROOT_ID') && 
                 parents.includes('GRID_ID');
        });
      const tabsElement = document.getElementById(tabValues?.[0]);
      if (tabsElement) {
        // Find all tab nav elements within this TABS container
        const tabNavs = tabsElement.querySelectorAll('[role="tablist"].ant-tabs-nav');
        
        // Only hide the first tab nav if it exists
        if (tabNavs?.length > 0) {
          const firstTabNav = tabNavs[0] as HTMLElement;
          if (firstTabNav) {
            firstTabNav.style.display = 'none';
          }
        }
      }
    };

    // Run initially
    hideTabNavigation();
    
    // Set up a MutationObserver to handle dynamically loaded tabs
    const observer = new MutationObserver(() => {
      hideTabNavigation();
    });

    observer.observe(document.body, { 
      childList: true, 
      subtree: true 
    });

    // Clean up observer on component unmount
    return () => {
      observer.disconnect();
    };
  }
  }, [dashboardLayout]);

  const menuConfig: Record<string, MenuItemConfig> = useMemo(() => {
    try {
      const config = typeof process.env.REACT_APP_MENU_CONFIG === 'string' 
        ? JSON.parse(process.env.REACT_APP_MENU_CONFIG)
        : process.env.REACT_APP_MENU_CONFIG || {};

      if (isFeatureEnabled(FeatureFlag.CsightOnpremFlag)) {
        // Ungrouped items at the end
        config.onprem = {
          id: "onprem",
          name: "OnPrem",
          group: null,
          icon: "LayoutPanelTop",
          redirectTab: true,
          order: 13,
          showLine: true
        };
      }

      if (isFeatureEnabled(FeatureFlag.CsightSecurityComplianceFlag)) {
        // Ungrouped items at the end
        config['security-compliance'] = {
          id: "security-compliance",
          name: "Security Compliance",
          group: "OPERATE",
          parent: "governance",
          icon: "Shield",
          redirectTab: true,
          order: 10
        };
      }

      return config;
    } catch (error) {
      console.error('Error parsing REACT_APP_MENU_CONFIG:', error);
      return {};
    }
  }, []);

  const tabRedirectionDetails = Object.values(menuConfig)
    .filter(item => item.redirectTab)
    .map(item => item.replaceName || item.name);

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
    if (dashboardLayout) {
      const tabValues = Object.keys(dashboardLayout)
        .filter(key => key.startsWith('TABS'))
        .map(key => dashboardLayout[key]);
      if (tabValues && tabValues.length > 0 && tabValues[0]?.id) {
        // Find the div element by its id
        const parentElement = document.getElementById(tabValues[0].id);
        if (parentElement) {
          // Find the first child element with role="tablist"
          const tabListElement: any = parentElement.querySelector(":scope > [role='tablist']");
          if (tabListElement) {
            // Hide the tablist element
            tabListElement.style.display = 'none';
          }
        }
      }
    }
  }

  const tabOptionClick = async (itemTab?: any) => {
    // hidTabBar();
    const findTab = findTabIdByName(dashboardLayout, itemTab);
    if (findTab) {
      // Search for the tab element by ID
      const tabElement = document.getElementById(
        `${findTab.parent}-tab-${findTab.id}`
      );

      // Trigger the click event if the element exists
      if (tabElement) {
        tabElement.click();
      }
    }
  }

  const { clickedNavItem, activeNavItem, setActiveNavItem, setClickedNavItem,setPreviousNavItem } = useContext(LayoutContext);

  useEffect(() => {
    if (tabRedirectionDetails.includes(activeNavItem)) {
      setTimeout(() => {
        tabOptionClick(activeNavItem);
      }, 1000);
    }
  }, [activeNavItem]);

  // Add new useEffect for handling budget dropdown
  useEffect(() => {
    if (clickedNavItem === 'Bud vs Act' || clickedNavItem === 'Budget Unit') {
      setOpenKeys(['budget']);
    }
  }, [clickedNavItem]);

  useEffect(() => {
    if (clickedNavItem === 'Cost Compliance' || clickedNavItem === 'Security Compliance') {
      setOpenKeys(['governance']);
    }
  }, [clickedNavItem]);

  const handleMenuClick = (info: MenuInfo) => {
    setPreviousNavItem(clickedNavItem);
    const key: string = info.key.toString();
    setActiveNavItem(menuConfig[key].replaceName || menuConfig[key].name);
    setClickedNavItem(menuConfig[key].name);
    tabOptionClick(menuConfig[key].replaceName || menuConfig[key].name);

    // Only close budget submenu if clicking outside budget section
    if (!key.startsWith('bud-vs-act') && !key.startsWith('budget-unit') && !key.startsWith('budget')) {
      setOpenKeys([]);
    }

    if (isMobile) {
      setMobileOpen(false);
    }

    const contentElement = document.querySelector('.site-content');
    if (contentElement) {
      contentElement.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  const onOpenChange = (keys: string[]) => {
    // Only allow one submenu to be open at a time
    const latestOpenKey = keys.find(key => openKeys.indexOf(key) === -1);
    setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
  };

  const getSelectedKeys = () => {
    const currentKey = Object.keys(menuConfig).find(
      key => menuConfig[key].name === clickedNavItem
    ) ;

    if (collapsed && !isMobile && (currentKey === 'bud-vs-act' || currentKey === 'budget-unit')) {
      return [currentKey, 'budget'];
    }

    return [currentKey];
  };

  // Helper function to get icon component
  const getIcon = (iconName: string, isSelected: boolean, isBudget: boolean = false) => {
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent ? (
      <IconComponent
        size={18}
        strokeWidth={1.5}
        color={isSelected ? '#000' : '#fff'}
        style={{
          marginLeft: `${collapsed ? isBudget ? "10%" : '36%' : '5%'}`
        }}
      />
    ) : null;
  };

  // Modify the groupedMenuItems logic to handle ordering correctly
  const groupedMenuItems = Object.entries(menuConfig).reduce((acc, [key, item]) => {
    // First, sort all items by order number
    const groupKey = item.group || 'ungrouped';
    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }
    acc[groupKey].push({ key, ...item });
    return acc;
  }, {} as Record<string, (MenuItemConfig & { key: string })[]>);

  // Get all menu items in a flat array, sorted by order
  const getAllMenuItemsSorted = () => {
    const allItems = Object.entries(menuConfig).map(([key, item]) => ({
      key,
      ...item,
    }));
    return allItems.sort((a, b) => a.order - b.order);
  };

  const renderMenuItem = (key: string, item: MenuItemConfig) => {
    const isSelected = clickedNavItem === item.name;
    
    if (item.parent === 'budget' || item.parent === 'governance') {
      return (
        <Menu.Item
          key={key}
          className="budget-menu-item"
          icon={getIcon(item.icon, isSelected,true)}
          style={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <span style={{
            color: '#fff',
            paddingBottom: collapsed ? '0' : '15px',
            marginLeft: collapsed ? '0' : '15px',
            marginTop: collapsed ? '0' : '12px'
          }}>
            {item.name}
          </span>
        </Menu.Item>
      );
    }

    return (
      <Menu.Item
        key={key}
        icon={getIcon(item.icon, isSelected)}
      >
        {item.name}
      </Menu.Item>
    );
  };

  const sidebarContent = () => {
    return (
    <Menu
      theme="dark"
      mode="inline"
      selectedKeys={getSelectedKeys()}
      openKeys={openKeys}
      onOpenChange={onOpenChange}
      onClick={handleMenuClick}
      className="custom-sidebar stable-menu"
    >
      {getAllMenuItemsSorted().map(item => {
        // Skip budget items as they'll be handled in their group
        if (item.parent === 'budget') {
          return null;
        }

        // If this is the first item of a group, add the group header
        const prevItem = menuConfig[Object.keys(menuConfig).find(k => 
          menuConfig[k].order === item.order - 1
        ) || ''];
        
        const isFirstInGroup = item.group && (!prevItem || prevItem.group !== item.group);

        return (
          <React.Fragment key={item.key}>
            {(isFirstInGroup || item.showLine) && (
              <hr style={{
                margin: '8px 16px',
                borderColor: 'rgba(255, 255, 255, 0.2)',
                borderStyle: 'solid',
                borderWidth: '0 0 1px 0'
              }} />
            )}
            {isFirstInGroup ? (
              <Menu.ItemGroup title={item.group}>
                {/* Show the first item itself */}
                {item.parent !== 'governance' ? renderMenuItem(item.key, item) : null}
                
                {/* Add budget submenu if we're in OPERATE group */}
                {item.group === 'OPERATE' && (
                  <Menu.SubMenu
                    key="budget"
                    icon={getIcon('FileSpreadsheet', 
                      (clickedNavItem === 'Bud vs Act' || clickedNavItem === 'Budget Unit') && collapsed
                    )}
                    title={<span style={{ color: '#fff' }}>{collapsed ? '' : 'Budget'}</span>}
                    className={`budget-submenu ${
                      (clickedNavItem === 'Bud vs Act' || clickedNavItem === 'Budget Unit') && collapsed 
                        ? 'budget-submenu-selected' 
                        : ''
                    }${!collapsed ? 'custom-sidebar-budget' : ''}`}
                  >
                    {Object.entries(menuConfig)
                      .filter(([, menuItem]) => menuItem.parent === 'budget')
                      .sort(([, itemA], [, itemB]) => itemA.order - itemB.order)
                      .map(([key, menuItem]) => renderMenuItem(key, menuItem))
                    }
                  </Menu.SubMenu>
                )}
                {item.group === 'OPERATE' && (
                  <Menu.SubMenu
                    key="governance"
                    icon={getIcon('Building2', 
                      (clickedNavItem === 'Cost Compliance' || clickedNavItem === 'Security Compliance') && collapsed
                    )}
                    title={<span style={{ color: '#fff' }}>{collapsed ? '' : 'Governance'}</span>}
                    className={`budget-submenu ${
                      (clickedNavItem === 'Cost Compliance' || clickedNavItem === 'Security Compliance') && collapsed 
                        ? 'budget-submenu-selected' 
                        : ''
                    }${!collapsed ? 'custom-sidebar-budget' : ''}`}
                  >
                    {Object.entries(menuConfig)
                      .filter(([, menuItem]) => menuItem.parent === 'governance')
                      .sort(([, itemA], [, itemB]) => itemA.order - itemB.order)
                      .map(([key, menuItem]) => renderMenuItem(key, menuItem))
                    }
                  </Menu.SubMenu>
                )}
              </Menu.ItemGroup>
            ) : (
              item.parent === 'budget' || item.parent === 'governance' ? null : renderMenuItem(item.key, item)
            )}
          </React.Fragment>
        );
      })}
      </Menu>
    )
  }

  const { logout } = useAuth();


  return (
    <Layout style={{ minHeight: '100vh' }} className=''>
      <AntHeader className="app-header">
        <div className="header-left">
          <img
            src="/static/assets/images/layout/images/csight.png"
            alt="Logo"
            className="header-logo"
          />
          <span className="header-title-csight">
            {process.env.REACT_APP_LOGO_TEXT || 'Multi-Cloud FinOps'}
          </span>
          {isMobile && (
            <Button
              type="text"
              icon={<MenuUnfoldOutlined />}
              onClick={() => setMobileOpen(true)}
              className="mobile-trigger"
            />
          )}
          {!isMobile && <AppBreadCrumb />}
        </div>

        <Space size={10} className="header-right">
        <div className="!text-lg font-semibold !text-[#ACAFB7]">
            Welcome, {bootstrapData?.user?.firstName} {bootstrapData?.user?.lastName}
          </div>
          <BellOutlined />
          <SlidersOutlined />
          <Dropdown overlay={(
            <Menu>
              <Menu.Item key="profile" icon={<UserOutlined />} onClick={() => {
                  setActiveNavItem('Profile');
                  setClickedNavItem('Profile');
                  setPreviousNavItem(null);
                  setOpenKeys([]);
              }}>
                Profile
              </Menu.Item>
              {isFeatureEnabled(FeatureFlag.CsightUserManagementFlag) && userIsCustomerAdmin && (
                <Menu.Item key="user-management" icon={<UserOutlined />} onClick={() => {
                    setActiveNavItem('User Management');
                    setClickedNavItem('User Management');
                    setPreviousNavItem(null);
                    setOpenKeys([]);
                }}>
                  User Management
                </Menu.Item>
              )}
              {isFeatureEnabled(FeatureFlag.CsightMultiChartExcelExport) && tabRedirectionDetails.includes(activeNavItem) && (
                <Menu.Item key="multi-chart-export" icon={<FileExcelOutlined />} onClick={() => setShowExcelModal(true)}>
                  Multi Chart Excel Export
                </Menu.Item>
              )}
              <Menu.Divider />
              <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={() => logout()}>
                Logout
              </Menu.Item>
            </Menu>
          )} placement="bottomRight" trigger={['click']}>
            <SettingOutlined />
          </Dropdown>
        </Space>
      </AntHeader>

      {!isMobile ? (
        <AntSider
          trigger={null}
          collapsible
          collapsed={collapsed}
          width={240}
          collapsedWidth={80}
          className="app-sidebar stable-menu"
        >
          {/* collapsed */}
          <div className={`${collapsed ? 'sidebar-trigger-center' : 'sidebar-trigger '}`}>
            {!collapsed && <span className="text-white ml-4 font-semibold">Navigation</span>}
            <img
              src={'/static/assets/images/icons/hamburger.svg'}
              alt="hamburger"
              onClick={() => setCollapsed(!collapsed)}
              className="cursor-pointer mr-4"
            />
          </div>
          {/* <Button
            type="text"
            icon={<img src={'/static/assets/images/icons/hamburger.svg'} alt="hamburger" />}
            onClick={() => setCollapsed(!collapsed)}
            className="sidebar-trigger"
          /> */}
          {sidebarContent()}
        </AntSider>
      ) : (
        <Drawer
          placement="left"
          closable={true}
          onClose={() => setMobileOpen(false)}
          visible={mobileOpen}
          className="mobile-drawer stable-menu"
          width={250}
          maskClosable={false}
          closeIcon={<CloseOutlined style={{ color: '#fff' }} />}  // Add this line to set close icon color
        >
          {sidebarContent()}
        </Drawer>
      )}

      <Layout className={`custom-menu-item site-layout ${collapsed ? 'collapsed' : ''}`}>
        <AntContent className="site-content" style={{ overflow: 'auto', height: 'calc(100vh - 60px)' }}>
          <ScrollButtons />
          {isFeatureEnabled(FeatureFlag.CsightChatbot) && <ChatBot />}
          {children}
        </AntContent>
      </Layout>
      <ExcelExportModal
        show={showExcelModal}
        onHide={() => setShowExcelModal(false)}
      />
    </Layout>
  )
} 