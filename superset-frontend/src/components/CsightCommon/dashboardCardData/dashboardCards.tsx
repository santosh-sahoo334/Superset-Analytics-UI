/* eslint-disable */
// @ts-nocheck
import React, { useState , useEffect, useContext} from 'react';
import LoadingSpinner from '../LoadingSpinner';
import { ArrowDownOutlined, ArrowUpOutlined, InfoCircleOutlined, AreaChartOutlined } from '@ant-design/icons';
import { Modal, Table, message, Popover } from 'antd';
import { HTTP } from '../config/http-common';
import React from 'react';
import { useAuth } from '../context/AuthContext';
import React from 'react';
import { LayoutContext } from 'src/layout/context/layoutcontext';
import { Tooltip } from 'antd';
interface PotentialType {
  title: string;
  result: any;
  loading?: Boolean;
  icon?: any;
  showLeft?: boolean;
  showRight?: boolean;
}
export const DashboardCards: React.FC<PotentialType> = ({
  title,
  result,
  loading,
  icon,
  showLeft,
  showRight,
}) => {
  const [resourceData, setResourceData] = useState([]);
  const [loadingResources, setLoadingResources] = useState(false);

  const { activeNavItem, setActiveNavItem,setClickedNavItem,clickedNavItem,setPreviousNavItem } = useContext(LayoutContext);


  function formatCurrency(value) {
    // Convert value to number if it's a string
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    if (isNaN(numValue)) {
      return '$ 0.0';
    }
  
    if (numValue >= 1_000_000) {
      return `$ ${(numValue / 1_000_000)?.toFixed(1)}M`;
    } else if (numValue >= 1_000) {
      return `$ ${(numValue / 1_000)?.toFixed(1)}K`;
    } else {
      return `$ ${numValue?.toFixed(1)}`;
    }
  }

  function getTextSizeClass(value: string | number) {
    const stringValue = value?.toString() || '';
    const length = stringValue.length;

    if (length <= 4) return 'text-4xl'; // Larger text for smaller numbers
    if (length <= 6) return 'text-3xl'; // Medium text for medium numbers
    if (length <= 8) return 'text-2xl'; // Smaller text for larger numbers
    return 'text-xl'; // Smallest text for very large numbers
  }

  let savingsValue = null;

  const getValue = () => {
    if (!result || result.length < 2) return null;

    // Sort dates in descending order and get the two most recent months
    const sortedData = [...result].sort((a, b) => new Date(b.datekey).getTime() - new Date(a.datekey).getTime());
    const currentMonth = sortedData[0];
    const previousMonth = sortedData[1];

    if (!currentMonth) return null;

    if (title === 'Monthly Cost') {
      return formatCurrency(parseFloat(currentMonth.total_cost));
    }

    // For Potential Savings, show both absolute value and percentage
    savingsValue = `${formatCurrency(currentMonth.potential_savings)} `;
    //(${savingsValue})
    return `${currentMonth.potential_savings_percentage} %`;
  };

  const value = getValue();
  const textSizeClass = getTextSizeClass(value);

  const calculatePercentageChange = () => {
    if (!result || result.length < 2) return null;

    // Sort dates in descending order and get the two most recent months
    const sortedData = [...result].sort((a, b) => new Date(b.datekey).getTime() - new Date(a.datekey).getTime());
    const currentMonth = sortedData[0];
    const previousMonth = sortedData[1];

    if (!currentMonth || !previousMonth) return null;

    if (title === 'Monthly Cost') {
      const currentCost = parseFloat(currentMonth.total_cost);
      const previousCost = parseFloat(previousMonth.total_cost);

      // Avoid division by zero
      if (previousCost === 0) return null;

      return ((currentCost - previousCost) / previousCost * 100).toFixed(1);
    } else {
      // For Potential Savings
      const currentSavings = parseFloat(currentMonth.potential_savings);
      const previousSavings = parseFloat(previousMonth.potential_savings);

      // Avoid division by zero
      if (previousSavings === 0) return null;

      return ((currentSavings - previousSavings) / previousSavings * 100).toFixed(1);
    }
  };

  const percentageChange = calculatePercentageChange();
  const isPositiveChange = percentageChange && parseFloat(percentageChange) >= 0;
    const { accessToken } = useAuth();

  const handleInfoClick = async () => {
    // e.stopPropagation();
    
    if (!resourceData.length) {  // Only fetch if we haven't already
      try {
        setLoadingResources(true);
        const response = await HTTP.get("/resource_views/", {
          headers: { Authorization: accessToken },
        });

        if (response?.data) {
          setResourceData(response.data);
        } else {
          message.info('No resource data available');
        }
      } catch (error) {
        console.error('Error fetching resource data:', error);
      } finally {
        setLoadingResources(false);
      }
    }
  };

  const columns = [
    {
      title: 'Resource',
      dataIndex: 'resource_name',
      key: 'resource_name',
    },
    {
      title: 'Cost $',
      dataIndex: 'current_month_cost',
      key: 'current_month_cost',
      render: (text, record) => (
        <div className="flex items-center gap-2 flex-row justify-center">
          {formatCurrency(text)}
          {record.percentage_change_mom && (
            <span style={{color: parseFloat(record.percentage_change_mom) < 0 || record.percentage_change_mom == 0 ? 'green' : 'red'}}>
              {parseFloat(record.percentage_change_mom) >= 0 ? (
                record.percentage_change_mom == 0 ? <span>~</span> : <ArrowUpOutlined/>
              ) : (
                <ArrowDownOutlined/>
              )}
              <span>
                &nbsp;{record.percentage_change_mom == 0 ? 0 : Math.abs(parseFloat(record.percentage_change_mom).toFixed(2))}%
              </span>
            </span>
          )}
        </div>
      ),
    }
  ];

  const tableContent = (
    <Table
      style={{ maxWidth: '400px' }}
      bordered
      columns={columns}
      dataSource={resourceData?.result}
      loading={loadingResources}
      rowKey="resource_name"
      pagination={false}
      size="small"
      className="resource-table"
      components={{
        header: {
          cell: (props) => (
            <th
            {...props}
            style={{
              ...props.style,
              backgroundColor: '#F2F3F6',
              color: '#666666',
              borderColor: '#E1E2E6'  // slightly darker than the background
            }}
          />
          )
        }
      }}
    />
  );


  useEffect(() => {
    if(title === 'Monthly Cost'){
      handleInfoClick();
    }
  }, []);

  return (
    <>
      <div
        className={` flex items-center w-full ${showLeft ? 'cost-content-left' : 'cost-content-right'
          } `}
      >
        <div className={`savings-title flex flex-row items-center w-full`}>
          <div className='flex flex-row items-center gap-2' style={{alignItems: 'center', minWidth: '50%'}} >
            {icon}
            <h4 className="text-start m-0 flex align-items-center gap-2 items-center">
              {title}
            </h4>
          </div>
          {
          ((title === 'Monthly Cost' && process.env.REACT_APP_INFO_MONTHLY_COST) || (title === 'Potential Savings' && process.env.REACT_APP_INFO_POTENTIAL_SAVINGS) ) && (  
          <Tooltip title={
            title === 'Monthly Cost' ? process.env.REACT_APP_INFO_MONTHLY_COST : process.env.REACT_APP_INFO_POTENTIAL_SAVINGS } placement="left">
            <InfoCircleOutlined className='cursor-pointer text-gray-500 hover:text-gray-700' style={{
              fontSize: '10px',
              position: 'absolute',
              right: 0,
              top: 0,
              marginTop: '5px',
            marginRight: '5px'
          }} />
          </Tooltip>
          )
          }
          {title === 'Monthly Cost' && resourceData?.result?.length > 0 && (
            <div className='flex flex-row items-center w-full' style={{alignItems: 'center', minWidth: '50%', justifyContent: 'center'}} >
              <Popover 
                placement="right"
                content={tableContent}
                title={
                  <div style={{ 
                    fontSize: '16px',
                    backgroundColor: '#18279A', 
                    margin: '-5px -17px -12px -17px', 
                    padding: '8px 16px',
                    color: 'white',
                    borderTopLeftRadius: '8px',
                    borderTopRightRadius: '8px',
                    justifyContent: 'center',
                    alignItems: 'center',
                    display: 'flex'
                  }}>
                    Top 5 Resources
                  </div>
                }
                trigger="hover"
                onOpenChange={(visible) => {
                  if (visible) handleInfoClick();
                }}
                overlayInnerStyle={{
                  padding: 0
                }}
                overlayStyle={{
                  '--antd-arrow-background-color': '#18279A'
                } as React.CSSProperties}
              >
                <AreaChartOutlined 
                  className="cursor-pointer text-gray-500 hover:text-gray-700"
                  style={{ fontSize: '16px' }}
                />
              </Popover>
            </div>
          )}
        </div>
        {
          showLeft ?
            <div className="cost-amount w-full flex flex-row justify-between">
                <p className={`cursor-pointer saving-value font-medium m-0 ${textSizeClass}`} onClick={()=>{
                  setPreviousNavItem(clickedNavItem);
                  setActiveNavItem('Recommendations');
                  setClickedNavItem('Recommendations');
                }}>
                    {loading ? (
                      <LoadingSpinner size="20px" />
                    ) : (
                      savingsValue ? savingsValue : null
                    )}
                  </p>
             
              <div className="flex flex-row items-center">
              {/* {
                    percentageChange ? 
                    <div>
                    <span className={`font-medium text-sm ${isPositiveChange ? 'success-message' : 'error-message'} ml-2`}>
                      {isPositiveChange ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                      {` ${isPositiveChange ? '+' : ''} ${percentageChange} % `}
                    </span>
                    since last month
                  
                      </div>
                      :null
                  } */}
                  {percentageChange &&  <div style={{marginBottom: '0px'}}><p className="m-0 text-sm">
            <span className={`font-medium text-sm ${isPositiveChange ? 'success-message' : 'error-message'}`}>
              {isPositiveChange ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
              {` ${isPositiveChange ? '+' : ''} ${percentageChange} % `}
            </span>
            since last month</p></div>}
              </div>
            </div> : null
        }
        <div className="cost-amount w-full flex flex-row justify-between">
          <p className={`cursor-pointer saving-value font-medium m-0 ${textSizeClass}`} onClick={()=>{
            setPreviousNavItem(clickedNavItem);
            setActiveNavItem('Cost');
            setClickedNavItem('Cost');
          }}>
            {loading && showRight? (
              <LoadingSpinner size="20px" />
            ) : (
              !showLeft ? value : null
            )}
          </p>
          {showRight && !showLeft && percentageChange &&  <div style={{marginBottom: '0px'}}><p className="m-0 text-sm">
            <span className={`font-medium text-sm ${!isPositiveChange ? 'success-message' : 'error-message'}`}>
              {isPositiveChange ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
              {` ${isPositiveChange ? '+' : ''} ${percentageChange} % `}
            </span>
            since last month</p></div>}
        </div>
      </div>
    </>
  );
};

export default DashboardCards;
