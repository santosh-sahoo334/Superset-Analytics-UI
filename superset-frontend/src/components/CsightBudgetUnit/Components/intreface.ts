/* eslint-disable */
// interface Allocation {
//    [key: string]: number
// }

export interface AddBudgetFormModel {
  name: string;
  orgname: string;
  budgetunit: string;
  amount: number;
  period: string;
  start_date: Date;
  end_date: Date;
  budget_alert_flag?: boolean;
  budgetunit_info: {
    type?: {
      name?: string;
      amount?: number;
      percentage?: number;
      month?: {
        [key: string]: number;
      };
      quarterly?: { Q1?: number; Q2?: number; Q3?: number; Q4?: number };
    }[];
    quarter_start?: number;
  };
}

export interface AddBudgetUnitFormModel {
  name: string;
  orgname: string;
  type: string[];
}

// Interface for each quarterly allocation in 'type'
interface QuarterlyAllocation {
  Q1?: number;
  Q2?: number;
  Q3?: number;
  Q4?: number;
}

// Interface for each budget type
interface BudgetType {
  amount: number;
  name: string;
  percentage: number;
  quarterly: QuarterlyAllocation;
}

// Interface for 'budgetunit_info'
interface BudgetUnitInfo {
  quarter_start: number;
  type: BudgetType[];
}

// Updated EditBudgetFormModel
export interface EditBudgetFormModel {
  name: string;
  orgname: string;
  budgetunit: string;
  amount: number;
  period: string;
  start_date: Date;
  end_date: Date;
  budget_alert_flag?: boolean;
  // budgetunit_info: {
  //   type?: {
  //     name?: string;
  //     amount?: number;
  //     percentage?: number;
  //     month?: {
  //       [key: string]: number;
  //     };
  //     quarterly?: { Q1?: number; Q2?: number; Q3?: number; Q4?: number };
  //   }[];
  //   quarter_start?: number;
  // };
  archive?: boolean;
  freeze?: boolean;
}
