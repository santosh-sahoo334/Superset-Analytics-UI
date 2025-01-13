/* eslint-disable */
import React from "react";
import LoadingSpinner from "../LoadingSpinner";

interface PotentialType {
  title: string;
  result: any;
  loading?: Boolean;
}
export const PotentalSavings: React.FC<PotentialType> = ({
  title,
  result,
  loading,
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
    <div className="savings-content flex items-center justify-center">
      <div className="savings-title">
        <h4 className="text-center mb-3">{title}</h4>
      </div>
      <div className="savings-amount">
        {/* <span className="currency">{title === "Monthly Cost" ? "$" : ""} </span> */}
        <b className="saving-value">
          {loading ? (
            <LoadingSpinner size="30px" />
          ) : title === "Monthly Cost" ? (
            result && formatCurrency(result[0]?.total_cost)
          ) : (
            result && `${result[0]?.potential_savings_percentage ?? ""}%`
          )}
        </b>
      </div>
    </div>
  );
};

export default PotentalSavings;
