/* eslint-disable */
import React, { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Card } from "primereact/card";
import { Tooltip } from "primereact/tooltip";
import { HTTP } from "../config/http-common";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../LoadingSpinner";
import { Paginator, PaginatorPageChangeEvent } from "primereact/paginator";
import { ArrowUpOutlined, DollarOutlined } from "@ant-design/icons";

export const RecommendationsTable = () => {
  const [recommenddationsData, setRecommendationsData] = useState<any>([]);
  const [loading, setLoading] = useState<Boolean>(true);
  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const [paginationState, setPaginationState] = useState({
    currentPage: 0,
    countPerPage: 5,
  });
  const maxTextLength = 10;
  const { accessToken } = useAuth();
  useEffect(() => {
    const getRecommendations = async () => {
      try {
        setTableLoading(true);
        const params = {
          q: JSON.stringify({
            page: paginationState.currentPage,
            page_size: paginationState.countPerPage,
          }),
        };
        const response = await HTTP.get("/recommendations/", {
          params,
          headers: { Authorization: accessToken },
        });
        setRecommendationsData(response.data);
      } catch (error) {
        console.error("Failed to fetch recommendations:", error);
      } finally {
        setLoading(false);
        setTableLoading(false);
      }
    };
    getRecommendations();
  }, [paginationState]);

  const { result, list_columns, label_columns } = recommenddationsData;

  const customizeLabels = {
    billing_account_name: "Account",
    service_name: "Resource",
    service_component: "Component",
    recommendation_message: "Recommendation",
    current_cost: (
      <div>
        {/* <Tooltip target=".dollar_current" mouseTrack mouseTrackLeft={10} /> */}
        <DollarOutlined className="pi pi-dollar text-xl" />
        <ArrowUpOutlined
          className="pi pi-arrow-up  text-xl"
          style={{ color: "red", fontWeight: "bold" }}
        />
      </div>
    ),
    proposed_cost: (
      <div>
        {/* <Tooltip target=".dollar_proposed" mouseTrack mouseTrackLeft={10}>
          <i className="pi pi-arrow-up" style={{ color: "red" }} />
        </Tooltip>
        <img
          className="dollar_proposed"
          alt="dollar_proposed"
          src="/layout/images/dollar-symbol.png"
          style={{ width: "20px", height: "20px" }}
          data-pr-tooltip="Proposed"
          data-pr-position="bottom"
        /> */}
        {/* <Tooltip target=".dollar_proposed" mouseTrack mouseTrackLeft={10}> */}
        <DollarOutlined className="text-xl pi pi-dollar" />
        <ArrowUpOutlined
          className="pi pi-arrow-up  text-xl"
          style={{ color: "green", fontWeight: "bold" }}
        />
        {/* </Tooltip>
        <img
          className="dollar_proposed"
          alt="dollar_proposed"
          src="/layout/images/dollar-symbol.png"
          style={{ width: "18px", height: "18px" }}
          data-pr-position="bottom"
        /> */}
      </div>
    ),
    datekey: "Month",
  };
  const filteredColumns =
    list_columns &&
    list_columns?.filter((column) => !["id", "datekey"].includes(column));

  const formatDateToMonthYear = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", { month: "short", year: "numeric" });
  };

  const handlePageChange = (event: PaginatorPageChangeEvent) => {
    setPaginationState({
      currentPage: event.page,
      countPerPage: event.rows,
    });
  };

  // Function to truncate text and add tooltip
  const truncatedBodyTemplate = (rowData, columnKey, rowIndex) => {
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

  return (
    <Card title="Recommendations" className="w-full h-full relative">
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
            className="w-full dashboard-table"
          >
            {filteredColumns &&
              filteredColumns?.map((columnKey) => (
                <Column
                  key={columnKey}
                  field={columnKey}
                  style={{ whiteSpace: "nowrap" }}
                  header={
                    customizeLabels[columnKey] ||
                    label_columns[columnKey] ||
                    columnKey
                  }
                  body={(rowData, { rowIndex }) => {
                    // Format the cost and date columns specifically
                    if (
                      columnKey === "current_cost" ||
                      columnKey === "proposed_cost"
                    ) {
                      return formatCurrency(rowData[columnKey]);
                    }
                    // if (columnKey === "datekey") {
                    //   return formatDateToMonthYear(rowData[columnKey]);
                    // }
                    return truncatedBodyTemplate(rowData, columnKey, rowIndex);
                  }}
                  headerStyle={{ backgroundColor: "#0032a5", color: "#ffffff" }}
                />
              ))}
          </DataTable>
          <Paginator
            first={paginationState.currentPage * paginationState.countPerPage}
            rows={paginationState.countPerPage}
            rowsPerPageOptions={[2, 5, 10]}
            onPageChange={handlePageChange}
            totalRecords={recommenddationsData?.count}
            className="custom-paginator"
          />
        </>
      )}
    </Card>
  );
};

export default RecommendationsTable;
