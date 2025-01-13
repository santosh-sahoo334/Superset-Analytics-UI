/* eslint-disable */
// @ts-nocheck
import { Button } from "primereact/button";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useHistory, useParams, useLocation } from "react-router-dom";
import { ProgressSpinner } from "primereact/progressspinner";
import { EditBudgetFormModel } from "../../Components/intreface";
import { HTTP } from "../../../../config/http-common";
import { useAuth } from "../../../../context/AuthContext";
import { useToast } from "../../../../context/ToastContext";
import BudgetPage from "../../Components/BudgetPage";

const ViewBudgetPage = () => {
  const [budgets, setBudgets] = useState<any[]>([]);

  const [loading, setLoading] = useState<Boolean>(true);
  const [budgetData, setBudgetData] = useState<any>({});
  const token = Cookies.get("accessToken");
  const router = useHistory();
  const { budgetid } = useParams();
  const { pathname: currentPath } = useLocation();
  const { accessToken } = useAuth();
  const { showToast } = useToast();
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
            (item) => item.budgetunit == budgetid
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
  }, [token, budgets]);

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
    <div className="mx-2">
      <div className="flex justify-content-between p-3 px-0 mb-3 horizontal-border align-items-center">
        <div>
          <h4 className="mb-0">Budget List</h4>
        </div>
        <div>
          <Button
            label="Budget"
            className="custom-bg-blue mr-2 "
            icon="pi pi-plus"
            onClick={() => router.push(`${currentPath}/create`)}
          />
          <Button
            tooltip="Back"
            tooltipOptions={{ position: "bottom" }}
            icon="pi pi-arrow-left"
            severity="warning"
            onClick={() => router.goBack()}
          />
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
          budgets={result}
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
