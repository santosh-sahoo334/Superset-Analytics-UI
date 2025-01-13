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
import { DollarOutlined } from "@ant-design/icons";

export const ResourcesTable = () => {
  const [resourcesData, setRresourcesData] = useState<any>([]);
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
        const response = await HTTP.get("/new_resources/", {
          params,
          headers: { Authorization: accessToken },
        });
        setRresourcesData(response.data);
      } catch (error) {
        console.error("Failed to fetch recommendations:", error);
      } finally {
        setLoading(false);
        setTableLoading(false);
      }
    };
    getRecommendations();
  }, [paginationState]);

  const { result, list_columns, label_columns } = resourcesData;
  const sortedResults = result?.sort((a, b) => {
    return b.cost_new_resources - a.cost_new_resources; // Sort in descending order
  });
  const filteredColumns =
    list_columns && list_columns?.filter((column) => column !== "id");

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
  const columnLabelsList = {
    resource_name: "Resource",
    count_new_resources_added: "# New Resources Added",
    cost_new_resources: (
      <div>
        <DollarOutlined className="text-2xl pi pi-dollar" />
      </div>
    ),
    new_resources_added_datekey: "Date Added",
  };
  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };
  // Format currency
  const formatCurrency = (amount) => {
    if (amount == null) return "$0.00"; // Handle null or undefined values
    return `$ ${Number(amount).toLocaleString()}`; // Format with commas
  };

  const handlePageChange = (event: PaginatorPageChangeEvent) => {
    setPaginationState({
      currentPage: event.page,
      countPerPage: event.rows,
    });
  };
  const getWidth = (id: string) => {
    let style;
    switch (id) {
      case "resource_name":
        style = {
          width: "25%",
        };
        break;
      case "count_new_resources_added":
        style = {
          width: "30%",
        };
        break;
      case "cost_new_resources":
        style = {
          width: "20%",
        };
        break;
      case "new_resources_added_datekey":
        style = {
          width: "25%",
        };
        break;
      default:
        style = {
          width: "25%",
        };
    }
    return style;
  };
  return (
    <Card title="New Assets" className="w-full h-full relative">
      {loading ? (
        <div className="flex justify-center items-center">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          <DataTable
            value={sortedResults}
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
                  header={
                    columnLabelsList[columnKey] ||
                    label_columns[columnKey] ||
                    columnKey
                  }
                  style={{ ...getWidth(columnKey), whiteSpace: "nowrap" }}
                  body={(rowData, { rowIndex }) => {
                    // Format the cost and date columns specifically
                    if (columnKey === "cost_new_resources") {
                      return formatCurrency(rowData[columnKey]);
                    } else if (columnKey === "new_resources_added_datekey") {
                      return formatDate(rowData[columnKey]);
                    }
                    return truncatedBodyTemplate(rowData, columnKey, rowIndex);
                  }}
                  headerStyle={{ backgroundColor: "#0032a5", color: "#ffffff" }}
                  // bodyStyle={{ textAlign: 'center' }}
                />
              ))}
          </DataTable>
          <Paginator
            first={paginationState.currentPage * paginationState.countPerPage}
            rows={paginationState.countPerPage}
            rowsPerPageOptions={[2, 5, 10]}
            onPageChange={handlePageChange}
            totalRecords={resourcesData?.count}
            className="custom-paginator"
          />
        </>
      )}
    </Card>
  );
};

export default ResourcesTable;
