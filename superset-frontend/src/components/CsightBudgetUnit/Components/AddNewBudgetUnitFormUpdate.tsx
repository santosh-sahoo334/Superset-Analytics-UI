/* eslint-disable */
// @ts-nocheck
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import React from 'react';
import { useForm } from 'react-hook-form';
import { AddBudgetFormModel, AddBudgetUnitFormModel } from './intreface';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Chips } from 'primereact/chips';
import FieldWrapper from './FieldWrapper';
const schema: yup.ObjectSchema<AddBudgetUnitFormModel> = yup.object().shape({
  name: yup.string().required('Name is required field'),
  orgname: yup.string().required('Organization Name is required field'),
  type: yup.array().required('types is required field'),
});

interface AddNewBudgetUnitProps {
  addBudgetUnit: (values: AddBudgetFormModel) => void;
  expandAll: Boolean;
  setVisibleRight?: (value: React.SetStateAction<boolean>) => void;
}

const AddNewBudgetUnitFormUpdated: React.FunctionComponent<
  AddNewBudgetUnitProps
> = ({ addBudgetUnit, expandAll, setVisibleRight }) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    getValues,
  } = useForm({ resolver: yupResolver(schema) });

  const types = watch('type', []);

  return (
    <div style={{ backgroundColor: 'white' }} className="h-full">
      <form
        className="flex gap-1 flex-column w-full h-full"
        onSubmit={handleSubmit(addBudgetUnit)}
      >
        <div className="flex flex-column py-4" style={{height: "100%"}}>
          <div className="field budget-custom-field flex flex-column">
            <label className="budget-label" htmlFor="name">
              Name
            </label>
            <InputText
              id="name"
              aria-describedby="name-help"
              placeholder="Enter Name"
              {...register('name')}
            />
            {errors?.name && (
              <div id="name-help" className="error-message">
                {errors?.name?.message}
              </div>
            )}
          </div>
          <div className="field budget-custom-field flex flex-column">
            <label className="budget-label" htmlFor="orgname">
              Organization Name
            </label>
            <InputText
              id="orgname"
              aria-describedby="org_name-help"
              placeholder="Enter Organization Name"
              {...register('orgname')}
            />
            {errors?.orgname && (
              <div id="name-help" className="error-message">
                {errors?.orgname?.message}
              </div>
            )}
          </div>

          <div className="field budget-custom-field flex flex-column">
            <label className="budget-label" htmlFor="type">
              Types
            </label>
            <Chips
              value={types}
              onChange={e => setValue('type', e.value)}
              placeholder="Add Type"
            />
            {types?.length < 1 && errors?.type && (
              <div className="error-message">{errors.type.message}</div>
            )}
          </div>
        </div>
        <div className="text-right relative bg-white w-full budget-border-top flex gap-2 justify-content-start pt-2">
          <Button
            type="submit"
            label="Next"
            className="custom-bg-light-blue"
            severity="success"
          />
          <Button
            label="Cancel"
            style={{
              backgroundColor: 'transparent',
              color: '#43a7ec',
              border: 'none',
            }}
            onClick={() => {
              setVisibleRight(false);
            }}
          />
        </div>
      </form>
    </div>
  );
};

export default AddNewBudgetUnitFormUpdated;
