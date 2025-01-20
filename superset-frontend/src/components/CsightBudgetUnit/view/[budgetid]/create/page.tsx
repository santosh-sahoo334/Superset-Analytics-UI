/* eslint-disable */
// @ts-nocheck
import { useEffect,  useState } from "react";
import { Button } from "primereact/button";
import { useHistory } from "react-router-dom";
import { HTTP } from "../../../../CsightCommon/config/http-common";
import { useAuth, useAuthContext } from "../../../../CsightCommon/context/AuthContext";
import { useToast } from "../../../../CsightCommon/context/ToastContext";
import AddNewBudgetForm from "../../../Components/AddNewBudgetForm";
import { AddBudgetFormModel } from "../../../Components/intreface";

const CreateViewBudgetPage = () => {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [budgetUnits, setBudgetUnits] = useState<any>([]);
  const [expandAll, setExpandAll] = useState(true);
  const router = useHistory();
  const [selectedBudgetUnit, setSelectedBudgetUnit] = useState<string>("");
  const [isSaveClickedCount, setIsSaveClickedCount] = useState(0);
  const [loading, setLoading] = useState<boolean>(false);
  const { accessToken } = useAuth();


  const { 
    budgetUnitData, setCreateNewBudget
  } = useAuthContext();


  useEffect(() => {
    const getBudgetUnitsData = async () => {
      const params = {
        q: JSON.stringify({
          // page: 1,
          page_size: 1000,
        }),
      };
      const response = await HTTP.get("budgetunit/", {
        params,
        headers: { Authorization: accessToken },
      });
      setBudgetUnits(response.data);
    };
    getBudgetUnitsData();
  }, []);

  const { showToast } = useToast();

  const allocatedBudgetUnit = budgetUnits?.result?.find(
    (item: any) => item.name === selectedBudgetUnit
  );
  const numberOfAllocations =
    selectedBudgetUnit && allocatedBudgetUnit.type.list;
  const [budgetunitInfoType, setBudgetunitInfoType] = useState(
    numberOfAllocations &&
      numberOfAllocations?.map(() => ({ percentage: 0, amount: 0, name: "" })) // Initialize with default values
  );

  const toggleExpandAll = () => setExpandAll((prev) => !prev);

  const addBudget = async (value: AddBudgetFormModel) => {
    try {
      const response = await HTTP.post(
        "budget/",
        {
          ...value,
          amount: value?.amount,
          budgetunit: value.budgetunit,
          start_date: value.start_date,
          end_date: value.end_date,
          budget_alert_flag: false,
        },
        { headers: { Authorization: accessToken } }
      );
      showToast(response?.data?.message, "success", "Success");
      setBudgets([
        ...budgets,
        {
          id: Date.now().toString(),
          ...value,
          amount: value?.amount,
          budgetunit: Number(value.budgetunit),
          start_date: value.start_date,
          end_date: value.end_date,
          budget_alert_flag: false,
          archive: false,
          freeze: false,
        },
      ]);
      // if (response?.status === 201) {

      // }
      // router.goBack();
      setCreateNewBudget(false)
    } catch (error) {
      console.log("Response from budget list post from backend error:", error);
      showToast(
        error?.message || "Error while Saving budget List",
        "error",
        "Error"
      );
    }
  };

  const load = () => {
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  const handleSaveClick = () => {
    setIsSaveClickedCount((prev) => prev + 1);
  };

  return (
    <div className="mx-2">
      <div className="flex justify-content-between p-3 mb-3 horizontal-border align-items-center">
        <div>
          <h4 className="mb-0">Budget/Unit Configuration</h4>
        </div>
        <div>
          <Button
            type="submit"
            label="Save"
            className="p-button-sm mr-2 custom-bg-blue mr-2"
            icon="pi pi-save"
            loading={loading}
            onClick={() => {
              load();
              handleSaveClick();
            }}
          />
          <Button
            severity="warning"
            icon="pi pi-arrow-left"
            className="p-button-sm mr-2"
            onClick={() => {
              setCreateNewBudget(false)
            }}
          />
          {expandAll ? (
            <Button
              severity="warning"
              icon="pi pi-angle-double-up"
              className="p-button-sm"
              onClick={toggleExpandAll}
            />
          ) : (
            <Button
              severity="warning"
              icon="pi pi-angle-double-down"
              className="p-button-sm"
              onClick={toggleExpandAll}
            />
          )}
        </div>
      </div>
      <div>
        <AddNewBudgetForm
          isSaveClickedCount={isSaveClickedCount}
          addBudget={addBudget}
          expandAll={expandAll}
          budgetUnitsData={budgetUnits?.result}
          setSelectedBudgetUnit={setSelectedBudgetUnit}
          numberOfAllocations={numberOfAllocations}
          budgetunitInfoType={budgetunitInfoType}
          setBudgetunitInfoType={setBudgetunitInfoType}
          isCreatePage={true}
        />
      </div>
    </div>
  );
};

export default CreateViewBudgetPage;
