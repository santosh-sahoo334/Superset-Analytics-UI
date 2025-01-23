/* eslint-disable */
// @ts-nocheck
import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Checkbox } from 'primereact/checkbox';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import BudgetUnitAllocationTable from '../../Components/BudgetUnitAllocationTable';
import { EditBudgetFormModel } from '../../Components/intreface';
import { useParams, useHistory } from 'react-router-dom';
import { HTTP } from '../../../CsightCommon/config/http-common';
import moment from 'moment';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useAuth } from '../../../CsightCommon/context/AuthContext';
import { Dialog } from 'primereact/dialog';
import { useToast } from '../../../CsightCommon/context/ToastContext';
import FieldWrapper from '../../Components/FieldWrapper';
import { useAuthContext } from '../../../CsightCommon/context/AuthContext';
import { Switch } from 'src/components/Switch';

const schema: yup.ObjectSchema<EditBudgetFormModel> = yup.object().shape({
  name: yup.string().required('Name is required field'),
  orgname: yup.string().required('Organization Name is required field'),
  budgetunit: yup.string().required('Budget unit is required field'),
  amount: yup.number().moreThan(0).required('Amount must be greater than zero'),
  period: yup.string().required('Period is required field'),
  start_date: yup.date().required('Start date is a required field'),
  end_date: yup
    .date()
    .required('End date is required field')
    .min(yup.ref('start_date'), 'End date must be after the start date'),
  budget_alert_flag: yup.boolean().optional(),
  archive: yup.boolean().optional(),
  freeze: yup.boolean().optional(),
});

const EditBudgetFormPage: React.FunctionComponent = () => {
  const { budgetData } = useAuthContext();
  const [budgetUnitsData, setBudgetUnitsData] = useState<any>([]);
  const [data, setData] = useState<any>(null);
  const [budgetsListData, setBudgetsListData] = useState<any>([]);
  const [allocations, setAllocations] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [checkCalculated, setCheckCalculated] = useState<boolean>(false);
  const [isAllocationChange, setIsAllocationChange] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty, dirtyFields },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const { setBudgetEditView, setBudgetData } = useAuthContext();

  const [tableData, setTableData] = useState<any[]>([]);
  const [selectedBudgetUnit, setSelectedBudgetUnit] = useState<any>({});
  const [openEditModal, setOpenEditModal] = useState<boolean>(false);

  const router = useHistory();
  const [expandAll, setExpandAll] = useState(true);
  const [isPeriodManualChange, setIsPeriodManualChange] = useState(false);
  const periods = [
    { name: 'Monthly', code: 'monthly' },
    { name: 'Quarterly', code: 'quarterly' },
    { name: 'Yearly', code: 'yearly' },
  ];

  const period = watch('period');
  const startDate = watch('start_date');
  const endDate = watch('end_date');
  const budgetUnit = watch('budgetunit');
  const amount = watch('amount');
  // const [budgetunitInfoType, setBudgetunitInfoType] = useState<any>(
  //   data?.budgetunit_info?.type
  // );
  const { showToast } = useToast();
  const [totalAllocationsPercentage, seTotalAllocationsPercentage] =
    useState<number>(0);

  const [budgetunitInfoType, setBudgetunitInfoType] = useState<any>({
    type: data?.budgetunit_info?.type,
  });
  const [updateFilterCount, setUpdateFilterCount] = useState(0);
  const { accessToken } = useAuth();
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [budgetResponse, budgetsListResponse, budgetUnitsResponse] =
          await Promise.all([
            HTTP.get(`budget/${budgetData?.id}`, {
              headers: { Authorization: accessToken },
            }),
            HTTP.get('budget/', { headers: { Authorization: accessToken } }),
            HTTP.get('budgetunit/', {
              headers: { Authorization: accessToken },
            }),
          ]);

        setData(budgetResponse?.data?.result);
        setBudgetsListData(budgetsListResponse?.data?.result);

        setBudgetUnitsData(budgetUnitsResponse?.data?.result);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  const events = { shouldDirty: true, shouldTouch: true, shouldValidate: true };
  const getSelectedBudgetUnit = async (id: string) => {
    const resp = await HTTP.get(`budgetunit/${id}`, {
      headers: { Authorization: accessToken },
    });

    setSelectedBudgetUnit(resp?.data?.result);
    setAllocations(resp?.data?.result?.type?.list);
  };
  useEffect(() => {
    if (budgetUnit) {
      getSelectedBudgetUnit(budgetUnit);
    }
  }, [budgetUnit]);

  const toggleExpandAll = () => setExpandAll(prev => !prev);

  const claculateAllocations = () => {
    if (
      (period === 'monthly' || period === 'quarterly') &&
      startDate &&
      endDate
    ) {
      setBudgetunitInfoType((prev: any) => {
        return generateMonthlyOrQuarterlyBudget(startDate, endDate, prev);
      });
    }

    if (period === 'yearly' && startDate && endDate) {
      setBudgetunitInfoType((prev: any) => {
        const typesArray = Array.isArray(prev) ? prev : prev?.type || [];
        const newData = typesArray?.map((type: any) => {
          let alloctedAmount = type?.amount;
          if (amount) {
            const percentage = type?.percentage;
            if (percentage) {
              alloctedAmount = amount * (percentage / 100);
            }
          }
          return {
            ...type,
            name: type?.name,
            percentage: type?.percentage,
            amount: alloctedAmount,
          };
        });
        transformData('yearly', newData);
        return { type: newData };
      });
    }
    setUpdateFilterCount(prev => prev + 1);
    // setCheckCalculated(true);
  };
  const isAmountDirty = !!dirtyFields.amount;
  const updateBudget = async values => {
    try {
      let updatePrevInfoType = null;

      if (isAmountDirty || isAllocationChange) {
        claculateAllocations();
      }
      setBudgetunitInfoType(prev => {
        updatePrevInfoType = prev;
        return prev;
      });

      setTimeout(async () => {
        try {
          const budgetunit_info_type = Array.isArray(updatePrevInfoType)
            ? { type: updatePrevInfoType }
            : updatePrevInfoType;
          const resp = await HTTP.put(
            `budget/${budgetData?.id}`,
            {
              name: values?.name,
              start_date: values?.start_date,
              end_date: values?.end_date,
              amount: values?.amount,
              budget_alert_flag: values?.budget_alert_flag,
              budgetunit_info: budgetunit_info_type,
              freeze: values?.freeze,
              archive: values?.archive,
              budgetunit: values?.budgetunit,
              period: values?.period,
            },
            { headers: { Authorization: accessToken } },
          );
          showToast('Record successfully Updated', 'success', 'Success');

          if (budgetUnit) {
            // router.push(`/budget-unit/view/${budgetUnit}`);
            setBudgetEditView(false);
            setBudgetData(null);
          }
        } catch (error) {
          showToast(error.message || 'Error while updating', 'error', 'Error');
          console.log(error);
        }
      }, 200);
    } catch (error) {
      showToast(error.message || 'Error while updating', 'error', 'Error');
      console.log('error while updating budget list', error);
    }
  };

  const handleAllocationChange = (
    index: number,
    allocatedType: string,
    value: number,
  ) => {
    setBudgetunitInfoType(prev => {
      const updatedAllocations = [
        ...(Array.isArray(prev) ? prev : prev?.type || []),
      ];

      return updatedAllocations?.map((item, index1) => {
        if (index === index1) {
          return {
            ...item,
            percentage: value,
          };
        }
        return item;
      });
    });
  };
  const generateMonthlyOrQuarterlyBudget = (
    startDate,
    endDate,
    types: any = [],
  ) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const monthNames = [
      'january',
      'february',
      'march',
      'april',
      'may',
      'june',
      'july',
      'august',
      'september',
      'october',
      'november',
      'december',
    ];
    const typesArray = Array.isArray(types) ? types : types?.type || [];
    // Initialize the budgetunit_info object

    const budgetunit_info = {
      type: typesArray?.map(type => {
        let allocatedAmount = type?.amount;
        if (amount) {
          const percentage = type?.percentage;
          if (percentage) {
            allocatedAmount = amount * (percentage / 100);
          }
        }

        if (period === 'monthly') {
          const monthsData = {};
          let currentMonth = new Date(start);
          const endMonth = new Date(endDate);

          const totalMonths =
            (end.getFullYear() - start.getFullYear()) * 12 +
            (end.getMonth() - start.getMonth() + 1);
          const monthlyAmount = allocatedAmount / totalMonths;
          let startYearEndMonth = 11;

          if (currentMonth.getFullYear() === endMonth.getFullYear()) {
            startYearEndMonth = endMonth.getMonth();
          }
          // Loop for Start Year Months
          for (
            let index = currentMonth.getMonth();
            index <= startYearEndMonth;
            index++
          ) {
            const month = monthNames[index];
            monthsData[month] =
              typeof type['month']?.[monthNames[index]] === 'object'
                ? type['month']?.[monthNames[index]]
                : monthlyAmount;
          }

          if (currentMonth.getFullYear() !== endMonth.getFullYear()) {
            // Loop for Next Year Months
            for (let index = 0; index <= endMonth.getMonth(); index++) {
              const month = monthNames[index];

              monthsData[month] =
                typeof type['month']?.[monthNames[index]] === 'object'
                  ? type['month']?.[monthNames[index]]
                  : monthlyAmount;
            }
          }

          return {
            name: type.name,
            amount: allocatedAmount,
            percentage: type.percentage,
            month: monthsData,
          };
        }
        const startYear = start.getFullYear();
        const quarters = {};

        let startQuarter = Math.ceil((start.getMonth() + 1) / 3);
        let endQuarter = Math.ceil((end.getMonth() + 1) / 3);
        let totalQuarters = 0;
        const endYear = end.getFullYear();
        if (startYear === endYear) {
          totalQuarters = endQuarter - startQuarter + 1;
        } else {
          totalQuarters =
            4 - startQuarter + 1 + (endQuarter + (endYear - startYear - 1) * 4);
        }
        const quarterlyAmount = allocatedAmount / totalQuarters;

        let currentQuarter = startQuarter;
        let currentYear = startYear;

        while (
          currentYear < endYear ||
          (currentYear === endYear && currentQuarter <= endQuarter)
        ) {
          const quarterKey = `Q${currentQuarter}`;
          quarters[quarterKey] =
            typeof type['quarterly']?.[quarterKey] === 'object'
              ? type['quarterly']?.[quarterKey]
              : quarterlyAmount;

          if (currentQuarter === 4) {
            currentQuarter = 1;
            currentYear++;
          } else {
            currentQuarter++;
          }
        }

        return {
          name: type.name,
          amount: allocatedAmount,
          percentage: type.percentage,
          quarterly: quarters,
        };
      }),
    };

    transformData(period, budgetunit_info?.type);
    return budgetunit_info;
  };

  const transformData = (type, data) => {
    const td =
      data?.map(item => {
        const base = { name: item.name, amount: item.amount, misc_amount: 0 };
        if (type === 'quarterly') return { ...base, ...item.quarterly };
        if (type === 'monthly') return { ...base, ...item.month };

        return base; // Yearly
      }) || [];
    setTableData(td);
  };

  const calculateTotalPercentage = () => {
    const budgetunit_info = Array.isArray(budgetunitInfoType)
      ? budgetunitInfoType
      : budgetunitInfoType?.type || [];
    const totalAllocations = budgetunit_info?.reduce(
      (total, curItem) => total + curItem.percentage,
      0,
    );
    seTotalAllocationsPercentage(totalAllocations);
  };

  useEffect(() => {
    if (data) {
      setValue('name', data?.name, events);
      setValue('orgname', data?.orgname, events);
      setValue('amount', data?.amount, events);
      setValue('period', data?.period, events);
      setValue('budgetunit', data?.budgetunit, events);
      setValue('start_date', new Date(data?.start_date), events);
      setValue('end_date', new Date(data?.end_date), events);
      setValue('freeze', data?.freeze || false, events);
      setValue('budget_alert_flag', data?.budget_alert_flag || false, events);
      setValue('archive', data?.archive || false, events);
      reset({
        name: data?.name || '',
        orgname: data?.orgname,
        amount: data?.amount,
        period: data?.period,
        budgetunit: data?.budgetunit,
        start_date: new Date(data?.start_date),
        end_date: new Date(data?.end_date),
        freeze: data?.freeze || false,
        budget_alert_flag: data?.budget_alert_flag || false,
        archive: data?.archive || false,
      });
      if (data?.budgetunit) {
        // getSelectedBudgetUnit(budgetUnit);
        const budgetData = budgetsListData.find(
          b => b.budgetunit === data?.budgetunit,
        );

        if (budgetData) {
          // setData(budgetData);
          setBudgetunitInfoType({ type: data?.budgetunit_info?.type });
        }
      }

      transformData(data.period, data.budgetunit_info?.type);
    }
  }, [data, budgetUnitsData]);

  useEffect(() => {
    calculateTotalPercentage();
  }, [amount, budgetunitInfoType]);

  useEffect(() => {
    claculateAllocations();
  }, [isPeriodManualChange]);

  const load = () => {
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="mx-2 edit_budget_page">
      {loading && !data ? (
        <div className="flex justify-center items-center">
          <ProgressSpinner
            strokeWidth="4"
            aria-label="Loading"
            style={{ color: '#4472c4', width: '50px', height: '50px' }}
            animationDuration="3s"
          />
        </div>
      ) : (
        <form
          onSubmit={handleSubmit(updateBudget)}
          className="flex gap-1 flex-column w-full"
        >
          <Dialog
            header="Confirmation"
            visible={openEditModal}
            style={{ width: '400px' }}
            onHide={() => {
              if (!openEditModal) return;
              setOpenEditModal(false);
            }}
          >
            <div className="flex align-items-center gap-4">
              <i className="pi pi-user-edit" style={{ fontSize: '40px' }} />
              <p>
                Budget amount is not calculated. Are you sure want to update ?
              </p>
            </div>
            <div className="flex gap-2 align-items-center mt-4 justify-content-end">
              <Button
                outlined
                className="custom-outlined-light-blue"
                onClick={() => setOpenEditModal(false)}
              >
                No
              </Button>
              <Button
                onClick={() => {
                  // updateBudget;
                  handleSubmit(updateBudget)();
                  setOpenEditModal(false);
                }}
                className="custom-bg-light-blue"
              >
                Yes
              </Button>
            </div>
          </Dialog>
          <div className="flex justify-content-between p-3 pl-0 mb-3 horizontal-border align-items-center">
            {/* <div>
              <h4 className="mb-0">Edit Budget</h4>
            </div> */}
            <div className="flex gap-1 align-items-center">
              {/* <h4 className="mb-0">Budget List</h4> */}
              <Button
                tooltip="Back"
                tooltipOptions={{ position: 'bottom' }}
                icon="pi pi-arrow-left"
                onClick={() => {
                  setBudgetEditView(false);
                  setBudgetData(null);
                }}
                className="custom-text-grey"
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  padding: '0',
                }}
              />
              <h3 className="text-2xl custom-text-grey m-0">Edit Budget</h3>
            </div>
            <div>
              <Button
                type="button"
                label="Update"
                loading={loading}
                disabled={!(isAllocationChange || isDirty || checkCalculated)}
                className="p-button-sm mr-2 custom-bg-light-blue"
                icon="pi pi-save"
                onClick={() => {
                  if (totalAllocationsPercentage !== 100) {
                    showToast(
                      'Total Allocations must be 100',
                      'error',
                      'Error',
                    );
                    return;
                  }
                  if (
                    !checkCalculated &&
                    (isAmountDirty || isAllocationChange)
                  ) {
                    setOpenEditModal(true);
                  } else {
                    load();
                    handleSubmit(updateBudget)();
                  }
                }}
              />
              {/* <Button
                type="button"
                severity="warning"
                icon="pi pi-arrow-left"
                className="p-button-sm mr-2"
                onClick={() => {            
                  setBudgetEditView(false)  
                  setBudgetData(null)
                }}
              />
              {expandAll ? (
                <Button
                  type="button"
                  severity="warning"
                  icon="pi pi-angle-double-up"
                  className="p-button-sm"
                  onClick={toggleExpandAll}
                />
              ) : (
                <Button
                  type="button"
                  severity="warning"
                  icon="pi pi-angle-double-down"
                  className="p-button-sm"
                  onClick={toggleExpandAll}
                />
              )} */}
            </div>
          </div>
          {/* <div className="flex align-items-center justify-content-between mb-6">
          <h4>Edit Budget</h4>
          <div className="flex align-items-center gap-2">
            <Button
              label="Cancel"
              outlined
              onClick={() => hideExpand(data.id.toString())}
            />
            <Button
              type="submit"
              label="Save Budget"
              severity="success"
              icon="pi pi-save"
            />
          </div>
        </div> */}
          <div className="grid-budget p-3 mb-3 gap-5 w-full">
            <div className="field budget-budget-custom-field flex flex-column">
              <label className="budget-label font-semibold" htmlFor="name">
                Name
              </label>
              <InputText
                id="name"
                {...register('name')}
                placeholder="Enter Name"
                style={{ color: '#000' }}
              />
              {errors.name && (
                <small className="error-message">{errors.name.message}</small>
              )}
            </div>
            <div className="field budget-custom-field  flex flex-column">
              <label className="budget-label font-semibold" htmlFor="name">
                Budget Unit
              </label>
              <InputText
                // options={budgetUnits}
                // optionLabel="name"
                readOnly
                value={selectedBudgetUnit?.name}
                placeholder="Select budget unit"
                className="w-full"
                // onChange={(e) => {
                //   e.stopPropagation();
                //   setSelectedOrgName(e.value?.orgname);
                //   setAllocations(e.value?.allocations);
                //   setValue("budgetunit", e.value?.id, {
                //     shouldValidate: true,
                //     shouldDirty: true,
                //   });
                //   setValue("orgname", e.value?.orgname, {
                //     shouldValidate: true,
                //     shouldDirty: true,
                //   });
                // }}
              />
            </div>
            <div className="field budget-custom-field flex flex-column">
              <label className="budget-label font-semibold" htmlFor="orgname">
                Organization Name
              </label>
              <InputText
                value={selectedBudgetUnit?.orgname}
                id="orgname"
                readOnly
                {...register('orgname')}
                placeholder="Enter Organization Name"
              />
              {/* {errors.orgname && (
              <small className="error-message">{errors.orgname.message}</small>
            )} */}
            </div>
          </div>
          <div className="grid-budget p-3 mb-3 gap-5 w-full">
            <div className="field budget-budget-custom-field flex flex-column">
              <label className="budget-label font-semibold" htmlFor="amount">
                Budget Amount
              </label>
              <InputNumber
                value={data?.amount || 0}
                inputId="amount"
                onValueChange={e => {
                  setValue('amount', e.value, {
                    shouldValidate: true,
                    shouldDirty: true,
                    shouldTouch: true,
                  });
                }}
                placeholder="Enter Budget Amount"
                mode="currency"
                currency="USD"
                locale="en-US"
                style={{ color: '#000' }}
              />
              {/* {errors?.amount && (
                  <div id="name-help" className="error-message">
                    {errors?.amount?.message}
                  </div>
                )} */}
            </div>
            <div className="field budget-custom-field flex flex-column">
              <label className="budget-label font-semibold" htmlFor="period">
                Period
              </label>
              <Dropdown
                options={periods}
                value={periods.find(p => p.code === period)}
                optionLabel="name"
                placeholder="Select period"
                className="w-full md:w-14rem"
                onChange={e => {
                  setValue('period', e?.value?.code, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                  setIsPeriodManualChange(prev => !prev);
                }}
              />
              {/* {errors.period && (
              <small className="error-message">{errors.period.message}</small>
            )} */}
            </div>
            <div className="field budget-custom-field flex-column">
              <label
                className="budget-label font-semibold"
                htmlFor="start_date"
              >
                Start Date
              </label>
              <Calendar
                // value={data?.start_date}
                value={startDate}
                id="start_date"
                {...register('start_date')}
                placeholder="Enter Start Date"
              />
              {errors.start_date && (
                <small className="error-message">
                  {errors.start_date.message}
                </small>
              )}
            </div>
          </div>
          <div className="grid-budget p-3 mb-3 gap-5 w-full">
            <div className="field budget-custom-field flex-column">
              <label className="budget-label font-semibold" htmlFor="end_date">
                End Date
              </label>
              <Calendar
                value={endDate}
                id="end_date"
                minDate={startDate || new Date()}
                maxDate={
                  new Date(new Date().setMonth(new Date().getMonth() + 12))
                }
                {...register('end_date')}
                placeholder="Enter End Date"
              />
              {errors.end_date && (
                <small className="error-message">
                  {errors.end_date.message}
                </small>
              )}
            </div>
            {budgetUnit && allocations?.length > 0 && (
              <div className="field budget-custom-field">
                <label className="budget-label" htmlFor="budget_allocation">
                  Allocation in %
                </label>
                {allocations?.map((allocatedType, index) => {
                  return (
                    <div key={index} className="flex gap-2">
                      <p
                        className="mb-0"
                        style={{
                          border: '1px solid #d0d5dd',
                          width: '50%',
                          padding: '8px',
                          borderRadius: '4px',
                          color: '#000',
                        }}
                      >
                        {allocatedType}
                      </p>
                      <InputNumber
                        inputId={`budget_allocation..${index}`}
                        max={100}
                        value={
                          budgetunitInfoType?.[index]?.percentage ||
                          budgetunitInfoType?.type?.[index]?.percentage ||
                          0
                        }
                        onValueChange={e => {
                          handleAllocationChange(index, allocatedType, e.value);
                          setIsAllocationChange(true);
                        }}
                      />
                      {/* <span className="ml-2" style={{color: "#000"}}>{allocatedType}</span> */}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div className="flex justify-content-between p-3 mb-3 gap-5 w-full  horizontal-border">
            <h4 className="mb-0 flex align-items-center">
              Budget Unit Type Allocation
            </h4>
            <div>
              <Button
                label="Calculate"
                className="custom-bg-light-blue"
                type="button"
                onClick={() => {
                  setCheckCalculated(true);
                  claculateAllocations();
                }}
              />
            </div>
          </div>
          {/* <div className="flex flex-column gap-4 my-6 relative">
            <div className="absolute right-0">
              <Button
                label="Calculate"
                className="custom-bg-blue"
                type="button"
                onClick={() => {
                  setCheckCalculated(true);
                  claculateAllocations();
                }}
              />
            </div>
            <BudgetUnitAllocationTable
              data={tableData}
              period={period}
              loading={loading}
              amount={watch('amount')}
              startDate={startDate}
              endDate={endDate}
              budgetunitInfoType={budgetunitInfoType}
              updateFilterCount={updateFilterCount}
              setBudgetunitInfoType={setBudgetunitInfoType}
            />
          </div> */}
          <div className="grid-budget p-3 mb-3 gap-5">
            <div className="field budget-custom-field flex align-items-center gap-2 vertical-right-border">
              <label
                className="budget-label font-semibold mb-0"
                htmlFor="end_date"
              >
                Freeze Budget
              </label>
              {/* <Checkbox
                id="freeze"
                onChange={e => setValue('freeze', e.checked)}
                checked={watch('freeze')}
              /> */}
              <Switch
                id="freeze"
                onChange={e => setValue('freeze', e.checked)}
                onClick={e => setValue('freeze', e.checked)}
                checked={watch('freeze')}
              />
            </div>
            <div className="field budget-custom-field flex align-items-center gap-2 vertical-right-border">
              <label
                className="budget-label font-semibold mb-0"
                htmlFor="end_date"
              >
                Enable Alerts
              </label>
              {/* <Checkbox
                id="budget_alert_flag"
                checked={watch('budget_alert_flag')}
                onChange={e => setValue('budget_alert_flag', e.checked)}
              /> */}
              <Switch
                id="budget_alert_flag"
                checked={watch('budget_alert_flag')}
                onChange={e => setValue('budget_alert_flag', e.checked)}
                onClick={e => setValue('budget_alert_flag', e.checked)}
              />
            </div>
            <div className="field budget-custom-field flex align-items-center gap-2">
              <label
                className="budget-label font-semibold mb-0"
                htmlFor="end_date"
              >
                Archive
              </label>
              {/* <Checkbox
                id="archive"
                checked={watch('archive')}
                onChange={e => setValue('archive', e.checked)}
              /> */}
              <Switch
                id="archive"
                checked={watch('archive')}
                onChange={e => setValue('archive', e.checked)}
                onClick={e => setValue('archive', e.checked)}
              />
            </div>
          </div>
          <div className='pb-6'>
            <BudgetUnitAllocationTable
              data={tableData}
              period={period}
              loading={loading}
              amount={watch('amount')}
              startDate={startDate}
              endDate={endDate}
              budgetunitInfoType={budgetunitInfoType}
              updateFilterCount={updateFilterCount}
              setBudgetunitInfoType={setBudgetunitInfoType}
            />
          </div>
          {/* <FieldWrapper
            label="Freeze Budget"
            helperText="Please Fill Freeze Budget"
            key={9}
            expandAll={expandAll}
            isEditMode={true}
            value={String(watch('freeze'))}
          >
            <div className="field budget-custom-field">
              <Checkbox
                id="freeze"
                onChange={e => setValue('freeze', e.checked)}
                checked={watch('freeze')}
              />
            </div>
          </FieldWrapper>
          <FieldWrapper
            label="Enable Alerts"
            helperText="Please Fill Enable Alerts"
            key={10}
            expandAll={expandAll}
            isEditMode={true}
            value={String(watch('budget_alert_flag'))}
          >
            <div className="field budget-custom-field">
              <Checkbox
                id="budget_alert_flag"
                checked={watch('budget_alert_flag')}
                onChange={e => setValue('budget_alert_flag', e.checked)}
              />
            </div>
          </FieldWrapper>
          <FieldWrapper
            label="Archive"
            helperText="Please Fill Archive"
            key={11}
            expandAll={expandAll}
            isEditMode={true}
            value={String(watch('archive'))}
          >
            <div className="field budget-custom-field">
              <Checkbox
                id="archive"
                checked={watch('archive')}
                onChange={e => setValue('archive', e.checked)}
              />
            </div>
          </FieldWrapper> */}
        </form>
      )}
    </div>
  );
};

export default EditBudgetFormPage;
