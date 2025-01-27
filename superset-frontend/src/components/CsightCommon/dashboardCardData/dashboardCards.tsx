/* eslint-disable */
// @ts-nocheck
import React from 'react';
import LoadingSpinner from '../LoadingSpinner';
import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';

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
  function formatCurrency(value) {
    if (value >= 1_000_000) {
      return `$ ${(value / 1_000_000).toFixed(1)}M`;
    } else if (value >= 1_000) {
      return `$ ${(value / 1_000).toFixed(1)}K`;
    } else {
      return `$ ${value.toFixed(1)}`;
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

  return (
    <div
      className={` flex items-center w-full ${showLeft ? 'cost-content-left' : 'cost-content-right'
        } `}
    >
      <div className={`savings-title flex flex-row items-center justify-between w-full`} style={{ justifyContent: showLeft ? 'space-between' : null }}>
        <div className='flex flex-row items-center gap-2'>
          {icon}
          <h4 className="text-start m-0 flex align-items-center">{title}</h4>
        </div>
        <p className={`saving-value font-medium m-0 flex align-items-center ${textSizeClass}`}>
          {loading && showLeft ? (
            <LoadingSpinner size="10px" />
          ) : (
            showLeft ? value : null
          )}
        </p>
      </div>
      {
        showLeft ?
          <div className="cost-amount w-full flex flex-row">
              <div className="cost-amount m-0 text-sm w-full" style={{justifyContent: 'flex-start', alignItems: 'center'}}>
                <p className={`saving-value font-medium m-0 ${textSizeClass}`}>
                  {loading ? (
                    <LoadingSpinner size="10px" />
                  ) : (
                    savingsValue ? savingsValue : null
                  )}
                </p>
                {
                  percentageChange ? 
                  <div>
                  <span className={`font-medium text-sm ${isPositiveChange ? 'success-message' : 'error-message'} ml-2`}>
                    {isPositiveChange ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                    {` ${isPositiveChange ? '+' : ''} ${percentageChange} % `}
                  </span>
                  since last month
                
                    </div>
                    :null
                }

            </div>
          </div> : null
      }
      <div className="cost-amount w-full flex flex-row justify-between">
        <p className={`saving-value font-medium m-0 ${textSizeClass}`}>
          {loading && showRight? (
            <LoadingSpinner size="20px" />
          ) : (
            !showLeft ? value : null
          )}
        </p>
        {showRight && !showLeft && percentageChange &&  <div style={{marginBottom: '0px'}}><p className="m-0 text-sm">
          <span className={`font-medium text-sm ${!isPositiveChange ? 'success-message' : 'error-message'}`}>
            {!isPositiveChange ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            {` ${!isPositiveChange ? '+' : ''} ${percentageChange} % `}
          </span>
          since last month</p></div>}
      </div>
    </div>
  );
};

export default DashboardCards;
