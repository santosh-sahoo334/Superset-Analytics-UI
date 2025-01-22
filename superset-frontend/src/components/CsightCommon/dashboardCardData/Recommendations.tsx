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
import { ArrowUpOutlined, DollarOutlined, SettingOutlined } from "@ant-design/icons";

const TruncatedHeader = ({ text }: { text: string }) => {
  const truncatedText = text.length > 10 ? `${text.slice(0, 10)}...` : text;
  // Sanitize the ID by removing special characters and spaces
  const tooltipId = `header-${text.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`;
  
  return (
    <>
      <span id={tooltipId}>{truncatedText}</span>
      {text.length > 10 && <Tooltip target={`#${tooltipId}`} content={text} />}
    </>
  );
};

export const RecommendationsTable = () => {
  const [recommenddationsData, setRecommendationsData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [pageSize] = useState<number>(5); // Number of rows to fetch per page
  const tableRef = useRef<HTMLDivElement>(null); // Ref for scrollable table container
  const { accessToken } = useAuth();

  // Fetch data for the table
  const getRecommendations = async (page: number) => {
    try {
      setTableLoading(true);
      const params = {
        q: JSON.stringify({
          page: page,
          page_size: pageSize,
        }),
      };
      const response = await HTTP.get("/recommendations/", {
        params,
        headers: { Authorization: accessToken },
      });
      if (response.data) {
        const newRecommendations = response.data.result;
        setRecommendationsData((prevData) => [...prevData, ...newRecommendations]);
        setHasMore(newRecommendations.length === pageSize); // Check if more data is available
      }
    } catch (error) {
      console.error("Failed to fetch recommendations:", error);
    } finally {
      setLoading(false);
      setTableLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    getRecommendations(0);
  }, []);

  // Scroll handler for infinite scrolling
  const handleScroll = () => {
    if (!tableRef.current || !hasMore || tableLoading) return;
    const { scrollTop, scrollHeight, clientHeight } = tableRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      getRecommendations(nextPage);
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

  const customizeLabels = {
    billing_account_name: (
      <div>
        <TruncatedHeader text="Account" />
      </div>
    ),
    service_name: (
      <div>
        <TruncatedHeader text="Resource" />
      </div>
    ),
    service_component: (
      <div>
        <TruncatedHeader text="Component" />
      </div>
    ),
    recommendation_message: (
      <div>
        <TruncatedHeader text="Recommendation" />
      </div>
    ),
    current_cost: (
      <div>
        <TruncatedHeader text="Current $" />
      </div>
    ),
    proposed_cost: (
      <div>
        <TruncatedHeader text="Proposed $" />
      </div>
    ),
    datekey: (
      <div>
        <TruncatedHeader text="Month" />
      </div>
    ),
  };

  // Function to truncate text and add tooltip
  const truncatedBodyTemplate = (rowData:any, columnKey:any, rowIndex:any, maxTextLength:any) => {
    const value = rowData[columnKey] || "";
    const truncatedText = value.length > maxTextLength ? `${value.slice(0, maxTextLength)}...` : value;
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

  // Define column order
  const columnOrder = [
    'billing_account_name',
    'service_name',
    'service_component',
    'recommendation_message',
    'current_cost',
    'proposed_cost',
    'datekey'
  ];

  return (
    <Card title="" className="w-full h-full relative pr-1">
      {loading ? (
        <div className="flex justify-center items-center">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          <div className="flex justify-start title-card gap-2 p-2 title-color">
            <img
              src={
                '/static/assets/images/circle-check-big.png'
              }
              alt="piggy-bank"
              width={30}
              height={30}
              className="text-sm p-1"
            />
            <span className="text-2xl font-medium">Recommendations</span>
          </div>
          <div ref={tableRef} style={{ maxHeight: "300px", overflowY: "auto" }}>
            <DataTable
              value={recommenddationsData}
              scrollable
              className="w-full dashboard-table-update  h-full"
            >
              {columnOrder.map((columnKey) => (
                <Column
                  key={columnKey}
                  field={columnKey}
                  header={customizeLabels[columnKey] || columnKey}
                  body={(rowData, { rowIndex }) => {
                    if (columnKey === "current_cost" || columnKey === "proposed_cost") {
                      return formatCurrency(rowData[columnKey]);
                    }
                    return truncatedBodyTemplate(rowData, columnKey, rowIndex, 10);
                  }}
                  headerStyle={{ backgroundColor: "#f2f3f6", color: "#667084", width: columnKey === "recommendation_message" ? '120px' : columnKey === "service_name" ? "95px" : "80px" }}
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

export default RecommendationsTable;
