/* eslint-disable */
// @ts-nocheck
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import React, { useEffect, useState } from "react";
import { Tooltip } from "primereact/tooltip";
import moment from "moment";
import { HTTP } from "../../CsightCommon/config/http-common";
import { ProgressSpinner } from "primereact/progressspinner";
import { useHistory } from "react-router-dom";
import { Dialog } from "primereact/dialog";
import { Paginator, PaginatorPageChangeEvent } from "primereact/paginator";
import { useAuth,useAuthContext } from "../../CsightCommon/context/AuthContext";
import { useToast } from "../../CsightCommon/context/ToastContext";
import CustomPaginator from "./customPagination";

const BudgetUnitPage: React.FunctionComponent = ({}) => {
  const [expandedRows] = useState<any>(null);
  const [budgetUnitData, setBudgetUnitData] = useState<any>({});
  const [loading, setLoading] = useState<Boolean>(true);
  const [selectedBudget, setSelectedBudget] = useState<any>(null);
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const router = useHistory();
  const [paginationState, setPaginationState] = useState({
    currentPage: 0,
    countPerPage: 10,
  });
  const maxTextLength = 15;
  const { showToast } = useToast();
  const listColumnsFilter = ["name", "orgname", "created_at", "updated_at"];
  const customHeaders:any = {
    name: "Name",
    orgname: "Organization",
    created_at: "Created At",
    updated_at: "Updated At",
  };
  const { accessToken } = useAuth();

  const { budgetUnitSteps, setBudgetUnitSteps, budgetUnitCreate, setBudgetUnitCreate, editBudgetUnit, setEditBudgetUnit,setBudgetUnitData:setBudgetUnitDataContext,setBudgetUnitView:setBudgetUnitViewContext, budgetRefreshKey } = useAuthContext();

  const getTableData = async () => {
    try {
      const params = {
        q: JSON.stringify({
          page: paginationState.currentPage,
          page_size: paginationState.countPerPage,
        }),
      };
      setLoading(true);
      const resp = await HTTP.get("budgetunit/", {
        params,
        headers: { Authorization: accessToken },
      });
      const data = { ...resp.data };
      setBudgetUnitData(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTableData();
  }, [paginationState, budgetRefreshKey]);

  const handlePageChange = (event: PaginatorPageChangeEvent) => {
    setPaginationState({
      currentPage: event.page,
      countPerPage: event.rows,
    });
  };

  const deleteBudgetUnit = async (unitId: string) => {
    try {
      setLoading(true);
      const resp = await HTTP.delete(`budgetunit/${unitId}`, {
        headers: { Authorization: accessToken },
      });
      if (resp.status === 200) {
        const filteredBudgetunit = budgetUnitData?.result?.filter(
          (b:any) => b.id !== unitId
        );
        setBudgetUnitData((prev:any) => ({ ...prev, result: filteredBudgetunit }));
        showToast(resp?.data?.message, "success", "Success");
      }
    } catch (error) {
      console.log("error in deleting budget unit", error);
      showToast(
        error?.response?.data?.message || "Error while Deleting budget Unit",
        "error",
        "Error"
      );
    } finally {
      setLoading(false);
    }
  };

  const datesCol = (data:any, col:any) => {
    return <>{moment(data[col.field]).format("MM/DD/YYYY h:mm:ss A")}</>;
  };
  const truncatedBodyTemplate = (rowData:any, columnKey:any, rowIndex:any) => {
    const value = rowData[columnKey] || "";
    const truncatedText =
      value.toString().length > maxTextLength
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

  const actionBodyTemplate = (data:any) => {
    return (
      <div className="flex gap-3 align-items-center">
        <Button
          type="button"
          icon="pi pi-pencil "
          className="custom-bg-green"
          style={{padding: "0", width: "30px", height: "30px", fontSize: "10px", color: "#fff"}}
          rounded
          onClick={() => {
            setEditBudgetUnit(true)
            setBudgetUnitDataContext(data)
            // router.push(`/budget-unit/edit-unit/${data.id}`)
          }}
        />
        <Button
          tooltip="View Budget List"
          tooltipOptions={{ position: "bottom" }}
          type="button"
          icon="pi pi-eye"
          className="custom-bg-new-blue"
          style={{padding: "0", width: "30px", height: "30px", fontSize: "10px", color: "#fff"}}
          rounded
          onClick={() => {
            setBudgetUnitViewContext(true)
            setBudgetUnitDataContext(data)
            // router.push(`/budget-unit/view/${data.id}`)
          }
          }
        />
        <Button
          type="button"
          icon="pi pi-trash"
          rounded
          style={{ backgroundColor: "#f04437", border: "none", color: "#fff",padding: "0", width: "30px", height: "30px", fontSize: "10px",color: "#fff" }}
          onClick={() => {
            setSelectedBudget(data);
            setOpenDeleteModal(true);
          }}
        />
      </div>
    );
  };

  return (
    <div className="">
      <Dialog
        header="Confirmation"
        visible={openDeleteModal}
        style={{ width: "400px" }}
        onHide={() => {
          if (!openDeleteModal) return;
          setOpenDeleteModal(false);
        }}
      >
        <div className="flex align-items-center gap-4">
          <i className="pi pi-trash" style={{ fontSize: "40px" }} />
          <p>Are you sure you want to delete {selectedBudget?.name} ?</p>
        </div>
        <div className="flex gap-2 align-items-center mt-4 justify-content-end">
          <Button
            outlined
            className="custom-outlined-light-blue"
            onClick={() => setOpenDeleteModal(false)}
          >
            No
          </Button>
          <Button
            onClick={() => {
              setOpenDeleteModal(false);
              setSelectedBudget(null);
              deleteBudgetUnit(selectedBudget?.id);
            }}
            className="custom-bg-light-blue"
          >
            Yes
          </Button>
        </div>
      </Dialog>
      {loading ? (
        <div className="flex justify-center items-center">
          <ProgressSpinner
            strokeWidth="4"
            aria-label="Loading"
            style={{ color: "#4472c4", width: "50px", height: "50px" }}
            animationDuration="3s"
          />
        </div>
      ) : (
        <div className="border" style={{border: "1px solid #e9ecef", borderRadius: "4px"}}>
          <DataTable
            value={budgetUnitData.result}
            expandedRows={expandedRows}
            dataKey="id"
            scrollable
            scrollHeight="calc(100vh - 225px)" 
            tableStyle={{ minWidth: "60rem" }}
            className="dashboard-table-update budget-table"
          >
            {listColumnsFilter &&
              listColumnsFilter?.map((columnKey:any) => (
                <Column
                  key={columnKey}
                  field={columnKey}
                  header={
                    customHeaders[columnKey] ||
                    budgetUnitData.label_columns?.[columnKey] ||
                    columnKey
                  }
                  body={(rowData, { rowIndex }) =>
                    columnKey === "created_at" || columnKey === "updated_at"
                      ? datesCol(rowData, { field: columnKey })
                      : truncatedBodyTemplate(rowData, columnKey, rowIndex)
                  }
                  headerStyle={{ backgroundColor: "#f2f3f6", color: "#667084" }}
                />
              ))}
            <Column
              exportable={false}
              body={actionBodyTemplate}
              header="Action"
              headerStyle={{ backgroundColor: "#f2f3f6", color: "#667084" }}
            />
          </DataTable>
          {/* <Paginator
            first={paginationState.currentPage * paginationState.countPerPage}
            rows={paginationState.countPerPage}
            rowsPerPageOptions={[10, 25, 50]}
            onPageChange={handlePageChange}
            totalRecords={budgetUnitData?.count}
          /> */}
          <CustomPaginator paginationState={paginationState} budgetUnitData={budgetUnitData} handlePageChange={handlePageChange}/>
        </div>
      )}
    </div>
  );
};

export default BudgetUnitPage;
