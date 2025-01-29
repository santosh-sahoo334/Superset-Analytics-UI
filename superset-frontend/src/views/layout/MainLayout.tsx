/* eslint-disable */
// @ts-nocheck
import React, { useContext, useEffect, useState } from 'react'
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
  CloseOutlined
} from '@ant-design/icons'
import { Layout, Menu, Button, Drawer, Dropdown, Space } from 'antd'
import { useMediaQuery } from 'react-responsive'
import { MenuInfo } from 'rc-menu/lib/interface'
import './MainLayout.css'
import ScrollButtons from 'src/components/ScrollButtons'
import { LayoutContext } from 'src/layout/context/layoutcontext'
import { DashboardLayout } from 'src/dashboard/types'
import { RootState } from 'src/dashboard/reducers/types'
import { useSelector } from 'react-redux'
import AppBreadCrumb from 'src/layout/AppBreadCrumb'
import { useAuth } from 'src/components/CsightCommon/context/AuthContext'
import ChatBot from "src/components/CsightChatbot";
import { useAIBotContext } from "src/components/CsightChatbot/Context";
import { LayoutDashboard, CircleDollarSign, LayoutList, FileText, Tag, Eye, ChartNetwork, ThumbsUp, Building2, FileSpreadsheet, Boxes, Combine, Leaf, LayoutPanelTop } from 'lucide-react';
// import hamburgerIcon from '../../../src/assets/images/icons/hamburger.svg'
import { v4 as uuidv4 } from "uuid";
const { Header, Sider, Content } = Layout

interface MainLayoutProps {
  children: React.ReactNode
}

import { questionsList } from "src/components/CsightChatbot/Component/FlashCard";

export default function MainLayoutCsight({ children }: MainLayoutProps) {
  const [collapsed, setCollapsed] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openKeys, setOpenKeys] = useState<string[]>([])
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const { setPrompts } = useAIBotContext();

  const dashboardLayout = useSelector<RootState, DashboardLayout>(
    state => state.dashboardLayout.present,
  );


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
  ];

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
    hidTabBar();
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

  const navItems: any = {
    dashboard: { id: 'dashboard', name: 'Dashboard' },
    onprem: { id: 'onprem', name: 'OnPrem' },
    cost: { id: 'cost', name: 'Cost' },
    utilization: { id: 'utilization', name: 'Utilization' },
    billing: { id: 'billing', name: 'Billing', replaceName: 'Billing Plans' },
    tags: { id: 'tags', name: 'Tags' },
    observability: { id: 'observability', name: 'Observability' },
    anomaly: { id: 'anomaly', name: 'Anomaly', replaceName: 'Tags' },
    recommendations: { id: 'recommendations', name: 'Recommendations' },
    governance: { id: 'governance', name: 'Governance', replaceName: 'Executive Report' },//Executive Report
    'bud-vs-act': { id: 'bud-vs-act', name: 'Bud vs Act', replaceName: 'Budget vs Actuals' },
    'budget-unit': { id: 'budget-unit', name: 'Budget Unit' },
    'green-ops': { id: 'green-ops', name: 'GreenOps' }
  }


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

  const handleMenuClick = (info: MenuInfo) => {
    // setFlashCardData([]);
    setPreviousNavItem(clickedNavItem);
    const key: any = info.key.toString();
    setActiveNavItem(navItems[key].replaceName || navItems[key].name);
    setClickedNavItem(navItems[key].name);
    tabOptionClick(navItems[key].replaceName || navItems[key].name);

    // Only close budget submenu if clicking outside budget section
    if (!key.startsWith('bud-vs-act') && !key.startsWith('budget-unit') && !key.startsWith('budget')) {
      setOpenKeys([]);
    }

    // Close mobile drawer when clicking any menu item
    if (isMobile) {
      setMobileOpen(false);
    }

    // Scroll to top on menu item click
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

  // Add helper function to get selected keys
  const getSelectedKeys = () => {
    const currentKey = Object.keys(navItems).find(key => navItems[key].name === clickedNavItem) || 'dashboard';

    // In collapsed mode, if a budget sub-item is selected, also select the budget parent
    if (collapsed && !isMobile && (currentKey === 'bud-vs-act' || currentKey === 'budget-unit')) {
      return [currentKey, 'budget'];
    }

    return [currentKey];
  };


  const sidebarContent = (
    <Menu
      theme="dark"
      mode="inline"
      selectedKeys={getSelectedKeys()}
      openKeys={openKeys}
      onOpenChange={onOpenChange}
      onClick={handleMenuClick}
      className="custom-sidebar stable-menu"
    >
      <Menu.Item
        key="dashboard"
        icon={
          <LayoutDashboard size={18} strokeWidth={1.5} color={clickedNavItem == 'Dashboard' ? '#000' : '#fff'} style={{
            marginLeft: `${collapsed ? '36%' : '5%'}`
          }} />
        }
      >
        Dashboard
      </Menu.Item>

      {/* <hr style={{ 
        margin: '8px 16px',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderStyle: 'solid',
        borderWidth: '0 0 1px 0'
      }} /> */}

      <Menu.ItemGroup key="observe-group" title="OBSERVE">
        <Menu.Item key="cost" icon={
          // <ReconciliationOutlined />
          <CircleDollarSign size={18} strokeWidth={1.5} color={clickedNavItem == 'Cost' ? '#000' : '#fff'} style={{
            marginLeft: `${collapsed ? '36%' : '5%'}`
          }} />
        }>
          Cost
        </Menu.Item>
        <Menu.Item key="utilization" icon={
          <LayoutList size={18} strokeWidth={1.5} color={clickedNavItem == 'Utilization' ? '#000' : '#fff'} style={{
            marginLeft: `${collapsed ? '36%' : '5%'}`
          }} />
        }>
          Utilization
        </Menu.Item>
        <Menu.Item key="billing" icon={
          <FileText size={18} strokeWidth={1.5} color={clickedNavItem == 'Billing' ? '#000' : '#fff'} style={{
            marginLeft: `${collapsed ? '36%' : '5%'}`
          }} />
        }>
          Billing
        </Menu.Item>
        <Menu.Item key="tags" icon={
          <Tag size={18} strokeWidth={1.5} color={clickedNavItem == 'Tags' ? '#000' : '#fff'} style={{
            marginLeft: `${collapsed ? '36%' : '5%'}`
          }} />
        }>
          Tags
        </Menu.Item>
      </Menu.ItemGroup>

      <hr style={{
        margin: '8px 16px',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderStyle: 'solid',
        borderWidth: '0 0 1px 0'
      }} />

      <Menu.ItemGroup key="optimize-group" title="OPTIMIZE">
        <Menu.Item key="observability" icon={
          <Eye size={18} strokeWidth={1.5} color={clickedNavItem == 'Observability' ? '#000' : '#fff'} style={{
            marginLeft: `${collapsed ? '36%' : '5%'}`
          }} />
        }>
          Observability
        </Menu.Item>
        <Menu.Item key="anomaly" icon={
          <ChartNetwork size={18} strokeWidth={1.5} color={clickedNavItem == 'Anomaly' ? '#000' : '#fff'} style={{
            marginLeft: `${collapsed ? '36%' : '5%'}`
          }} />
        }>
          Anomaly
        </Menu.Item>
        <Menu.Item key="recommendations" icon={
          <ThumbsUp size={18} strokeWidth={1.5} color={clickedNavItem == 'Recommendations' ? '#000' : '#fff'} style={{
            marginLeft: `${collapsed ? '36%' : '5%'}`
          }} />
        }>
          Recommendations
        </Menu.Item>
      </Menu.ItemGroup>

      <hr style={{
        margin: '8px 16px',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderStyle: 'solid',
        borderWidth: '0 0 1px 0'
      }} />

      <Menu.ItemGroup key="operate-group" title="OPERATE">
        <Menu.Item key="governance" icon={
          <Building2 size={18} strokeWidth={1.5} color={clickedNavItem == 'Governance' ? '#000' : '#fff'} style={{
            marginLeft: `${collapsed ? '36%' : '5%'}`
          }} />
        }>
          Governance
        </Menu.Item>
        <Menu.SubMenu
          key="budget"
          icon={
            <FileSpreadsheet size={18} strokeWidth={1.5} color={(clickedNavItem == 'Bud vs Act' || clickedNavItem == 'Budget Unit') && collapsed ? "#000" :'#fff'} style={{
              marginLeft: `${collapsed ? '-5px' : '5%'}`,
              marginRight: `${collapsed ? '0%' : '5%'}`,
            }} />
          }
          title={<span style={{ color: '#fff' }}>{collapsed ? '' : 'Budget'}</span>}
          className={`budget-submenu ${(clickedNavItem == 'Bud vs Act' || clickedNavItem == 'Budget Unit') && collapsed ? 'budget-submenu-selected' : ''}`}
        >

          <Menu.Item
            key="bud-vs-act"
            className="budget-menu-item"
            icon={
              <Combine
                size={18}
                strokeWidth={1.5}
                color={clickedNavItem == 'Bud vs Act' ? '#000' : '#fff'}
                style={{
                  marginLeft: collapsed ? '15px' : '5%',
                  marginRight: collapsed ? '8px' : '0' // Add space between icon and text in collapsed mode
                }}
              />
            }
            style={{
              display: 'flex',
              alignItems: 'center',
              // justifyContent: collapsed ? 'flex-start' : 'space-between',
              // padding: collapsed ? '8px 12px' : undefined
            }}
          >
            <span style={{
              color: '#fff',
              paddingBottom: collapsed ? '0' : '15px',
              marginLeft: collapsed ? '0' : '15px',
              marginTop: collapsed ? '0' : '12px'
            }}>
              Bud vs Act
            </span>
          </Menu.Item>


          <Menu.Item
            key="budget-unit"
            className="budget-menu-item"
            icon={
              <Boxes
                size={18}
                strokeWidth={1.5}
                color={clickedNavItem == 'Budget Unit' ? '#000' : '#fff'}
                style={{
                  marginLeft: collapsed ? '15px' : '5%',
                  marginRight: collapsed ? '8px' : '0' // Add space between icon and text in collapsed mode
                }}
              />
            }
            style={{
              display: 'flex',
              alignItems: 'center',
              // justifyContent: collapsed ? 'flex-start' : 'space-between',
              // padding: collapsed ? '8px 12px' : undefined
            }}
          >
            <span style={{
             color: '#fff',
             paddingBottom: collapsed ? '0' : '15px',
             marginLeft: collapsed ? '0' : '15px',
             marginTop: collapsed ? '0' : '12px'
            }}>
              Budget Unit
            </span>
          </Menu.Item>
        </Menu.SubMenu>
        <Menu.Item key="green-ops" icon={
          <Leaf size={18} strokeWidth={1.5} color={clickedNavItem == 'GreenOps' ? '#000' : '#fff'} style={{
            marginLeft: `${collapsed ? '36%' : '5%'}`,

          }} />
        }>
          Green Ops
        </Menu.Item>
      </Menu.ItemGroup>

      <hr style={{
        margin: '8px 16px',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderStyle: 'solid',
        borderWidth: '0 0 1px 0'
      }} />

      <Menu.Item key="onprem" icon={
        <LayoutPanelTop size={18} strokeWidth={1.5} color={clickedNavItem == 'OnPrem' ? '#000' : '#fff'} style={{
          marginLeft: `${collapsed ? '36%' : '5%'}`
        }} />
      }>
        OnPrem
      </Menu.Item>
    </Menu>
  )

  const { logout } = useAuth();


  return (
    <Layout style={{ minHeight: '100vh' }} className=''>
      <Header className="app-header">
        <div className="header-left">
          <img
            src="/static/assets/images/layout/images/csight.png"
            alt="Logo"
            className="header-logo"
          />
          <span className="header-title">
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

        <Space size={16} className="header-right">
          <BellOutlined />
          <SlidersOutlined />
          <Dropdown overlay={(
            <Menu>
              <Menu.Item key="profile" icon={<UserOutlined />}>
                Profile
              </Menu.Item>
              <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={() => logout()}>
                Logout
              </Menu.Item>
            </Menu>
          )} placement="bottomRight" trigger={['click']}>
            <SettingOutlined />
          </Dropdown>
        </Space>
      </Header>

      {!isMobile ? (
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          width={200}
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
          {sidebarContent}
        </Sider>
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
          {sidebarContent}
        </Drawer>
      )}

      <Layout className={`custom-menu-item site-layout ${collapsed ? 'collapsed' : ''}`}>
        <Content className="site-content" style={{ overflow: 'auto', height: 'calc(100vh - 60px)' }}>
          <ScrollButtons />
          <ChatBot />
          {children}
        </Content>
      </Layout>
    </Layout>
  )
} 