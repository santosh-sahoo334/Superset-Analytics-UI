/* eslint-disable */
// @ts-nocheck
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
// import EditBudgetForm from "./EditBudgetForm";
import { EditBudgetFormModel } from "./intreface";
import { Tooltip } from "primereact/tooltip";
import moment from "moment";
import { useHistory } from "react-router-dom";
import { useAuthContext } from "../../CsightCommon/context/AuthContext";

interface BudgetPageProps {
  budgets: any[];
  deleteBudget: (id: string) => void;
  updateBudget: (values: EditBudgetFormModel) => void;
  listColumnsFilter: any;
  label_columns: any;
}

const BudgetPage: React.FunctionComponent<BudgetPageProps> = ({
  budgets = [],
  deleteBudget,
  updateBudget,
  listColumnsFilter,
  label_columns,
}) => {
  const [expandedRows, setExpandedRows] = useState(null);
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const [selectedBudget, setSelectedBudget] = useState<any>(null);
  const history = useHistory();
  const maxTextLength = 15;
  const customHeaders = {
    budget_alert_flag: "Alert",
    orgname: "Organization",
    start_date: "Start",
    end_date: "End",
    freeze: "Freeze",
    archive: "Archived",
    name: "Name",
    amount: "Amount",
    period: "Period",
  };


  const { 
    setBudgetData, setBudgetEditView
  } = useAuthContext();

  const cancelExpand = (id: string) => {
    setExpandedRows((er) => {
      const ern = Object.keys(er).filter((k) => k !== id);
      const ner = {};
      ern.forEach((k) => {
        ner[k] = true;
      });
      return ner;
    });
  };

  const actionBodyTemplate = (data) => {
    return (
      <div className="flex gap-3">
        <Button
          type="button"
          icon="pi pi-pencil"
          className="custom-bg-blue-action"
          rounded
          onClick={() => {
            setBudgetData(data)
            setBudgetEditView(true)
            // history.push(`/budget-unit/edit/${data.id}`)
          }}
        />
        <Button
          type="button"
          icon="pi pi-trash"
          rounded
          style={{ backgroundColor: "#FF7F7F", border: "none" }}
          onClick={() => {
            setSelectedBudget(data);
            setOpenDeleteModal(true);
          }}
        />
      </div>
    );
  };
  const datesCol = (data, col) => {
    return <>{moment(data[col.field]).format("MMM-YYYY")}</>;
  };
  const truncatedBodyTemplate = (rowData, columnKey, rowIndex) => {
    const value = rowData[columnKey] || "";
    if (["archive", "budget_alert_flag", "freeze"].includes(columnKey)) {
      if (value) return "true";
      return "false";
    }
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
  return (
    <div className="custom-table">
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
            className="custom-outlined-blue"
            onClick={() => setOpenDeleteModal(false)}
          >
            No
          </Button>
          <Button
            onClick={() => {
              setOpenDeleteModal(false);
              deleteBudget(selectedBudget?.id);
            }}
            className="custom-bg-blue"
          >
            Yes
          </Button>
        </div>
      </Dialog>
      <DataTable
        className="custom-table dashboard-table"
        value={budgets}
        expandedRows={expandedRows}
        // rowExpansionTemplate={rowExpansionTemplate}
        dataKey="id"
        tableStyle={{ minWidth: "60rem" }}
      >
        {/* {BudgetColumns?.map((item) => {
          return <Column {...item} />;
        })} */}
        {listColumnsFilter &&
          listColumnsFilter?.map((columnKey) => (
            <Column
              key={columnKey}
              field={columnKey}
              header={
                customHeaders[columnKey] ||
                label_columns[columnKey] ||
                columnKey
              }
              body={(rowData, { rowIndex }) =>
                columnKey === "start_date" || columnKey === "end_date"
                  ? datesCol(rowData, { field: columnKey })
                  : truncatedBodyTemplate(rowData, columnKey, rowIndex)
              }
              headerStyle={{ backgroundColor: "#0032a5", color: "#ffffff" }}
            />
          ))}
        <Column
          exportable={false}
          body={actionBodyTemplate}
          header="Action"
          headerStyle={{ backgroundColor: "#0032a5", color: "#ffffff" }}
        />
      </DataTable>
    </div>
  );
};

export default BudgetPage;
