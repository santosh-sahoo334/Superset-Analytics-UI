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

const { Header, Sider, Content } = Layout

interface MainLayoutProps {
  children: React.ReactNode
}

export default function MainLayoutCsight({ children }: MainLayoutProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openKeys, setOpenKeys] = useState<string[]>([])
  const isMobile = useMediaQuery({ maxWidth: 768 });

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
    if(dashboardLayout){
      const tabValues = Object.keys(dashboardLayout)
      .filter(key => key.startsWith('TABS')) 
      .map(key => dashboardLayout[key]);  
      if(tabValues && tabValues.length>0 && tabValues[0]?.id){
        // Find the div element by its id
        const parentElement = document.getElementById(tabValues[0].id);
        if (parentElement) {
          // Find the first child element with role="tablist"
          const tabListElement:any = parentElement.querySelector(":scope > [role='tablist']");
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
    const findTab = findTabIdByName(dashboardLayout, itemTab);
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

  const { clickedNavItem,activeNavItem, setActiveNavItem,setClickedNavItem } = useContext(LayoutContext);

  const navItems:any = {
    dashboard: {id:'dashboard',name:'Dashboard'},
    onprem: {id:'onprem',name:'OnPrem'},
    cost: {id:'cost',name:'Cost'},
    utilization: {id:'utilization',name:'Utilization'},
    billing: {id:'billing', name: 'Billing',replaceName:'Billing Plans'},
    tags: {id:'tags',name:'Tags'},
    observability: {id:'observability',name:'Observability'},
    anomaly: {id:'anomaly',name:'Anomaly',replaceName: 'Tags'},
    recommendations: {id:'recommendations',name:'Recommendations'},
    governance: {id:'governance',name:'Governance',replaceName:'Executive Report'},//Executive Report
    'bud-vs-act': {id:'bud-vs-act',name: 'Bud vs Act' ,replaceName:'Budget vs Actuals'},
    'budget-unit': {id:'budget-unit',name:'Budget Unit'},
    'green-ops': {id:'green-ops',name:'GreenOps'}
  }
  

  useEffect(() => {
    if(tabRedirectionDetails.includes(activeNavItem)){
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
    const key:any = info.key.toString();
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
      <Menu.Item key="dashboard" icon={<img src="/static/assets/images/layout/images/dashboard.png" alt="Dashboard" className="menu-icon" />}>
        Dashboard
      </Menu.Item>

      <Menu.Item key="onprem" icon={<img src="/static/assets/images/layout/images/money.png" alt="OnPrem" className="menu-icon" />}>
        OnPrem
      </Menu.Item>

      {/* Observe Section */}
      <Menu.ItemGroup key="observe-group" title="Observe">
        <Menu.Item key="cost" icon={<img src="/static/assets/images/layout/images/bill.png" alt="Cost" className="menu-icon" />}>
          Cost
        </Menu.Item>
        <Menu.Item key="utilization" icon={<img src="/static/assets/images/layout/images/cpu.png" alt="Utilization" className="menu-icon" />}>
          Utilization
        </Menu.Item>
        <Menu.Item key="billing" icon={<img src="/static/assets/images/layout/images/bill.png" alt="Billing" className="menu-icon" />}>
          Billing
        </Menu.Item>
        <Menu.Item key="tags" icon={<img src="/static/assets/images/layout/images/price-tag.png" alt="Tags" className="menu-icon" />}>
          Tags
        </Menu.Item>
      </Menu.ItemGroup>

      {/* Optimize Section */}
      <Menu.ItemGroup key="optimize-group" title="Optimize">
        <Menu.Item key="observability" icon={<img src="/static/assets/images/layout/images/save-the-planet.png" alt="Observability" className="menu-icon" />}>
          Observability
        </Menu.Item>
        <Menu.Item key="anomaly" icon={<img src="/static/assets/images/layout/images/glitch.png" alt="Anomaly" className="menu-icon" />}>
          Anomaly
        </Menu.Item>
        <Menu.Item key="recommendations" icon={<img src="/static/assets/images/layout/images/like.png" alt="Recommendations" className="menu-icon" />}>
          Recommendations
        </Menu.Item>
      </Menu.ItemGroup>

      {/* Operate Section */}
      <Menu.ItemGroup key="operate-group" title="Operate">
        <Menu.Item key="governance" icon={<img src="/static/assets/images/layout/images/government.png" alt="Governance" className="menu-icon" />}>
          Governance
        </Menu.Item>
        <Menu.SubMenu 
          key="budget" 
          icon={<img src="/static/assets/images/layout/images/bill.png" alt="Budget" className="menu-icon" />}
          title={(!collapsed || isMobile) ? "Budget" : ""}
        >
          <Menu.Item key="bud-vs-act" icon={<img src="/static/assets/images/layout/images/profit.png" alt="Bud vs Act" className="menu-icon" />}>
            Bud vs Act
          </Menu.Item>
          <Menu.Item key="budget-unit" icon={<img src="/static/assets/images/layout/images/calculator.png" alt="Budget Unit" className="menu-icon" />}>
            Budget Unit
          </Menu.Item>
        </Menu.SubMenu>
        <Menu.Item key="green-ops" icon={<img src="/static/assets/images/layout/images/save-the-planet.png" alt="Green Ops" className="menu-icon" />}>
          Green Ops
        </Menu.Item>
      </Menu.ItemGroup>
    </Menu>
  )

  const { logout } = useAuth();

  
  return (
    <Layout style={{ minHeight: '100vh' }}>
      {!isMobile ? (
        // Desktop Sidebar
        <Sider 
          trigger={null} 
          collapsible 
          collapsed={collapsed}
          breakpoint="lg"
          collapsedWidth={isMobile ? 0 : 80}
          style={{
            overflow: 'auto',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
          }}
        >
          <div className="logo-container">
            <img 
              src={collapsed ? '/static/assets/images/layout/images/csight_circle.png' : '/static/assets/images/layout/images/csight.png'}
              alt="Logo"
              style={{
                width: collapsed ? '32px' : '60px',
                height: 'auto',
                transition: 'all 0.2s'
              }}
            />
            {!collapsed && (
              <div className="logo-title">
               {process.env.REACT_APP_LOGO_TEXT || 'Multi-Cloud FinOps'}
              </div>
            )}
          </div>
          {sidebarContent}
        </Sider>
      ) : (
        // Mobile Drawer
        <Drawer
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginRight: '24px' }}>
              <img 
                src={'/static/assets/images/layout/images/csight.png'}
                alt="Logo"
                style={{
                  width: '40px',
                  height: 'auto'
                }}
              />
              <span style={{ color: '#000', fontSize: '16px', fontWeight: 600 }}>
                {process.env.REACT_APP_LOGO_TEXT || 'Multi-Cloud FinOps'}
              </span>
            </div>
          }
          placement="left"
          closable={true}
          onClose={() => setMobileOpen(false)}
          visible={mobileOpen}
          bodyStyle={{ padding: 0, background: '#001529' }}
          width={250}
          className="mobile-drawer"
        >
          {sidebarContent}
        </Drawer>
      )}
      
      <Layout style={{ 
        marginLeft: isMobile ? 0 : (collapsed ? 80 : 200), 
        transition: 'margin-left 0.2s',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Header style={{ 
          maxHeight: 40,
          padding: '0 16px', 
          background: '#fff',
          position: 'fixed',
          top: 0,
          right: 0,
          width: `calc(100% - ${isMobile ? 0 : (collapsed ? 80 : 200)}px)`,
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'width 0.2s',
          boxShadow: '0 1px 4px rgba(0,21,41,.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button
              type="text"
              icon={isMobile ? <MenuUnfoldOutlined /> : (collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />)}
              onClick={() => isMobile ? setMobileOpen(true) : setCollapsed(!collapsed)}
              style={{
                fontSize: '16px',
                width: 40,
                height: 40
              }}
            />
            <AppBreadCrumb />
          </div>
          
          <Space size={16}>
            <BellOutlined style={{ fontSize: '15px', cursor: 'pointer' }} />
            <SlidersOutlined style={{ fontSize: '15px', cursor: 'pointer' }} />
            <Dropdown overlay={(
              <Menu>
                <Menu.Item key="profile" icon={<UserOutlined />} onClick={() => console.log('Profile clicked')}>
                  Profile
                </Menu.Item>
                <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={() => logout()}>
                  Logout
                </Menu.Item>
              </Menu>
            )} placement="bottomRight" trigger={['click']}>
              <span className="ant-dropdown-link" onClick={e => e.preventDefault()}>
                <SettingOutlined style={{ fontSize: '15px', cursor: 'pointer' }} />
              </span>
            </Dropdown>
          </Space>
        </Header>

        <Content style={{ 
          marginTop: 40,
          padding: '2px',
          overflow: 'auto',
          flex: 1,
          background: '#f0f2f5'
        }}>
          <ScrollButtons />
          {children}
        </Content>
      </Layout>
    </Layout>
  )
} 