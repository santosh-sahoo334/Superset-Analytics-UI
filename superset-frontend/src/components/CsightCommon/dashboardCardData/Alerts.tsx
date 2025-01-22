/* eslint-disable */
// @ts-nocheck
import React, { useEffect, useState, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Card } from "primereact/card";
import { Tooltip } from "primereact/tooltip";
import { HTTP } from "../config/http-common";
import LoadingSpinner from "../LoadingSpinner";
import { useAuth } from "../context/AuthContext";
import {
  ArrowUpOutlined,
  CalendarOutlined,
  DollarOutlined,
  InfoCircleOutlined,
  PercentageOutlined,
} from "@ant-design/icons";

export const AlertsTableUI = () => {
  const [alertsData, setAlertsData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [pageSize] = useState<number>(5); // Number of rows to fetch per page
  const tableRef = useRef<HTMLDivElement>(null); // Ref for the scrollable table container
  const { accessToken } = useAuth();

  // Fetch data for the table
  const getAlerts = async (page: number) => {
    try {
      setTableLoading(true);
      const params = {
        q: JSON.stringify({
          page: page,
          page_size: pageSize,
        }),
      };
      const response = await HTTP.get("/alerts/", {
        params,
        headers: { Authorization: accessToken },
      });
      if (response.data) {
        const newAlerts = response.data.result;
        setAlertsData((prevData) => [...prevData, ...newAlerts]);
        setHasMore(newAlerts.length === pageSize); // Check if more data is available
      }
    } catch (error) {
      console.error("Failed to fetch alerts data:", error);
    } finally {
      setLoading(false);
      setTableLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    getAlerts(0);
  }, []);

  // Scroll handler for infinite scrolling
  const handleScroll = () => {
    if (!tableRef.current || !hasMore || tableLoading) return;

    const { scrollTop, scrollHeight, clientHeight } = tableRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      getAlerts(nextPage);
    }
  };

  useEffect(() => {
    const ref = tableRef.current;
    if (ref) {
      ref.addEventListener("scroll", handleScroll);
      return () => {
        ref.removeEventListener("scroll", handleScroll);
      };
    }
  }, [hasMore, tableLoading, currentPage]);

  const formatDateToMonthYear = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const truncatedBodyTemplate = (
    rowData,
    columnKey,
    rowIndex,
    maxTextLength
  ) => {
    const value = rowData[columnKey] || "";
    const truncatedText =
      value.length > maxTextLength
        ? `${value.slice(0, maxTextLength)}...`
        : value;
    const tooltipId = `${columnKey}-${rowIndex}`;
    return (
      <>
        <span id={tooltipId}>{truncatedText}</span>
        <Tooltip target={`#${tooltipId}`} content={value} />
      </>
    );
  };

  const formatCurrency = (amount) => {
    if (amount == null) return "$0.00"; // Handle null or undefined values
    return `$ ${Number(amount).toLocaleString()}`; // Format with commas
  };

  const columnOrder = [
    'billing_account_name',
    'resource_name',
    'datekey',
    'cost_on_datekey',
    'cost_diff',
    'dod_percentage_change'
  ];

  const customizeLabels = {
    billing_account_name: (
      <div>
        Account
        {/* <ArrowUpOutlined className="text-lg" style={{ color: "#667084", marginLeft: "3px" }} /> */}
      </div>
    ),
    resource_name: (
      <div>
        Resource
        {/* <ArrowUpOutlined className="text-lg" style={{ color: "#667084", marginLeft: "3px"  }} /> */}
      </div>
    ),
    datekey: (
      <div>
        Date
        {/* <ArrowUpOutlined className="text-lg" style={{ color: "#667084", marginLeft: "3px"  }} /> */}
      </div>
    ),
    cost_on_datekey: (
      <div>
        {/* <CalendarOutlined className="text-lg" /> */}
        <DollarOutlined className="text-lg" style={{ color: "#667084", marginLeft: "3px"  }} />
        {/* $ on Date */}
      </div>
    ),
    cost_diff: (
      <div>
         <span className="font-bold">$</span> 
        <ArrowUpOutlined className="text-lg  text-red-500" style={{  marginLeft: "3px"  }} />
      </div>
    ),
    dod_percentage_change: (
      <div>
        <span className="font-bold">%</span> 
        <ArrowUpOutlined className="text-lg  text-red-500" style={{  marginLeft: "3px"  }} />
      </div>
    ),
  };

  return (
    <Card title="" className="w-full h-full relative">
      {loading ? (
        <div className="flex justify-center items-center self-center h-full w-full">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          <div className="flex justify-start title-card gap-2 p-2 title-color">
            <InfoCircleOutlined className="text-xl" />
            <span className="text-2xl font-medium">Alerts</span>
          </div>
          <div
            ref={tableRef}
            style={{ maxHeight: "260px", overflowY: "auto" }} // Scrollable container
          >
            <DataTable
              value={alertsData}
              scrollable
              className="w-full alert-table dashboard-table-update"
            >
              {columnOrder.map((columnKey) => (
                <Column
                  key={columnKey}
                  field={columnKey}
                  header={customizeLabels[columnKey] || columnKey}
                  body={(rowData, { rowIndex }) => {
                    if (
                      columnKey === "cost_on_datekey" ||
                      columnKey === "prev_day_cost"
                    ) {
                      return formatCurrency(rowData[columnKey]);
                    }
                    if (columnKey === "datekey") {
                      return formatDateToMonthYear(rowData[columnKey]);
                    }
                    return truncatedBodyTemplate(
                      rowData,
                      columnKey,
                      rowIndex,
                      10
                    );
                  }}
                  headerStyle={{
                    backgroundColor: "#f2f3f6",
                    color: "#667084",
                  }}
                />
              ))}
            </DataTable>
            {tableLoading && (
              <div className="flex justify-center items-center mt-4">
                <LoadingSpinner />
              </div>
            )}
          </div>
        </>
      )}
    </Card>
  );
};

export default AlertsTableUI;
