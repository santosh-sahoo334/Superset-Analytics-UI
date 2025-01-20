/* eslint-disable */
// @ts-nocheck
import React from "react";
import { Button } from "primereact/button";
import BudgetUnitPageC from "./Components/BudgetUnitPage";
import CreateBudgetUnitPage from "./create/page";
import { useAuthContext } from "../CsightCommon/context/AuthContext";
import EditBudgetUnitFormPage from "./edit-unit/[unitid]/page";
import ViewBudgetPage from "./view/[budgetid]/page";
import EditBudgetFormPage from "./edit/[budgetid]/page";
import CreateViewBudgetPage from "./view/[budgetid]/create/page";

const CsightBudgetUnit = () => {

  const { 
    budgetUnitSteps, setBudgetUnitSteps, 
    budgetUnitCreate, setBudgetUnitCreate, 
    editBudgetUnit, setEditBudgetUnit,
    budgetUnitData,setBudgetUnitData,
    budgetUnitView,
    setBudgetUnitView,
    budgetData,setBudgetData,
    budgetEditView,setBudgetEditView,
    createNewBudget,setCreateNewBudget
  } = useAuthContext();


  return (
    <div className="w-full h-full  bg-white">
      {!budgetUnitCreate && !budgetUnitView && !budgetEditView && !createNewBudget &&
      !editBudgetUnit && budgetUnitSteps == 0 && <div className="px-2 py-4 w-full  custom-table no-data dashboard-table">
        <div className="flex align-items-center justify-content-between w-full mb-2">
          <h3 className="text-3xl">Budget Unit</h3>
          <Button
            label="Budget Unit"
            className="custom-bg-blue"
            icon="pi pi-plus"
            onClick={() => { 
              setBudgetUnitCreate(true) 
              setBudgetUnitSteps(1)
            }}
          />
        </div>
        <BudgetUnitPageC />
      </div>
      }
      {budgetUnitCreate && !createNewBudget && !budgetEditView && !budgetUnitView && !editBudgetUnit && budgetUnitSteps == 1 && <CreateBudgetUnitPage />}
      {editBudgetUnit && !createNewBudget && !budgetEditView && !budgetUnitView && budgetUnitData && <EditBudgetUnitFormPage />}
      {budgetUnitView && !createNewBudget && !budgetEditView && !budgetUnitCreate && !editBudgetUnit && <ViewBudgetPage />}
      {budgetEditView && !createNewBudget && budgetData && <EditBudgetFormPage />}
      {createNewBudget && budgetUnitData && <CreateViewBudgetPage />}
    </div>

  );
};
export default CsightBudgetUnit;

