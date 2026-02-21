/* eslint-disable */
// @ts-nocheck
import React, { useState } from "react";
import { Button } from "primereact/button";
import BudgetUnitPageC from "./Components/BudgetUnitPage";
import CreateBudgetUnitPage from "./create/page";
import { useAuthContext } from "../CsightCommon/context/AuthContext";
import EditBudgetUnitFormPage from "./edit-unit/[unitid]/page";
import ViewBudgetPage from "./view/[budgetid]/page";
import EditBudgetFormPage from "./edit/[budgetid]/page";
import CreateViewBudgetPage from "./view/[budgetid]/create/page";
import { HomeOutlined, RightOutlined } from "@ant-design/icons";
import CreateBudgetUnitUpdatedPage from "./Components/newCreateForm";
import EditBudgetUnitFormUpdatePage from "./Components/EditBudgetUnitForm";
import AddNewCurrencyBudget from "./Components/AddNewCurrencyBudget";
import CurrencyExchangeRateBudget from "./Components/CurrencyExchangeRateBudget";

const CsightBudgetUnit = () => {
  const [visibleRight,setVisibleRight] = useState(false);
  const [currencyRateCreate,setCurrencyRateCreate] = useState(false);
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
    <div>
      {/* <div className="flex align-items-center mb-2 horizontal-border pb-2 bg-white px-4 py-3 gap-2" style={{margin: "10px 15px", width: "98%", borderRadius: "4px" }}>
        <HomeOutlined className={"text-xl custom-text-light-grey"}/>
        <RightOutlined className={"text-sm custom-text-light-grey"}/>
        <span className="custom-text-light-grey">Budget / </span> 
        <span className="custom-text-grey font-semibold">Budget Unit</span>
      </div> */}
    <div className="h-full  bg-white" style={{margin: "10px 15px", width: "98%", borderRadius: "4px" }}>
      {!budgetUnitView && !budgetEditView && !createNewBudget && <div className="px-2 pb-4 pt-2 w-full  custom-table no-data dashboard-table">
        <div className="flex align-items-center justify-content-between w-full mb-2 horizontal-border pb-2">
          <h3 className="text-2xl custom-text-grey">Budget Unit</h3>
          <div className="flex gap-2 flex-row">
          <Button
            label="Currency Exchange Rate"
            className="custom-bg-light-blue"
            icon="pi pi-dollar"
            onClick={() => { 
              setCurrencyRateCreate(true) 
            }}
          />
          <Button
            label="Budget Unit"
            className="custom-bg-light-blue"
            icon="pi pi-plus"
            onClick={() => { 
              setCurrencyRateCreate(false)
              setBudgetUnitCreate(true) 
              setBudgetUnitSteps(1)
            }}
          />
          </div>
        </div>
        <BudgetUnitPageC />
      </div>
      }
      {budgetUnitCreate && !createNewBudget && !budgetEditView && !budgetUnitView && !editBudgetUnit && budgetUnitSteps == 1 && <CreateBudgetUnitUpdatedPage visibleRight={budgetUnitCreate} setVisibleRight={setBudgetUnitCreate}/>}
      {editBudgetUnit && !createNewBudget && !budgetEditView && !budgetUnitView && budgetUnitData && <EditBudgetUnitFormUpdatePage visibleRight={editBudgetUnit} setVisibleRight={setEditBudgetUnit}/>}
      {budgetUnitView && !createNewBudget && !budgetEditView && !budgetUnitCreate && !editBudgetUnit && <ViewBudgetPage />}
      {budgetEditView && !createNewBudget && budgetData && <EditBudgetFormPage />}
      {createNewBudget && budgetUnitData && <CreateViewBudgetPage />}
      {currencyRateCreate && <CurrencyExchangeRateBudget visible={currencyRateCreate} onHide={() => setCurrencyRateCreate(false)} />}    
    </div>
    </div>
  );
};
export default CsightBudgetUnit;