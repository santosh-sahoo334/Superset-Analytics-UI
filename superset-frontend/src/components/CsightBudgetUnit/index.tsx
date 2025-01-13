/* eslint-disable */
import { Button } from "primereact/button";
import BudgetUnitPageC from "./Components/BudgetUnitPage";
import { useHistory } from "react-router-dom";

const CsightBudgetUnit = () => {
  const history = useHistory();

  return (
    <div className="px-2 py-4 w-full">
      <div className="flex align-items-center justify-content-between w-full mb-2">
        <h3>Budget Unit</h3>
        <Button
          label="Budget Unit"
          className="custom-bg-blue"
          icon="pi pi-plus"
          onClick={() => history.push("/budget-unit/create")}
        />
      </div>
      <BudgetUnitPageC />
    </div>
  );
};
export default CsightBudgetUnit;

