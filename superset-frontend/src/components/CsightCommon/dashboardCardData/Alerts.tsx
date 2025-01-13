/* eslint-disable */
import React, { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Card } from "primereact/card";
import { Tooltip } from "primereact/tooltip";
import { HTTP } from "../config/http-common";
import LoadingSpinner from "../LoadingSpinner";
import { Paginator, PaginatorPageChangeEvent } from "primereact/paginator";
import { useAuth } from "../context/AuthContext";
import { ArrowUpOutlined, CalendarOutlined, DollarOutlined, PercentageOutlined } from "@ant-design/icons";
export const AlertsTableUI = () => {
  const [alertsData, setALertsData] = useState<any>([]);
  const [loading, setLoading] = useState<Boolean>(true);
  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const [paginationState, setPaginationState] = useState({
    currentPage: 0,
    countPerPage: 5,
  });
  // const maxTextLength = 4;
  const { accessToken } = useAuth();
  useEffect(() => {
    const getAlerts = async () => {
      try {
        setTableLoading(true);
        const params = {
          q: JSON.stringify({
            page: paginationState.currentPage,
            page_size: paginationState.countPerPage,
          }),
        };
        const response = await HTTP.get("/alerts/", {
          params,
          headers: { Authorization: accessToken },
        });
        setALertsData(response.data);
      } catch (error) {
        console.error("Failed to fetch alerts data:", error);
      } finally {
        setLoading(false);
        setTableLoading(false);
      }
    };
    getAlerts();
  }, [paginationState]);

  const { result, list_columns, label_columns } = alertsData;
  const handlePageChange = (event: PaginatorPageChangeEvent) => {
    setPaginationState({
      currentPage: event.page,
      countPerPage: event.rows,
    });
  };
  const customizeLabels = {
    billing_account_name: "Account",
    resource_name: "Resource",
    cost_on_datekey: (
      <div>
        {/* <Tooltip target=".dollar_date" mouseTrack mouseTrackLeft={10} /> */}
        {/* <img
          className="dollar_date"
          alt="dollar_date"
          src="/layout/images/dollar_date.png"
          style={{ width: "14px", height: "14px" }}
          data-pr-tooltip="Cost"
          data-pr-position="bottom"
        /> */}
        <CalendarOutlined className="text-xl	pi pi-calendar" />
      </div>
    ),
    // prev_day_cost: (
    //   <div>
    //     {/* <Tooltip target=".dollar_date_prev" mouseTrack mouseTrackLeft={10} /> */}
    //     <img
    //       className="dollar_date_prev"
    //       alt="dollar_date_prev"
    //       src="/layout/images/dollar_date.png"
    //       style={{ width: "24px", height: "24px" }}
    //       data-pr-tooltip="on Prev. Day"
    //       data-pr-position="bottom"
    //     />
    //   </div>
    // ),
    cost_diff: (
      <div>
        {/* <Tooltip target=".dollar_Increased" mouseTrack mouseTrackLeft={10}> */}
        <DollarOutlined className="text-xl	pi pi-dollar" />
        <ArrowUpOutlined className="text-xl	pi pi-arrow-up" style={{ color: "red" }} />
        {/* </Tooltip>
        <img
          className="dollar_Increased"
          alt="dollar_Increased"
          src="/layout/images/price-growth.png"
          style={{ width: "24px", height: "24px" }}
          data-pr-position="bottom"
        /> */}
      </div>
    ),
    dod_percentage_change: (
      <div>
        {/* <Tooltip target=".percent_Increased" mouseTrack mouseTrackLeft={10}> */}
        <PercentageOutlined className="pi pi-percentage text-xl	" />
        <ArrowUpOutlined className="text-xl	pi pi-arrow-up" style={{ color: "red" }} />
        {/* </Tooltip>
        <img
          className="percent_Increased"
          alt="percent_Increased"
          src="/layout/images/percent_increase.png"
          style={{ width: "18px", height: "18px" }}
          data-pr-position="bottom"
        /> */}
      </div>
    ),
    datekey: "Date",
  };
  const filteredColumns =
    list_columns &&
    list_columns?.filter((column) => !["id", "prev_day_cost"].includes(column));

  const formatDateToMonthYear = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Function to truncate text and add tooltip
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

  const specificColumnWidth = "10px";
  const columnsWithFixedWidth = [
    "prev_day_cost",
    "cost_diff",
    "dod_percentage_change",
    "datekey",
  ];

  return (
    <Card title="Alerts" className="w-full h-full relative">
      {loading ? (
        <div className="flex justify-center items-center">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          <DataTable
            value={result}
            scrollable
            scrollHeight="280px"
            loading={tableLoading}
            className="w-full alert-table dashboard-table"
          >
            {filteredColumns &&
              filteredColumns?.map((columnKey) => (
                <Column
                  key={columnKey}
                  field={columnKey}
                  style={{
                    whiteSpace: "nowrap",
                    // width: columnsWithFixedWidth.includes(columnKey)
                    //   ? specificColumnWidth
                    //   : undefined,
                  }}
                  header={
                    customizeLabels[columnKey] ||
                    label_columns[columnKey] ||
                    columnKey
                  }
                  body={(rowData, { rowIndex }) => {
                    // Format the cost and date columns specifically
                    if (
                      columnKey === "cost_on_datekey" ||
                      columnKey === "prev_day_cost"
                    ) {
                      return formatCurrency(rowData[columnKey]);
                    }
                    if (columnKey === "datekey") {
                      return formatDateToMonthYear(rowData[columnKey]);
                    }
                    if (columnsWithFixedWidth.includes(columnKey)) {
                      return truncatedBodyTemplate(
                        rowData,
                        columnKey,
                        rowIndex,
                        4
                      );
                    }
                    return truncatedBodyTemplate(
                      rowData,
                      columnKey,
                      rowIndex,
                      10
                    );
                  }}
                  headerStyle={{
                    backgroundColor: "#0032a5",
                    color: "#ffffff",
                    // display: "flex",
                    // justifyContent: "center", // Centers the header items horizontally
                    // alignItems: "center",
                  }}
                />
              ))}
          </DataTable>
          <Paginator
            first={paginationState.currentPage * paginationState.countPerPage}
            rows={paginationState.countPerPage}
            rowsPerPageOptions={[2, 5, 10]}
            onPageChange={handlePageChange}
            totalRecords={alertsData?.count}
            className="custom-paginator"
          />
        </>
      )}
    </Card>
  );
};

export default AlertsTableUI;
