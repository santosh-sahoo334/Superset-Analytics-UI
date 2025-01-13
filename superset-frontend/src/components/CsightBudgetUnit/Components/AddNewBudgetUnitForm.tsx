/* eslint-disable */
// @ts-nocheck
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import React from "react";
import { useForm } from "react-hook-form";
import { AddBudgetFormModel, AddBudgetUnitFormModel } from "./intreface";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Chips } from "primereact/chips";
import FieldWrapper from "./FieldWrapper";
const schema: yup.ObjectSchema<AddBudgetUnitFormModel> = yup.object().shape({
  name: yup.string().required("Name is required field"),
  orgname: yup.string().required("Organization Name is required field"),
  type: yup.array().required("types is required field"),
});

interface AddNewBudgetUnitProps {
  addBudgetUnit: (values: AddBudgetFormModel) => void;
  expandAll: Boolean;
}

const AddNewBudgetUnitForm: React.FunctionComponent<AddNewBudgetUnitProps> = ({
  addBudgetUnit,
  expandAll,
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    getValues,
  } = useForm({ resolver: yupResolver(schema) });

  const types = watch("type", []);

  return (
    <div>
      <form
        className="flex gap-1 flex-column w-full"
        onSubmit={handleSubmit(addBudgetUnit)}
      >
        <FieldWrapper
          label="Name"
          helperText="Please Fill Name"
          expandAll={expandAll}
          key={1}
        >
          <div className="field custom-field">
            {/* <label htmlFor="name">Name</label> */}
            <InputText
              id="name"
              aria-describedby="name-help"
              {...register("name")}
            />
            {errors?.name && (
              <div id="name-help" className="error-message">
                {errors?.name?.message}
              </div>
            )}
          </div>
        </FieldWrapper>
        <FieldWrapper
          label="Organization Name"
          helperText="Please Fill Organization Name"
          key={2}
          expandAll={expandAll}
        >
          <div className="field custom-field">
            <InputText
              id="orgname"
              aria-describedby="org_name-help"
              {...register("orgname")}
            />
            {errors?.orgname && (
              <div id="name-help" className="error-message">
                {errors?.orgname?.message}
              </div>
            )}
          </div>
        </FieldWrapper>

        <FieldWrapper
          label="Types"
          helperText="Please Fill Types"
          key={3}
          expandAll={expandAll}
        >
          <div className="field custom-field">
            <Chips value={types} onChange={(e) => setValue("type", e.value)} />
            {types?.length<1 && errors?.type && (
              <div className="error-message">{errors.type.message}</div>
            )}
          </div>
        </FieldWrapper>

        <div className="text-right relative">
          <Button
            type="submit"
            label="Create Budget Unit"
            className="custom-bg-blue"
            severity="success"
            icon="pi pi-plus"
            style={{ position: "absolute", right: "calc(30% - 80px)" }}
          />
        </div>
      </form>
    </div>
  );
};

export default AddNewBudgetUnitForm;
