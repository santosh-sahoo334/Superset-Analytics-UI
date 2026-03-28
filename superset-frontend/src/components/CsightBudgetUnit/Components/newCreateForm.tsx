/* eslint-disable */
import { useEffect, useState } from 'react';
import { AddBudgetFormModel } from '../Components/intreface';
import { Button } from 'primereact/button';
import Stepper from '../Components/Stepper';
import { useHistory } from 'react-router-dom';
import { HTTP } from '../../CsightCommon/config/http-common';
import {
  useAuth,
  useAuthContext,
} from '../../CsightCommon/context/AuthContext';
import AddNewBudgetUnitForm from '../Components/AddNewBudgetUnitForm';
import AddNewBudgetForm from '../Components/AddNewBudgetForm';
import { Sidebar } from 'primereact/sidebar';
import AddNewBudgetUnitFormUpdated from './AddNewBudgetUnitFormUpdate';
import AddNewBudgetFormUpdated from './AddNewBudgetFormUpdated';

const steps = [
  { label: 'Budget Unit', view: 'budget_unit' },
  { label: 'Budget', view: 'budget' },
];
const CreateBudgetUnitUpdatedPage = ({ visibleRight, setVisibleRight }) => {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [budgetUnits, setBudgetUnits] = useState<any>([]);
  const [activeView, setActiveView] = useState('budget_unit');
  const [expandAll, setExpandAll] = useState(true);
  const [selectedBudgetUnit, setSelectedBudgetUnit] = useState<string>('');
  const [budgetUnitdataCreated, setBudgetUnitdata] = useState({});
  const { accessToken } = useAuth();

  const {
    budgetUnitSteps,
    setBudgetUnitSteps,
    budgetUnitCreate,
    setBudgetUnitCreate,
    editBudgetUnit,
    setEditBudgetUnit,
    setBudgetRefreshKey,
  } = useAuthContext();

  useEffect(() => {
    const getBudgetUnitsData = async () => {
      const response = await HTTP.get('budgetunit/', {
        headers: { Authorization: accessToken },
      });
      setBudgetUnits(response.data);
    };
    getBudgetUnitsData();
  }, []);
  const [viewsCompleted, setViewsCompleted] = useState<any>({
    budget_unit: false,
    budget: false,
  });

  // const allocatedBudgetUnit = budgetUnits?.result?.find(
  //   (item: any) => item.name === selectedBudgetUnit
  // );
  // const numberOfAllocations =
  //   selectedBudgetUnit && allocatedBudgetUnit?.type?.list;
  const [numberOfAllocations, setNumberOfAllocations] = useState([]);
  const [budgetunitInfoType, setBudgetunitInfoType] = useState(
    numberOfAllocations &&
      numberOfAllocations?.map(() => ({ percentage: 0, amount: 0, name: '' })), // Initialize with default values
  );
  const checkEditView = (value: string) => {
    return activeView === value;
  };
  const checkStepIsDone = (view: any) => {
    return viewsCompleted?.[view];
  };

  const toggleExpandAll = () => setExpandAll(prev => !prev);

  const handleView = (view: string) => {};
  const addBudget = async (value: AddBudgetFormModel) => {
    try {
      await HTTP.post(
        'budget/',
        {
          ...value,
          amount: value?.amount,
          budgetunit: Number(value.budgetunit),
          start_date: value.start_date,
          end_date: value.end_date,
          budget_alert_flag: false,
        },
        { headers: { Authorization: accessToken } },
      );
      setBudgets([
        ...budgets,
        {
          id: Date.now().toString(),
          ...value,
          amount: value?.amount,
          budgetunit: Number(value.budgetunit),
          start_date: value.start_date.toISOString().split('T')[0],
          end_date: value.end_date.toISOString().split('T')[0],
          budget_alert_flag: false,
          archive: false,
          freeze: false,
        },
      ]);
      setViewsCompleted((prevState: any) => ({
        ...prevState,
        budget: true,
      }));
      setBudgetRefreshKey(prev => prev + 1);
      setBudgetUnitSteps(0);
      setBudgetUnitCreate(false);
    } catch (error) {
      console.log('Response from budget list post from backend error:', error);
    }
  };

  const addBudgetUnit = async (value: any) => {
    try {
      const response = await HTTP.post(
        'budgetunit/',
        {
          name: value.name,
          orgname: value.orgname,
          type: { list: value.type },
        },
        { headers: { Authorization: accessToken } },
      );
      setBudgetUnitdata({
        id: response?.data?.id,
        name: value.name,
        orgname: value.orgname,
        type: { list: value.type },
        code: value.name,
      });
      setBudgetunitInfoType(
        value.type?.map(() => ({ percentage: 0, amount: 0, name: '' })),
      );
      setNumberOfAllocations(value?.type || []);
      setActiveView('budget');
      setViewsCompleted((prevState: any) => ({
        ...prevState,
        budget_unit: true,
      }));
    } catch (error) {
      console.error('Failed to add budget unit:', error);
    }
  };

  return (
    <Sidebar
      visible={visibleRight}
      position="right"
      onHide={() => setVisibleRight(false)}
      style={{ width: '600px' }}
    >
      <div className="mx-2 bg-white h-full">
        <div className="flex justify-content-center p-3 mb-3 horizontal-border align-items-center">
          <div>
            <h4 className="mb-0">Create Budget Unit</h4>
          </div>
          {/* <div>
            <Button
              severity="warning"
              icon="pi pi-arrow-left"
              className="p-button-sm mr-2"
              onClick={() => {
                if (budgetUnitSteps == 1) {
                  setBudgetUnitSteps(0);
                  setBudgetUnitCreate(false);
                } else {
                  setBudgetUnitSteps(budgetUnitSteps - 1);
                }
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
          </div> */}
        </div>
        <div className="create-budget-unit-form">
          <Stepper
            steps={steps}
            checkEditView={checkEditView}
            checkStepIsDone={checkStepIsDone}
            handleView={handleView}
          />
        </div>
        <div className="mx-0" style={{height: "85%"}}>
          {activeView === 'budget_unit' && (
            <AddNewBudgetUnitFormUpdated
              addBudgetUnit={addBudgetUnit}
              expandAll={expandAll}
              setVisibleRight={setVisibleRight}
            />
          )}
          {/* activeView === "budget" && */}
          {activeView === 'budget' && (
            <AddNewBudgetFormUpdated
              budgetUnitdataCreated={budgetUnitdataCreated}
              isSaveClickedCount={0}
              addBudget={(value: any) => addBudget(value)}
              expandAll={expandAll}
              budgetUnitsData={budgetUnits?.result}
              setSelectedBudgetUnit={setSelectedBudgetUnit}
              numberOfAllocations={numberOfAllocations}
              budgetunitInfoType={budgetunitInfoType}
              setBudgetunitInfoType={setBudgetunitInfoType}
              setVisibleRight={setVisibleRight}
            />
          )}
        </div>
      </div>
    </Sidebar>
  );
};

export default CreateBudgetUnitUpdatedPage;
