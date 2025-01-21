/* eslint-disable */
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
      return `$${(value / 1_000_000).toFixed(1)}M`;
    } else if (value >= 1_000) {
      return `$${(value / 1_000).toFixed(1)}K`;
    } else {
      return `$${value.toFixed(1)}`;
    }
  }

  return (
    <div
      className={` flex items-center w-full ${
        showLeft ? 'cost-content-left' : 'cost-content-right'
      }`}
    >
      <div className="savings-title">
        {icon}
        <h4 className="text-end mb-2.5">{title}</h4>
      </div>
      <div className="cost-amount justify-between w-full">
        {/* <span className="currency">{title === "Monthly Cost" ? "$" : ""} </span> */}
        {showLeft && <p className="m-0 text-sm"><span className='font-medium text-sm error-message'><ArrowDownOutlined />{"+6.5%"}</span>since last month</p>}
        <p className="saving-value font-medium m-0">
          {loading ? (
            <LoadingSpinner size="30px" />
          ) : title === 'Monthly Cost' ? (
            result && formatCurrency(result[0]?.total_cost)
          ) : (
            result && `${result[0]?.potential_savings_percentage ?? ''}%`
          )}
        </p>
        {showRight && <p className="m-0 text-sm"><span className='font-medium text-sm success-message'><ArrowUpOutlined />{"+6.5%"}</span>since last month</p>}
      </div>
    </div>
  );
};

export default DashboardCards;
