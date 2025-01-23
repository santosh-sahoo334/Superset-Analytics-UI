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

  const getValue = () => {
    if (title === 'Monthly Cost') {
      return result && formatCurrency(result[0]?.total_cost);
    }
    return result && `${result[0]?.potential_savings_percentage ?? ''} %`;
  };

  const value = getValue();
  const textSizeClass = getTextSizeClass(value);

  return (
    <div
      className={` flex items-center w-full ${
        showLeft ? 'cost-content-left' : 'cost-content-right'
      } `}
    >
      <div className="savings-title flex flex-row align-items-center">
        {icon}
        <h4 className="text-end">{title}</h4>
      </div>
      <div className="cost-amount justify-between w-full">
        {/* <span className="currency">{title === "Monthly Cost" ? "$" : ""} </span> */}
        {showLeft && <p className="m-0 text-sm">
          <span className='font-medium text-sm error-message'>
          <ArrowDownOutlined />{" + 6.5 % "}
          </span>
          since last month</p>}
        <p className={`saving-value font-medium m-0 ${textSizeClass}`}>
          {loading ? (
            <LoadingSpinner size="20px" />
          ) : (
            value
          )}
        </p>
        {showRight && <p className="m-0 text-sm">
          <span className='font-medium text-sm success-message'>
          <ArrowUpOutlined />{" + 6.5 % "}</span>
          since last month</p>}
      </div>
    </div>
  );
};

export default DashboardCards;
