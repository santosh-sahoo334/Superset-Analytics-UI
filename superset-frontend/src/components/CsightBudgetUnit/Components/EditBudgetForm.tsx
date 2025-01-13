/* eslint-disable */
// import { yupResolver } from '@hookform/resolvers/yup';
// import { Button } from 'primereact/button';
// import { Calendar } from 'primereact/calendar';
// import { Checkbox } from "primereact/checkbox";
// import { Dropdown } from 'primereact/dropdown';
// import { InputNumber } from 'primereact/inputnumber';
// import { InputText } from 'primereact/inputtext';
// import React, { useEffect } from 'react';
// import { useForm } from 'react-hook-form';
// import * as yup from "yup";
// import BudgetUnitAllocationTable from './BudgetUnitAllocationTable';
// import { EditBudgetFormModel } from './intreface';

// interface EditBudgetFormProps {
//     editData: EditBudgetFormModel;
//     hideExpand: (id: string) => void;
//     updateBudget: (values: EditBudgetFormModel) => void;
// }

// // Validation schema with updated interface
// const schema: yup.ObjectSchema<EditBudgetFormModel> = yup.object().shape({
//     name: yup.string().required("Name is a required field"),
//     orgname: yup.string().required("Organization Name is required"),
//     budgetunit: yup.number().required("Budget unit is required"),
//     budgetunit_info: yup.object({
//         quarter_start: yup.number().required("Quarter start month is required"),
//         type: yup.array().of(
//             yup.object().shape({
//                 amount: yup.number().required("Amount is required"),
//                 name: yup.string().required("Type name is required"),
//                 percentage: yup.number().required("Percentage is required"),
//                 quarterly: yup.object().shape({
//                     Q1: yup.number().optional(),
//                     Q2: yup.number().optional(),
//                     Q3: yup.number().optional(),
//                     Q4: yup.number().optional(),
//                 }),
//             })
//         ).required(),
//     }).required(),
//     amount: yup.string().required("Amount is required"),
//     period: yup.string().required("Period is required"),
//     start_date: yup.string().required("Start date is required"),
//     end_date: yup.string().required("End date is required"),
//     budget_alert_flag: yup.boolean().optional(),
//     archive: yup.boolean().optional(),
//     freeze: yup.boolean().optional(),
// });

// const EditBudgetForm: React.FunctionComponent<EditBudgetFormProps> = ({ data, hideExpand, updateBudget }) => {
//     const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
//         resolver: yupResolver(schema),
//         defaultValues: data,
//     });

//     useEffect(() => {
//         if (data) {
//             setValue("name", data.name);
//             setValue("orgname", data.orgname);
//             setValue("budgetunit", data.budgetunit);
//             setValue("amount", data.amount);
//             setValue("period", data.period);
//             setValue("start_date", data.start_date);
//             setValue("end_date", data.end_date);
//             setValue("budgetunit_info", data.budgetunit_info);
//             setValue("freeze", data.freeze || false);
//             setValue("budget_alert_flag", data.budget_alert_flag || false);
//             setValue("archive", data.archive || false);
//         }
//     }, [data, setValue]);
//     const transformedData = data.budgetunit_info?.type?.map((item) => ({
//         name: item.name,
//         amount: item.amount,
//         q1: item.quarterly.Q1 || 0,
//         q2: item.quarterly.Q2 || 0,
//         q3: item.quarterly.Q3 || 0,
//         q4: item.quarterly.Q4 || 0,
//     })) || [];

//     return (
//         <div className='p-3'>
//             <form onSubmit={handleSubmit(updateBudget)}>
//                 <div className='flex align-items-center justify-content-between mb-6'>
//                     <h4>Edit Budget</h4>
//                     <div className='flex align-items-center gap-2'>
//                         <Button label='Cancel' outlined onClick={() => hideExpand(data.id.toString())} />
//                         <Button type='submit' label='Save Budget' severity='success' icon="pi pi-save" />
//                     </div>
//                 </div>

//                 <div className='flex gap-4 align-items-center'>
//                     <div className="flex flex-column gap-2">
//                         <label htmlFor="name">Name</label>
//                         <InputText id="name" {...register("name")} />
//                         {errors.name && <small className='error-message'>{errors.name.message}</small>}
//                     </div>

//                     <div className="flex flex-column gap-2">
//                         <label htmlFor="orgname">Organization Name</label>
//                         <InputText id="orgname" {...register("orgname")} />
//                         {errors.orgname && <small className='error-message'>{errors.orgname.message}</small>}
//                     </div>

//                     <div className="flex flex-column gap-2">
//                         <label htmlFor="budgetunit">Budget Unit</label>
//                         <Dropdown id="budgetunit" {...register("budgetunit")} placeholder="Select budget unit" />
//                         {errors.budgetunit && <small className='error-message'>{errors.budgetunit.message}</small>}
//                     </div>

//                     <div className="flex flex-column gap-2">
//                         <label htmlFor="amount">Budget Amount</label>
//                         <InputNumber id="amount" mode="currency" currency="USD" locale="en-US" {...register("amount")} />
//                         {errors.amount && <small className='error-message'>{errors.amount.message}</small>}
//                     </div>
//                 </div>

//                 <div className='flex flex-column gap-4 my-6'>
//                     <h4>Budget Unit Type Allocation</h4>
//                     <BudgetUnitAllocationTable data={transformedData} />
//                 </div>

//                 <div className='flex gap-4 align-items-center'>
//                     <div className="flex flex-column gap-2">
//                         <label htmlFor="period">Period</label>
//                         <Dropdown id="period" {...register("period")} placeholder="Select period" />
//                         {errors.period && <small className='error-message'>{errors.period.message}</small>}
//                     </div>

//                     <div className="flex flex-column gap-2">
//                         <label htmlFor="quarter_start">Quarter Start Month</label>
//                         <Calendar id="quarter_start" view="month" {...register("budgetunit_info.quarter_start")} />
//                         {errors.budgetunit_info?.quarter_start && (
//                             <small className='error-message'>{errors.budgetunit_info.quarter_start.message}</small>
//                         )}
//                     </div>

//                     <div className="flex flex-column gap-2">
//                         <label htmlFor="start_date">Start Date</label>
//                         <Calendar id="start_date" {...register("start_date")} />
//                         {errors.start_date && <small className='error-message'>{errors.start_date.message}</small>}
//                     </div>

//                     <div className="flex flex-column gap-2">
//                         <label htmlFor="end_date">End Date</label>
//                         <Calendar id="end_date" {...register("end_date")} />
//                         {errors.end_date && <small className='error-message'>{errors.end_date.message}</small>}
//                     </div>
//                 </div>

//                 <div className='flex gap-4 align-items-center mt-4'>
//                     <div className="flex align-items-center">
//                         <Checkbox id="freeze" {...register("freeze")} checked={watch("freeze")} />
//                         <label htmlFor="freeze" className="ml-2">Freeze Budget</label>
//                     </div>
//                     <div className="flex align-items-center">
//                         <Checkbox id="budget_alert_flag" {...register("budget_alert_flag")} checked={watch("budget_alert_flag")} />
//                         <label htmlFor="budget_alert_flag" className="ml-2">Enable Alerts</label>
//                     </div>
//                     <div className="flex align-items-center">
//                         <Checkbox id="archive" {...register("archive")} checked={watch("archive")} />
//                         <label htmlFor="archive" className="ml-2">Archive</label>
//                     </div>
//                 </div>
//             </form>
//         </div>
//     );
// }

// export default EditBudgetForm;
