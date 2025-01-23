import React, { useState } from 'react';
import { Paginator } from 'primereact/paginator';
import { Dropdown } from 'primereact/dropdown';

const CustomPaginator = ({
  paginationState,
  budgetUnitData,
  handlePageChange,
}) => {
  const { currentPage, countPerPage } = paginationState;
  const totalRecords = budgetUnitData?.count || 0;

  const [rowsPerPage, setRowsPerPage] = useState(countPerPage);

  // Handle rows per page change
  const onRowsChange = e => {
    const newCount = e.value;
    setRowsPerPage(newCount);
    handlePageChange({ page: 0, rows: newCount }); // Reset to the first page
  };

  // Options for the dropdown
  const rowsOptions = [10, 25, 50].map(option => ({
    label: option,
    value: option,
  }));

  return (
    <div className="custom-budget-paginator px-2">
      <div className="paginator-info">
        <span>Showing </span>
        <Dropdown
          value={rowsPerPage}
          options={rowsOptions}
          onChange={onRowsChange}
          className="rows-dropdown"
        />
        <span> of {totalRecords} entries</span>
      </div>

      <Paginator
        first={currentPage * rowsPerPage}
        rows={rowsPerPage}
        onPageChange={handlePageChange}
        totalRecords={totalRecords}
      />
    </div>
  );
};

export default CustomPaginator;
