/* eslint-disable */
// import moment from "moment";

// const datesCol = (data, col) => {
//   return <>{moment(data[col.field]).format("MMM-YYYY")}</>
// }

// export const BudgetColumns = [{
//     field: "name",
//     header: "Name"
// },
// {
//     field: "org_name",
//     header: "Organization Name"
// },
// {
//     field: "amount",
//     header: "Amount"
// },
// {
//     field: "period",
//     header: "Period"
// },
// {
//     field: "start_date",
//     header: "Start",
//     body: datesCol
// },
// {
//     field: "end_date",
//     header: "End",
//     body: datesCol
// },
// {
//     field: "alert",
//     header: "Alert"
// },
// {
//     field: "freeze",
//     header: "Freeze"
// },
// {
//     field: "archived",
//     header: "Archived"
// }
// ]

// export const BUDGET_DATA = [{
//     id: "1", name: "Budget 1", org_name: "Teksecur", budget_unit: "Customer", amount: 5000.00, period: "Quarterly", start_date: new Date().toISOString(), end_date: new Date().toISOString(), alert: "false", freeze: "false", "archived": false,
// },
// {
//     id: "2", name: "Budget 2", org_name: "Teksecur", budget_unit: "Customer", amount: 5000.00, period: "Quarterly", start_date: new Date().toISOString(), end_date: new Date().toISOString(), alert: "false", freeze: "false", "archived": false,
// }
// ]
import moment from "moment";

const datesCol = (data, col) => {
  return <>{moment(data[col.field]).format("MMM-YYYY")}</>;
};

export const BudgetColumns = [
  {
    field: "name",
    header: "Name",
  },
  {
    field: "orgname",
    header: "Organization",
  },
  {
    field: "amount",
    header: "Amount",
  },
  {
    field: "period",
    header: "Period",
  },
  {
    field: "start_date",
    header: "Start",
    body: datesCol,
  },
  {
    field: "end_date",
    header: "End",
    body: datesCol,
  },
  {
    field: "budget_alert_flag",
    header: "Alert",
  },
  {
    field: "freeze",
    header: "Freeze",
  },
  {
    field: "archive",
    header: "Archived",
  },
];

export const BUDGET_DATA = [
  {
    id: "1",
    name: "Budget 1",
    orgname: "Teksecur",
    budgetunit: "Customer",
    amount: 5000.0,
    period: "Quarterly",
    start_date: new Date().toISOString(),
    end_date: new Date().toISOString(),
    budget_alert_flag: "false",
    freeze: "false",
    archive: false,
  },
  {
    id: "2",
    name: "Budget 2",
    orgname: "Teksecur",
    budgetunit: "Customer",
    amount: 5000.0,
    period: "Quarterly",
    start_date: new Date().toISOString(),
    end_date: new Date().toISOString(),
    budget_alert_flag: "false",
    freeze: "false",
    archive: false,
  },
];
