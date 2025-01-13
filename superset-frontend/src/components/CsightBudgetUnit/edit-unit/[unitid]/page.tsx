/* eslint-disable */
// @ts-nocheck
import { Button } from "primereact/button";
import React, { useEffect, useState, useRef } from "react";
import { useHistory, useParams } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import FieldWrapper from "../../Components/FieldWrapper";
import { InputText } from "primereact/inputtext";
import { Chips } from "primereact/chips";
import { HTTP } from "../../../CsightCommon/config/http-common";
import { ProgressSpinner } from "primereact/progressspinner";
import { AddBudgetUnitFormModel } from "../../Components/intreface";
import { Toast } from "primereact/toast";
import { useAuth } from "../../../CsightCommon/context/AuthContext";

const schema: yup.ObjectSchema<AddBudgetUnitFormModel> = yup
  .object()
  .shape({
    name: yup.string().required("Name is required"),
    orgname: yup.string().required("Orgname is required"),
    type: yup
      .array()
      .of(yup.string().required("Each type must be string"))
      .min(1, "At least one type is required")
      .required("Type is required"),
  })
  .required();

const EditBudgetUnitFormPage = () => {
  const [expandAll, setExpandAll] = useState<Boolean>(true);
  const [budgetUnitData, setBudgetUnitData] = useState<any>({});
  const [budgetListData, setBudgetListData] = useState<any>({});
  const [loading, setLoading] = useState<Boolean>(true);
  const router = useHistory();
  const { unitid } = useParams();

  console.log("unitid", unitid);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    getValues,
    formState: { errors, isDirty, isValid },
  } = useForm({
    resolver: yupResolver(schema),
  });
  const { accessToken } = useAuth();

  const events = { shouldDirty: true, shouldTouch: true, shouldValidate: true };
  const toast = useRef<Toast>(null);
  const showToast = (
    message: string,
    severityValue: "success" | "info" | "warn" | "error",
    summary: string
  ) => {
    toast.current?.show({
      severity: severityValue,
      summary,
      detail: message,
      life: 3000,
    });
  };

  const fetchBudgetUnitData = async () => {
    try {
      const budgetUnitsResponse = await HTTP.get(`budgetunit/${unitid}`, {
        headers: { Authorization: accessToken },
      });
      if (budgetUnitsResponse.status === 200) {
        setBudgetUnitData(budgetUnitsResponse?.data?.result);
      }
    } catch (error) {
      console.error("Failed to fetch budget unit data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBudgetListData = async () => {
    try {
      const budgetUnitsResponse = await HTTP.get("budget/", {
        headers: { Authorization: accessToken },
      });
      if (budgetUnitsResponse.status === 200) {
        setBudgetListData(budgetUnitsResponse?.data?.result);
      }
    } catch (error) {
      console.error("Failed to fetch budget List data:", error);
    }
  };

  const name = watch("name");
  const orgname = watch("orgname");
  const types = watch("type");

  useEffect(() => {
    fetchBudgetUnitData();
    fetchBudgetListData();
  }, []);

  useEffect(() => {
    if (budgetUnitData) {
      setValue("name", budgetUnitData?.name, events);
      setValue("orgname", budgetUnitData?.orgname, events);
      setValue("type", budgetUnitData?.type?.list, events);
    }
    reset({
      name: budgetUnitData?.name || "",
      orgname: budgetUnitData?.orgname || "",
      type: budgetUnitData?.type?.list || [],
    });
  }, [budgetUnitData]);

  const updateBudgetUnit = async (values) => {
    try {
      const resp = await HTTP.put(
        `budgetunit/${unitid}`,
        {
          name: values?.name,
          orgname: values?.orgname,
          type: {
            list: values?.type,
          },
        },
        { headers: { Authorization: accessToken } }
      );

      if (resp?.status === 200) {
        showToast(resp?.data?.message, "success", "Success");
      }

      const filterBudgeListdata = budgetListData?.filter(
        (item) => item.budgetunit == unitid
      );

      const updatedBudgetunitInfo = filterBudgeListdata?.map((budget) => {
        const budgetUnitInfo = budget?.budgetunit_info?.type || [];

        const updatedBudgetUnitInfo =
          values?.type?.map((type) => {
            const isAlreadyExists = budgetUnitInfo?.find(
              (b) => b?.name === type
            );
            if (isAlreadyExists) return isAlreadyExists;
            return {
              amount: 0,
              name: type,
              percentage: 0,
            };
          }) || budgetUnitInfo;

        return {
          ...budget,
          budgetunit_info: {
            ...(budget?.budgetunit_info || {}),
            type: updatedBudgetUnitInfo,
          },
        };
      });

      if (updatedBudgetunitInfo) {
        await Promise.all(
          updatedBudgetunitInfo.map((budget) =>
            HTTP.put(
              `budget/${budget?.id}`,
              {
                name: budget?.name,
                start_date: budget?.start_date,
                end_date: budget?.end_date,
                amount: budget?.amount,
                budget_alert_flag: budget?.budget_alert_flag,
                budgetunit_info: budget?.budgetunit_info,
                freeze: budget?.freeze,
                archive: budget?.archive,
                budgetunit: budget?.budgetunit,
                period: budget?.period,
              },
              { headers: { Authorization: accessToken } }
            )
          )
        );
      }
      router.push("/budget-unit");
    } catch (error) {
      console.log("error while updating budget unit", error);
      showToast(
        error?.message || "Error while updating budget unit",
        "error",
        "Error"
      );
    }
  };

  const toggleExpandAll = () => setExpandAll((prev) => !prev);
  return (
    <div className="mx-2 edit_budget_page">
      {loading ? (
        <div className="flex justify-center items-center">
          <ProgressSpinner
            strokeWidth="4"
            aria-label="Loading"
            style={{ color: "#4472c4", width: "50px", height: "50px" }}
            animationDuration="3s"
          />
        </div>
      ) : (
        <form
          onSubmit={handleSubmit(updateBudgetUnit)}
          className="flex gap-1 flex-column w-full"
        >
          <Toast ref={toast} />
          <div className="flex justify-content-between p-3 mb-3 horizontal-border align-items-center">
            <div>
              <h4 className="mb-0">Edit Budget</h4>
            </div>
            <div>
              <Button
                type="submit"
                label="Update"
                className="p-button-sm mr-2 custom-bg-blue"
                icon="pi pi-save"
                disabled={!isDirty || !isValid}
              />
              <Button
                type="button"
                severity="warning"
                icon="pi pi-arrow-left"
                className="p-button-sm mr-2"
                onClick={() => router.goBack()}
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
              )}
            </div>
          </div>
          <FieldWrapper
            label="Name"
            helperText="Please Fill Name"
            expandAll={expandAll}
            isEditMode={true}
            key={1}
            value={name}
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
            isEditMode={true}
            expandAll={expandAll}
            value={orgname}
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
              <Chips
                value={types}
                onChange={(e) => setValue("type", e.value, events)}
              />
              {errors?.type && (
                <div className="error-message">{errors.type.message}</div>
              )}
            </div>
          </FieldWrapper>
        </form>
      )}
    </div>
  );
};

export default EditBudgetUnitFormPage;
