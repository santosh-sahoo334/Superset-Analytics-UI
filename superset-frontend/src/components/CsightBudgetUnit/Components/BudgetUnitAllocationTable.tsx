/* eslint-disable */
// @ts-nocheck
import { useState } from 'react';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import React from 'react';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext'; // Fixed import for InputText
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { useEffect } from 'react';
export interface BudgetUnitAllocationTableData {
  name: string;
  amount: number;
  q1: number;
  q2: number;
  q3: number;
  q4: number;
}

interface BudgetUnitAllocationTableProps {
  data: BudgetUnitAllocationTableData[];
  period: string;
  budgetunitInfoType: any;
  updateFilterCount: number;
  loading: Boolean;
  amount: number;
  startDate: Date;
  endDate: Date;
  setBudgetunitInfoType: React.Dispatch<any>;
}

const cloumns_to_ignore = [];

const BudgetUnitAllocationTable: React.FunctionComponent<
  BudgetUnitAllocationTableProps
> = ({
  data = [],
  period,
  budgetunitInfoType,
  updateFilterCount,
  loading,
  amount,
  startDate,
  endDate,
  setBudgetunitInfoType,
}) => {
  const [viewByText, setViewByText] = useState('');
  const [tableViewOptions, setTableViewOptions] = useState([]);

  const [selectedTableView, setSelectedTableView] = useState('april');
  const [selectedMiscList, setSelectedMiscList] = useState<any[]>([{ name: '', value: null }]);
  const [showMiscDialog, setShowMiscDialog] = useState<boolean>(false);
  const [selectedMiscItemIndex, setSelectedMiscItemIndex] = useState<
    number | null
  >(null);
  const [budgetDetails, setBudgetDetails] = useState<any>({});

  let tempColumns = data?.length
    ? Object.keys(data[0]).filter(key => !cloumns_to_ignore.includes(key))
    : [];
  const selectedIndex = tempColumns.indexOf(selectedTableView);
  if (selectedIndex && period !== 'yearly') {
    tempColumns = tempColumns.slice(0, 3);
    tempColumns.push(selectedTableView);
  }
  const columns = tempColumns.map(key => {
    if (key === selectedTableView) {
      return {
        field: key,
        header: 'Total Budget Amount ($)', // Capitalize the first letter
      };
    }
    if (key == 'misc_amount') {
      return {
        field: key,
        header: 'Misc Amount ($)', // Capitalize the first letter
      };
    }
    return {
      field: key,
      header: (key.charAt(0).toUpperCase() + key.slice(1)).replaceAll('_', ' '), // Capitalize the first letter
    };
  });
  const formatNumber = (value: number) => {
    return value.toFixed(2);
  };

  const getTotalSum = (index: number) => {
    const budgetUnitInfoTypeArr = Array.isArray(budgetunitInfoType)
      ? budgetunitInfoType
      : budgetunitInfoType?.type || [];
    if (period === 'monthly') {
      return (
        budgetUnitInfoTypeArr[index]?.['month']?.[selectedTableView]?.[
          'misc_amount'
        ] || 0
      );
    } else if (period === 'quarterly') {
      return (
        budgetUnitInfoTypeArr[index]?.['quarterly']?.[selectedTableView]?.[
          'misc_amount'
        ] || 0
      );
    } else {
      return budgetUnitInfoTypeArr[index]?.['misc_amount'] || 0;
    }
  };

  const renderBoady = (cellValue: any, key, index) => {
    if (typeof cellValue === 'object') {
      let value = '';
      const budgetUnitInfoTypeArr = Array.isArray(budgetunitInfoType)
        ? budgetunitInfoType
        : budgetunitInfoType?.type || [];
      if (period === 'monthly' || period === 'quarterly') {
        const percentage = budgetUnitInfoTypeArr[index]?.percentage;
        const dividers = tableViewOptions.length;
        value = ((amount * percentage) / 100 / dividers).toFixed(2);
      }
      return value;
    }
    if (key === 'misc_amount') {
      return (
        <div className='flex align-items-center'>
          <InputNumber
            value={getTotalSum(index)}
            inputId="amount"
            mode="currency"
            currency="USD"
            locale="en-US"
            disabled={true}
            className="mr-2"
            style={{height: "30px"}}
          />
          <Button
            icon="pi pi-plus"
            // className="custom-bg-light-blue"
            style={{
              color: '#43A7EC',
              backgroundColor: '#E5F6FC',
              borderRadius: '100%',
              border: 'none',padding: "0", width: "30px", height: "30px", fontSize: "10px"
            }}
            onClick={e => {
              e.preventDefault();
              addMiscItems(index);
            }}
          />
        </div>
      );
    }

    if (typeof cellValue === 'number') {
      return formatNumber(cellValue);
    } else {
      return cellValue;
    }
  };

  const addMiscItems = (index: number) => {
    setSelectedMiscItemIndex(index);
    // const period = budgetDetails.period;
    let miscObj: Record<string, number> | null = null;

    // if (period === 'monthly') {
    //   miscObj =
    //     budgetDetails.budgetunit_info?.type?.[index]?.month?.[selectedTableView]
    //       ?.misc_amount_breakdown || null;
    // } else if (period === 'quarterly') {
    //   miscObj =
    //     budgetDetails.budgetunit_info?.type?.[index]?.quarterly?.[
    //       selectedTableView
    //     ]?.misc_amount_breakdown || null;
    // } else if (period === 'yearly') {
    //   miscObj =
    //     budgetDetails.budgetunit_info?.type?.[index]?.yearly
    //       ?.misc_amount_breakdown || null;
    // }
    const budgetUnitInfoTypeArr = Array.isArray(budgetunitInfoType)
      ? budgetunitInfoType
      : budgetunitInfoType?.type || [];
    if (period === 'monthly') {
      setSelectedMiscList(
        budgetUnitInfoTypeArr[index]?.month?.[selectedTableView]
          .misc_amount_breakdown || [{ name: '', value: null }],
      );
    } else if (period === 'quarterly') {
      setSelectedMiscList(
        budgetUnitInfoTypeArr[index]?.quarterly?.[selectedTableView]
          .misc_amount_breakdown || [{ name: '', value: null }],
      );
    } else {
      setSelectedMiscList(
        budgetUnitInfoTypeArr[index]?.misc_amount_breakdown || [
          { name: '', value: null },
        ],
      );
    }

    setShowMiscDialog(true);
  };

  const addNewMiscItem = () => {
    setSelectedMiscList([...selectedMiscList, { name: '', value: null }]);
  };

  const removeMiscItem = (index: number) => {
    // Update selectedMiscList by removing the item at the specified index
    setSelectedMiscList(prev => {
      const updatedMiscList = prev.filter((_, i) => i !== index);

      // Update budgetunitInfoType to reflect the new selectedMiscList data
      setBudgetunitInfoType(prevBudgetUnitInfoType => {
        const budgetUnitInfoTypeArr = Array.isArray(prevBudgetUnitInfoType)
          ? prevBudgetUnitInfoType
          : prevBudgetUnitInfoType?.type || [];
        const updatedBudgetUnitInfoType = [...budgetUnitInfoTypeArr];

        if (selectedMiscItemIndex !== null) {
          const updatedMiscAmount = updatedMiscList.reduce(
            (total, item) => total + (item.value || 0),
            0,
          );

          // Update the specific item in budgetunitInfoType based on selectedMiscItemIndex
          if (period === 'monthly') {
            updatedBudgetUnitInfoType[selectedMiscItemIndex]['month'][
              selectedTableView
            ] = {
              ...updatedBudgetUnitInfoType[selectedMiscItemIndex]?.month?.[
                selectedTableView
              ],
              amount: updatedMiscAmount,
              // Optional: if you need to store each individual misc item details
              misc_amount_breakdown: updatedMiscList,
            };
          } else if (period === 'quarterly') {
            updatedBudgetUnitInfoType[selectedMiscItemIndex]['quarterly'][
              selectedTableView
            ] = {
              ...updatedBudgetUnitInfoType[selectedMiscItemIndex]?.month?.[
                selectedTableView
              ],
              amount: updatedMiscAmount,
              // Optional: if you need to store each individual misc item details
              misc_amount_breakdown: updatedMiscList,
            };
          } else {
            updatedBudgetUnitInfoType[selectedMiscItemIndex] = {
              ...updatedBudgetUnitInfoType[selectedMiscItemIndex],
              amount: updatedMiscAmount,
              // Optional: if you need to store each individual misc item details
              misc_amount_breakdown: updatedMiscList,
            };
          }
        }

        return { type: updatedBudgetUnitInfoType };
      });

      return updatedMiscList;
    });
  };

  const updateMiscItems = () => {
    const budgetUnitInfoTypeArr = Array.isArray(budgetunitInfoType)
      ? budgetunitInfoType
      : budgetunitInfoType?.type || [];
    if (period === 'monthly') {
      if (selectedMiscItemIndex !== null) {
        const updatedBudgetunitInfo = [...budgetUnitInfoTypeArr];
        updatedBudgetunitInfo[selectedMiscItemIndex]['month'][
          selectedTableView
        ] = {};
        updatedBudgetunitInfo[selectedMiscItemIndex]['month'][
          selectedTableView
        ]['misc_amount_breakdown'] = [...selectedMiscList];
        let total_sum = 0;
        selectedMiscList.forEach(item => {
          total_sum = total_sum + item.value;
        });
        updatedBudgetunitInfo[selectedMiscItemIndex]['month'][
          selectedTableView
        ]['misc_amount'] = total_sum;
        setBudgetunitInfoType({ type: updatedBudgetunitInfo });
      }
    } else if (period === 'quarterly') {
      if (selectedMiscItemIndex !== null) {
        const updatedBudgetunitInfo = [...budgetUnitInfoTypeArr];
        updatedBudgetunitInfo[selectedMiscItemIndex]['quarterly'][
          selectedTableView
        ] = {};
        updatedBudgetunitInfo[selectedMiscItemIndex]['quarterly'][
          selectedTableView
        ]['misc_amount_breakdown'] = [...selectedMiscList];
        let total_sum = 0;
        selectedMiscList.forEach(item => {
          total_sum = total_sum + item.value;
        });
        updatedBudgetunitInfo[selectedMiscItemIndex]['quarterly'][
          selectedTableView
        ]['misc_amount'] = total_sum;
        setBudgetunitInfoType({ type: updatedBudgetunitInfo });
      }
    } else {
      if (selectedMiscItemIndex !== null) {
        const updatedBudgetunitInfo = [...budgetunitInfoType?.type];
        updatedBudgetunitInfo[selectedMiscItemIndex]['misc_amount_breakdown'] =
          [...selectedMiscList];
        let total_sum = 0;
        selectedMiscList.forEach(item => {
          total_sum = total_sum + item.value;
        });
        updatedBudgetunitInfo[selectedMiscItemIndex]['misc_amount'] = total_sum;
        setBudgetunitInfoType({ type: updatedBudgetunitInfo });
      }
    }

    // setBudgetDetails((prev) => {
    //   const updatedDetails = { ...prev };
    //   if (selectedMiscItemIndex !== null) {
    //     if (prev.period === 'monthly') {
    //       updatedDetails.budgetunit_info.type[selectedMiscItemIndex].month[
    //         selectedTableView
    //       ].misc_amount_breakdown = { ...miscObj };
    //       updatedDetails.budgetunit_info.type[selectedMiscItemIndex].month[
    //         selectedTableView
    //       ].misc_amount = miscAmount;
    //     } else if (prev.period === 'quarterly') {
    //       updatedDetails.budgetunit_info.type[selectedMiscItemIndex].quarterly[
    //         selectedTableView
    //       ].misc_amount_breakdown = { ...miscObj };
    //       updatedDetails.budgetunit_info.type[selectedMiscItemIndex].quarterly[
    //         selectedTableView
    //       ].misc_amount = miscAmount;
    //     } else if (prev.period === 'yearly') {
    //       updatedDetails.budgetunit_info.type[selectedMiscItemIndex].yearly
    //         .misc_amount_breakdown = { ...miscObj };
    //       updatedDetails.budgetunit_info.type[selectedMiscItemIndex].yearly
    //         .misc_amount = miscAmount;
    //     }
    //   }
    //   return updatedDetails;
    // });

    setSelectedMiscItemIndex(null);
    setSelectedMiscList([]);
    setShowMiscDialog(false);
  };

  function generateMonthSequence(startDate: Date, endDate: Date) {
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

    const start = new Date(startDate);
    const end = new Date(endDate);
    const result = [];

    // Initialize current month and year to start date values
    let currentMonth = start.getMonth();
    let currentYear = start.getFullYear();

    // Loop until we reach the end date
    while (
      currentYear < end.getFullYear() ||
      (currentYear === end.getFullYear() && currentMonth <= end.getMonth())
    ) {
      result.push(monthNames[currentMonth]);

      // Move to the next month
      currentMonth++;
      if (currentMonth === 12) {
        // If we reach December, roll over to January of the next year
        currentMonth = 0;
        currentYear++;
      }
    }

    return result;
  }

  const setTableView = () => {
    setTableViewOptions([]);
    const budgetUnitInfoTypeArr = Array.isArray(budgetunitInfoType)
      ? budgetunitInfoType
      : budgetunitInfoType?.type || [];
    if (period === 'monthly') {
      setViewByText('Month');
      // get month list

      const monthlistComputed = [
        {
          name: 'april',
          value: 6,
          year: 2023,
        },
        {
          name: 'december',
          value: 7,
          year: 2023,
        },
        {
          name: 'february',
          value: 8,
          year: 2023,
        },
        {
          name: 'january',
          value: 9,
          year: 2023,
        },
        {
          name: 'november',
          value: 10,
          year: 2023,
        },
        {
          name: 'october',
          value: 10,
          year: 2023,
        },
      ];
      const months_temp = generateMonthSequence(startDate, endDate);
      const tempOptions = budgetUnitInfoTypeArr?.[0]?.month
        ? months_temp.map(val => ({
            label: val,
            value: val,
          }))
        : [];
      setTableViewOptions(tempOptions);
      setSelectedTableView(tempOptions?.[0]?.value);
    } else if (period === 'quarterly') {
      setViewByText('Quarter');
      const quarterlyListComputed = [
        {
          name: 'Q2',
          value: 'Q2',
          year: 2023,
        },
        {
          name: 'Q3',
          value: 'Q3',
          year: 2023,
        },
      ];
      const tempOptions = budgetUnitInfoTypeArr?.[0]?.quarterly
        ? Object.keys(budgetUnitInfoTypeArr?.[0]?.quarterly)?.map(val => ({
            label: val,
            value: val,
          }))
        : [];
      tempOptions.reverse();
      setTableViewOptions(tempOptions);

      setSelectedTableView(tempOptions?.[0]?.value);
    } else {
      setViewByText('');
    }
  };
  // useEffect(() => {
  //   setTableView();
  // }, []);
  useEffect(() => {
    setTableView();
  }, [budgetunitInfoType?.type?.length, updateFilterCount]);
  // const customizeLabels = {

  // }

  return (
    <>
      {period !== 'yearly' && (
        <div className="flex gap-2 align-items-center mb-3">
          <p className="mb-0 font-semibold" style={{color: "#000"}}>View By {viewByText}:</p>
          <Dropdown
            id="orgname"
            value={selectedTableView}
            options={tableViewOptions}
            onChange={e => setSelectedTableView(e.value)}
          />
        </div>
      )}
      <DataTable value={data} className="tabelHeader dashboard-table-update">
        {columns.map((item, index) => (
          <Column
            key={item.field}
            field={item.field}
            header={item.header}
            body={(rowData, { rowIndex }) => {
              const cellValue = rowData[item.field];
              // Check if the value is a number, and format if so
              return renderBoady(cellValue, item.field, rowIndex);
            }}
            headerStyle={{ backgroundColor: '#f2f3f6', color: '#667084' }}
          />
        ))}
      </DataTable>

      <Dialog
        visible={showMiscDialog}
        onHide={() => setShowMiscDialog(false)}
        modal
        header="Add Misc Items"
        style={{ minWidth: '450px' }}
      >
        <div className="misc-items">
          {/* <div className="misc-item-container flex mb-2 mt-2">
            <div className="font-bold w-6">Name</div>
            <div className="font-bold w-6 ml-2">Amount</div>
          </div> */}
          {selectedMiscList.map((item, index) => (
            <div key={index} className="misc-item-container flex mb-3 gap-2 align-items-end">
              <div className="flex flex-column">
                <div className="font-bold">Name</div>
                <InputText
                  value={item.name}
                  onChange={e => {
                    const newList = [...selectedMiscList];
                    newList[index].name = e.target.value;
                    setSelectedMiscList(newList);
                  }}
                  disabled={budgetDetails.freeze}
                  className="w-full"
                />
              </div>
              <div className="flex flex-column">
                <div className="font-bold">Amount</div>
                <InputNumber
                  value={item.value}
                  onValueChange={e => {
                    const newList = [...selectedMiscList];
                    newList[index].value = e.value;
                    setSelectedMiscList(newList);
                  }}
                  mode="currency"
                  currency="USD"
                  locale="en-US"
                  disabled={budgetDetails.freeze}
                  className="ml-2 w-full"
                />
              </div>
              <Button
                icon="pi pi-trash"
                className="ml-2 p-button p-component p-button-danger"
                style={{ color: '#fff', height: "42px" }}
                onClick={() => removeMiscItem(index)}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-content-between mt-4">
          <Button
            label="Add More"
            icon="pi pi-plus"
            className="p-button p-component p-button-success"
            style={{
              color: '#43A7EC',
              backgroundColor: '#E5F6FC',
              border: 'none',
            }}
            severity="success"
            disabled={budgetDetails?.freeze}
            onClick={addNewMiscItem}
          />
          <Button
            label="Update"
            // icon="pi pi-save"
            className="center custom-bg-light-blue"
            disabled={budgetDetails.freeze}
            onClick={updateMiscItems}
          />
        </div>
      </Dialog>
    </>
  );
};

export default BudgetUnitAllocationTable;
