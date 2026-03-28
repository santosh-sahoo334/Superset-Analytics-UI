/* eslint-disable */
// @ts-nocheck
import { Button } from "primereact/button";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useHistory, useParams, useLocation } from "react-router-dom";
import { ProgressSpinner } from "primereact/progressspinner";
import { EditBudgetFormModel } from "../../Components/intreface";
import { HTTP } from "../../../CsightCommon/config/http-common";
import { useAuth,useAuthContext } from "../../../CsightCommon/context/AuthContext";
import { useToast } from "../../../CsightCommon/context/ToastContext";
import BudgetPage from "../../Components/BudgetPage";

const ViewBudgetPage = () => {
  const [budgets, setBudgets] = useState<any[]>([]);

  const [loading, setLoading] = useState<Boolean>(true);
  const [budgetData, setBudgetData] = useState<any>({});
  const token = Cookies.get("accessToken");
  const router = useHistory();
  const { pathname: currentPath } = useLocation();
  const { accessToken } = useAuth();
  const { showToast } = useToast();

  const { budgetUnitSteps, setBudgetUnitSteps,
    budgetUnitCreate, setBudgetUnitCreate,
    editBudgetUnit, setEditBudgetUnit,
    budgetUnitData,setBudgetUnitData,
    budgetUnitView,setCreateNewBudget,
    setBudgetUnitView, budgetRefreshKey } = useAuthContext();


  // get Budget & Budget Unit Data
  useEffect(() => {
    const getBudgets = async () => {
      try {
        const params = {
          q: JSON.stringify({
            // page: 1,
            page_size: 1000,
          }),
        };
        const response = await HTTP.get(`budget/`, {
          params,
          headers: { Authorization: accessToken },
        });
        const data = {
          ...response.data,
          result: response.data.result.filter(
            (item) => item.budgetunit == budgetUnitData?.id
          ),
        };
        setBudgetData(data);
      } catch (error) {
        console.error("Failed to fetch Budget Unit:", error);
      } finally {
        setLoading(false);
      }
    };
    getBudgets();
  }, [token, budgets, budgetRefreshKey]);

  const { result, list_columns, label_columns } = budgetData;
  const listColumnsFilter = list_columns?.filter(
    (column) =>
      ![
        "budgetunit_info",
        "budgetunit",
        "created_by",
        "updated_by",
        "updated_at",
        "id",
        "created_at",
      ].includes(column)
  );

  const updateBudget = (values: EditBudgetFormModel) => {};

  const deleteBudget = async (id: string) => {
    try {
      const resp = await HTTP.delete(`budget/${id}`, {
        headers: { Authorization: accessToken },
      });
      if (resp.status === 200) {
        setBudgets((budgets) => budgets.filter((b) => b.id !== id));
      }
      showToast(resp?.data?.message, "success", "Success");
    } catch (error) {
      console.error("Failed to delete budget:", error);
      showToast("Error while Deleting budget List", "error", "Error");
    }
  };
  return (
    <div className="mx-2" style={{height: "calc(100vh - 150px)"}}>
      <div className="flex justify-content-between py-2 px-0 mb-3 horizontal-border align-items-center">
        <div className="flex gap-1 align-items-center">
          {/* <h4 className="mb-0">Budget List</h4> */}
          <Button
            tooltip="Back"
            tooltipOptions={{ position: "bottom" }}
            icon="pi pi-arrow-left"
            onClick={() => {
              setBudgetUnitView(false)
              setBudgetUnitData(null)
            }}
            className="custom-text-grey"
            style={{backgroundColor: "transparent", border: "none" , padding: "0"}}
          />
          <h3 className="text-2xl custom-text-grey m-0">View Budget</h3>
        </div>
        <div>
          <Button
            label="Budget"
            className="custom-bg-light-blue mr-2 "
            icon="pi pi-plus"
            onClick={() => {
              setCreateNewBudget(true)
              // router.push(`${currentPath}/create`)}
            }}
          />
          {/* <Button
            tooltip="Back"
            tooltipOptions={{ position: "bottom" }}
            icon="pi pi-arrow-left"
            severity="warning"
            onClick={() => {
              setBudgetUnitView(false)
              setBudgetUnitData(null)
            }}
          /> */}
        </div>
      </div>
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
        <BudgetPage
          budgets={budgetData}
          deleteBudget={deleteBudget}
          updateBudget={updateBudget}
          listColumnsFilter={listColumnsFilter}
          label_columns={label_columns}
        />
      )}
    </div>
  );
};
export default ViewBudgetPage;
