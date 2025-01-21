/* eslint-disable */
import React, { useEffect, useState, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Card } from "primereact/card";
import { Tooltip } from "primereact/tooltip";
import { HTTP } from "../config/http-common";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../LoadingSpinner";
import { ArrowUpOutlined, DollarOutlined, SettingOutlined } from "@ant-design/icons";

export const ResourcesTable = () => {
  const [resourcesData, setResourcesData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [pageSize] = useState<number>(5); // Number of rows to fetch per page
  const tableRef = useRef<HTMLDivElement>(null); // Ref for scrollable table container
  const { accessToken } = useAuth();

  // Fetch data for the table
  const getResources = async (page: number) => {
    try {
      setTableLoading(true);
      const params = {
        q: JSON.stringify({
          page: page,
          page_size: pageSize,
        }),
      };
      const response = await HTTP.get("/new_resources/", {
        params,
        headers: { Authorization: accessToken },
      });
      if (response.data) {
        const newResources = response.data.result;
        setResourcesData((prevData) => [...prevData, ...newResources]);
        setHasMore(newResources.length === pageSize); // Check if more data is available
      }
    } catch (error) {
      console.error("Failed to fetch resources:", error);
    } finally {
      setLoading(false);
      setTableLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    getResources(0);
  }, []);

  // Scroll handler for infinite scrolling
  const handleScroll = () => {
    if (!tableRef.current || !hasMore || tableLoading) return;
    const { scrollTop, scrollHeight, clientHeight } = tableRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      getResources(nextPage);
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

  const columnLabelsList = {
    // resource_name: "Resource",
    resource_name: (
      <div>
        Resource <ArrowUpOutlined className="text-xl" style={{ color: "#667084" }} />
      </div>
    ),
    // count_new_resources_added: "# New Resources Added",
    count_new_resources_added: (
      <div>
        # New Assets <ArrowUpOutlined className="text-xl" style={{ color: "#667084" }} />
      </div>
    ),
    cost_new_resources: (
      <div>
        Costing<ArrowUpOutlined className="text-xl" style={{ color: "#667084" }} />
      </div>
    ),
    // new_resources_added_datekey: "Date Added",
    new_resources_added_datekey: (
      <div>
        Date Added <ArrowUpOutlined className="text-xl" style={{ color: "#667084" }} />
      </div>
    ),
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

  // Function to truncate text and add tooltip
  const truncatedBodyTemplate = (rowData, columnKey, rowIndex) => {
    const value = rowData[columnKey] || "";
    const truncatedText =
      value.length > 10 ? `${value.slice(0, 10)}...` : value;
    const tooltipId = `${columnKey}-${rowIndex}`;

    return (
      <>
        <span id={tooltipId}>{truncatedText}</span>
        <Tooltip target={`#${tooltipId}`} content={value} />
      </>
    );
  };

  return (
    <Card title="" className="w-full h-full relative">
      {loading ? (
        <div className="flex justify-center items-center">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          <div className="flex justify-start title-card gap-2 p-2 title-color">
          <SettingOutlined className="text-xl"/>
            <span className="text-3xl font-medium">New Assets</span>
          </div>
          <div ref={tableRef} style={{ maxHeight: "260px", overflowY: "auto" }}>
            <DataTable
              value={resourcesData}
              scrollable
              className="w-full dashboard-table-update"
              // loading={tableLoading}
            >
              {resourcesData.length > 0 &&
                Object.keys(resourcesData[0]).filter((column) => column !== "id").map((columnKey) => (
                  <Column
                    key={columnKey}
                    field={columnKey}
                    header={columnLabelsList[columnKey] || columnKey}
                    style={{ width: "25%", whiteSpace: "nowrap" }}
                    body={(rowData, { rowIndex }) => {
                      if (columnKey === "cost_new_resources") {
                        return formatCurrency(rowData[columnKey]);
                      }
                      if (columnKey === "new_resources_added_datekey") {
                        return formatDate(rowData[columnKey]);
                      }
                      return truncatedBodyTemplate(rowData, columnKey, rowIndex);
                    }}
                    headerStyle={{ backgroundColor: "#f2f3f6", color: "#667084"}}
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

export default ResourcesTable;
