/* eslint-disable */
// @ts-nocheck
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import React, { useEffect, useMemo, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { useAuthContext } from "../../CsightCommon/context/AuthContext";

// import { AddBudgetFormModel } from "./intreface";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { InputNumber } from "primereact/inputnumber";
import { AddBudgetFormModel } from "./intreface";
import FieldWrapper from "./FieldWrapper";

const months = [
  { name: "January", code: "january" },
  { name: "February", code: "february" },
  { name: "March", code: "march" },
  { name: "April", code: "april" },
  { name: "May", code: "may" },
  { name: "June", code: "june" },
  { name: "July", code: "july" },
  { name: "August", code: "august" },
  { name: "September", code: "september" },
  { name: "October", code: "october" },
  { name: "November", code: "november" },
  { name: "December", code: "december" },
];

const schema: yup.ObjectSchema<AddBudgetFormModel> = yup.object().shape({
  name: yup.string().required("Name is required field"),
  orgname: yup.string().required("Organization Name is required field"),
  budgetunit: yup.string().required("Budget unit is required field"),
  amount: yup.number().moreThan(0).required("Amount must be greater than zero"),
  period: yup.string().required("Period is required field"),
  start_date: yup
    .date()
    .required("Start date is a required field")
    .min(
      new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      "Start date must be after the current month"
    ),
  end_date: yup.date().required("End date is required field"),
  budget_alert_flag: yup.boolean().optional(),
  budgetunit_info: yup
    .object({
      type: yup
        .array()
        .of(
          yup
            .object()
            .shape({
              name: yup.string().required("Name is required"),
              amount: yup.number().required("Amount is required"),
              percentage: yup.number().required("Percentage is required"),
              month: yup
                .object()
                .optional()
                .shape(
                  Object.fromEntries(
                    Array.from({ length: 12 }, (_, i) => [
                      yup.string().optional(),
                      yup.number().optional(),
                    ])
                  )
                )
                .test(
                  "max-months",
                  "The 'month' field cannot have more than 12 entries",
                  (value) => !value || Object.keys(value).length <= 12
                ),
              quarterly: yup.object().optional().shape({
                Q1: yup.number().optional(),
                Q2: yup.number().optional(),
                Q3: yup.number().optional(),
                Q4: yup.number().optional(),
              }),
            })
            .test(
              "exclusive-fields",
              "Only one of 'month' or 'quarterly' can be present",
              (value) => {
                const hasMonth = Boolean(value?.month);
                const hasQuarterly = Boolean(value?.quarterly);
                return hasMonth !== hasQuarterly; // true if one is present, false if both are present or neither is present
              }
            )
        )
        .optional(),
      quarter_start: yup.number().optional(),
    })
    .required("Budget unit info is required"),
});

interface AddNewBudgetFormProps {
  addBudget: (values: AddBudgetFormModel) => void;
  expandAll: Boolean;
  budgetUnitsData: any;
  setSelectedBudgetUnit: any;
  numberOfAllocations: any;
  budgetunitInfoType: any;
  setBudgetunitInfoType: any;
  isCreatePage?: Boolean;
  isSaveClickedCount?: Number;
  budgetUnitdataCreated?: any;
}

const AddNewBudgetForm: React.FunctionComponent<AddNewBudgetFormProps> = ({
  addBudget,
  expandAll,
  budgetUnitsData,
  setSelectedBudgetUnit,
  numberOfAllocations,
  budgetunitInfoType,
  setBudgetunitInfoType,
  isCreatePage,
  isSaveClickedCount,
  budgetUnitdataCreated,
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    getValues,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      budget_alert_flag: false, // Default to false
      budgetunit_info: {
        type: [],
        quarter_start: 0, // Default value
      },
    },
  });

  const buttonRef = useRef(null);
  const [error, setError] = useState<string>("");
  const budgetunit = watch("budgetunit");
  const period = watch("period");
  const amount = watch("amount");


  const { 
    budgetUnitData, setCreateNewBudget
  } = useAuthContext();

  const budgetid  = budgetUnitData?.id;


  useEffect(() => {
    if (isSaveClickedCount !== 0) {
      handleBudgetSave();
    }
  }, [isSaveClickedCount]);

  // const budgetUnits = [
  //   { name: "Customer", code: "Customer" },
  //   { name: "T1", code: "T1" },
  // ];
  const startDate = watch("start_date");
  const endDate = watch("end_date");

  const generateMonthlyOrQuarterlyBudget = (
    startDate,
    endDate,
    types: any = []
  ) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const monthNames = [
      "january",
      "february",
      "march",
      "april",
      "may",
      "june",
      "july",
      "august",
      "september",
      "october",
      "november",
      "december",
    ];
    const typesArray = Array.isArray(types) ? types : types?.type || [];
    // Initialize the budgetunit_info object

    const budgetunit_info = {
      type: typesArray?.map((type) => {
        let allocatedAmount = type?.amount;
        if (amount) {
          const percentage = type?.percentage;
          if (percentage) {
            allocatedAmount = amount * (percentage / 100);
          }
        }

        if (period === "monthly") {
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
            monthsData[month] = monthlyAmount;
          }

          if (currentMonth.getFullYear() !== endMonth.getFullYear()) {
            // Loop for Next Year Months
            for (let index = 0; index <= endMonth.getMonth(); index++) {
              const month = monthNames[index];

              monthsData[month] = monthlyAmount;
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
          quarters[quarterKey] = quarterlyAmount;

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

    return budgetunit_info;
  };
  const budgetUnits = useMemo(() => {
    return (
      budgetUnitsData?.map((unit: any) => ({
        id: unit.id,
        name: unit.name,
        code: unit.name,
        orgname: unit.orgname,
      })) || []
    );
  }, [budgetUnitsData]);

  const periods = useMemo(
    () => [
      { name: "Monthly", code: "monthly" },
      { name: "Quarterly", code: "quarterly" },
      { name: "Yearly", code: "yearly" },
    ],
    []
  );

  const handleAllocationChange = (
    index: number,
    allocatedType: string,
    value: number | string
  ) => {
    setError("");
    setBudgetunitInfoType((prev) => {
      const updatedAllocations = [...(Array.isArray(prev) ? prev : [])];

      if (!updatedAllocations[index]) {
        updatedAllocations[index] = {
          name: allocatedType,
          percentage: 0,
          amount: 0,
        };
      }
      const numericValue = typeof value === 'string' ? parseFloat(value) : value;

      updatedAllocations[index].name = allocatedType;
      updatedAllocations[index].percentage = numericValue;
      updatedAllocations[index].amount = ((amount || 0) * numericValue) / 100;

      return updatedAllocations;
    }); // Update state
  };

  useEffect(() => {
    if (
      (period === "monthly" || period === "quarterly") &&
      startDate &&
      endDate
    ) {
      setBudgetunitInfoType((prev) => {
        const prevType = Array.isArray(prev) ? prev : prev?.type || [];
        return generateMonthlyOrQuarterlyBudget(startDate, endDate, prevType);
      });
    }
    if (period === "yearly" && startDate && endDate) {
      setBudgetunitInfoType((prev) => {
        const typesArray = Array.isArray(prev) ? prev : prev?.type || [];
        const newData = typesArray?.map((type) => {
          let alloctedAmount = type?.amount;
          if (amount) {
            const percentage = type?.percentage;
            if (percentage) {
              alloctedAmount = amount * (percentage / 100);
            }
          }
          return {
            name: type?.name,
            percentage: type?.percentage,
            amount: alloctedAmount,
          };
        });
        return newData;
      });
    }
  }, [period, startDate, endDate]);

  const onSubmit = (data: AddBudgetFormModel, event: React.FormEvent) => {
    event?.preventDefault();
    const newBudgetunitInfoType = Array.isArray(budgetunitInfoType)
      ? budgetunitInfoType
      : budgetunitInfoType.type;
    const totalPercentage = (
      Array.isArray(newBudgetunitInfoType) ? newBudgetunitInfoType : []
    ).reduce((sum, allocation) => sum + (allocation.percentage || 0), 0);

    // Check if the total percentage is 100
    if (totalPercentage !== 100) {
      setError("The total percentage must equal 100%");
      return;
    } else {
      setError("");
    }
    const selectedBudgetunit = budgetUnits?.find((p) => p.id == budgetid);

    const budgetData = {
      ...data,
      budgetunit: selectedBudgetunit?.id || budgetunit,
      budgetunit_info: {
        type: newBudgetunitInfoType?.length > 0 ? newBudgetunitInfoType : [],
        quarter_start: 0,
      },
    };

    addBudget(budgetData);
  };
  const handleBudgetSave = () => {
    handleSubmit(onSubmit)();
  };

  useEffect(() => {
    if (budgetid) {
      const budgetunit = budgetUnits?.find((p) => p.id == budgetid);

      setValue("budgetunit", budgetunit?.id, {
        shouldValidate: true,
        shouldDirty: true,
      });
      setValue("orgname", budgetunit?.orgname, {
        shouldValidate: true,
        shouldDirty: true,
      });
      setSelectedBudgetUnit(budgetunit?.code);
    } else {
      const budgetunit = budgetUnits?.find((p) => p.id == budgetid);

      setValue("budgetunit", budgetUnitdataCreated?.id, {
        shouldValidate: true,
        shouldDirty: true,
      });
      setValue("orgname", budgetUnitdataCreated?.orgname, {
        shouldValidate: true,
        shouldDirty: true,
      });
      setSelectedBudgetUnit(budgetUnitdataCreated?.code);
    }
  }, [budgetUnits?.length]);

  const getBudgetUnitValue = () => {
    let budgetunit: string;
    if (budgetid) {
      budgetunit = budgetUnits?.find((p) => p.id == budgetid)?.name;
    } else {
      budgetunit = budgetUnitdataCreated?.name;
    }

    return budgetunit;
  };

  return (
    <div>
      <form
        className="flex gap-1 flex-column w-full"
        onSubmit={handleSubmit(onSubmit)}
      >

<div className="grid-budget p-3 pb-1 gap-5 w-full">
            <div className="field budget-budget-custom-field flex flex-column mb-0">
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
            <div className="field budget-custom-field  flex flex-column mb-0">
              <label className="budget-label font-semibold" htmlFor="name">
                Budget Unit
              </label>
              <InputText
                // options={budgetUnits}
                // optionLabel="name"
                readOnly
                disabled
              value={getBudgetUnitValue()}
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
            <div className="field budget-custom-field flex flex-column mb-0">
              <label className="budget-label font-semibold" htmlFor="orgname">
                Organization Name
              </label>
              <InputText
              value={watch("orgname")}
              id="orgname"
                readOnly
                disabled
                {...register('orgname')}
                placeholder="Enter Organization Name"
              />
              {/* {errors.orgname && (
              <small className="error-message">{errors.orgname.message}</small>
            )} */}
            </div>
          </div>
<div className="grid-budget p-3 pb-1 gap-5 w-full">
            <div className="field budget-budget-custom-field flex flex-column mb-0">
              <label className="budget-label font-semibold" htmlFor="amount">
                Budget Amount
              </label>
              <InputNumber
              value={amount || 0}
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
              {errors?.amount && (
                  <div id="name-help" className="error-message">
                    {errors?.amount?.message}
                  </div>
                )}
            </div>
            <div className="field budget-custom-field flex flex-column mb-0">
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
                }}
              />
              {errors.period && (
                <small className="error-message">{errors.period.message}</small>
              )}
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
          <div className="grid-budget p-3 pb-1 gap-5 w-full">
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
                          placeholder="Enter End Date"
                          {...register('end_date')}
                        />
                        {errors.end_date && (
                          <small className="error-message">
                            {errors.end_date.message}
                          </small>
                        )}
                      </div>
                      {budgetunit && numberOfAllocations?.length > 0 && (
                        <div className="field budget-custom-field">
                          <label className="budget-label" htmlFor="budget_allocation">
                            Allocation in %
                          </label>
                          {numberOfAllocations?.map((allocatedType, index) => {
                            return (
                              <div key={index} className= {`flex gap-2 ${index !== 0 ? 'mt-1' : ''}`}>
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
                                <input
                                  type='number'
                                  inputId={`budget_allocation..${index}`}
                                  style={{width:'50%'}}
                                  className='budget-input-number'
                                  max={100}
                                  placeholder="Enter Allocation in %"
                                  min={0}
                                  value={
                                    budgetunitInfoType?.[index]?.percentage ||
                                    budgetunitInfoType?.type?.[index]?.percentage ||
                                    null
                                  }
                                  onChange={e => {
                                    handleAllocationChange(index, allocatedType, e.target.value);
                                  }}
                                />
                                {/* <span className="ml-2" style={{color: "#000"}}>{allocatedType}</span> */}
                              </div>
                            );
                          })}
                          {error && (
                            <div className="error-message" style={{ color: "red" }}>
                              {error}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

        {/* {period === "quarterly" && (
          <FieldWrapper
            key={6}
            label="Select Month"
            helperText="Choose a month"
            expandAll={expandAll}
          >
            <div className="field custom-field">
              <Dropdown
                options={months}
                value={selectedMonth}
                optionLabel="name"
                placeholder="Select Month"
                className="w-full md:w-14rem"
                onChange={(e) => setSelectedMonth(e.value)}
              />
            </div>
          </FieldWrapper>
        )} */}

        {!isCreatePage && (
          <div className="text-right relative mb-5 pb-5">
            <Button
              ref={buttonRef}
              type="submit"
              label="Create Budget"
              className="custom-bg-blue"
              severity="success"
              icon="pi pi-plus"
              style={{
                position: "absolute",
                right: "calc(30% - 60px)",
              }}
            />
          </div>
        )}
      </form>
    </div>
  );
};

export default AddNewBudgetForm;
