/* eslint-disable */
// @ts-nocheck
import React, { useEffect, useState, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Card } from "primereact/card";
import { Tooltip } from "primereact/tooltip";
import { HTTP } from "../config/http-common";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../LoadingSpinner";
import { ArrowUpOutlined, DollarOutlined, SettingOutlined,InfoCircleOutlined } from "@ant-design/icons";
import React from "react";

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
        const newResources = response.data.result.sort((a, b) => 
          (b.cost_new_resources || 0) - (a.cost_new_resources || 0)
        );
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

  const columnLabelsList = [
    {
      field: 'resource_name',
      header: (
        <div>
          Resource 
          {/* <ArrowUpOutlined className="text-xl" style={{ color: "#667084" }} /> */}
        </div>
      )
    },
    {
      field: 'count_new_resources_added',
      header: (
        <div>
          # Newly Added
          {/* <ArrowUpOutlined className="text-xl" style={{ color: "#667084" }} /> */}
        </div>
      )
    },
    {
      field: 'new_resources_added_datekey',
      header: (
        <div>
          Date
          {/* <ArrowUpOutlined className="text-xl" style={{ color: "#667084" }} /> */}
        </div>
      )
    },
    {
      field: 'cost_new_resources',
      header: (
        <div>
          {/* $ Cost */}
          <DollarOutlined className="text-xl" />
        </div>
      )
    }
  ];

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
      value.length > 20 ? `${value.slice(0, 20)}...` : value;
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
            <span className="text-2xl font-medium">New Assets</span>
          </div>
                   {process.env.REACT_APP_INFO_NEW_ASSETS && (
            <>
          <Tooltip
          target={`#new-assets-info`}
           content={
            process.env.REACT_APP_INFO_NEW_ASSETS
          } position="left"/>
            <InfoCircleOutlined id="new-assets-info" className='cursor-pointer text-gray-500 hover:text-gray-700' style={{
              fontSize: '16px',
              color: '#007BFF',
              position: 'absolute',
              right: 10,
              top: 10,
              marginTop: '-3px',
              marginRight: '1px',
              backgroundColor: '#f0f8ff',
              borderRadius: '50%',
              padding: '5px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
          }} />
          </>
          )}
          <div ref={tableRef} style={{ maxHeight: "275px", overflowY: "auto" }}>
            <DataTable
              value={resourcesData}
              scrollable
              className="w-full dashboard-table-update"
              emptyMessage={
                <div className="text-center py-4">
                  <span style={{ color: '#45BA84', fontWeight: 'medium' }}>No new Assets found</span>
                </div>
              }
            >
              {columnLabelsList.map((col) => (
                <Column
                  key={col.field}
                  field={col.field}
                  header={col.header}
                  style={{ 
                    width: col.field === 'resource_name' ? "40%" : 
                           col.field === 'count_new_resources_added' ? "20%" :
                           col.field === 'new_resources_added_datekey' ? "25%" :
                           "15%", // for cost_new_resources
                    whiteSpace: "nowrap" 
                  }}
                  body={(rowData, { rowIndex }) => {
                    if (col.field === "cost_new_resources") {
                      return formatCurrency(rowData[col.field]);
                    }
                    if (col.field === "new_resources_added_datekey") {
                      return formatDate(rowData[col.field]);
                    }
                    return truncatedBodyTemplate(rowData, col.field, rowIndex);
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
