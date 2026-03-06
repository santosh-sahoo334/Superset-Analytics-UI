/* eslint-disable */
// @ts-nocheck
import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { MultiSelect } from "primereact/multiselect";
import { HTTP } from "../../CsightCommon/config/http-common";
import { useToast } from "../../CsightCommon/context/ToastContext";

interface UnitEconConfig {
  display_name: string;
  values: string[];
  role_prefix: string;
}

interface CreateUserFormProps {
  visible: boolean;
  onHide: () => void;
  onSuccess: () => void;
  unitEconConfig: UnitEconConfig | null;
}

const CreateUserForm: React.FC<CreateUserFormProps> = ({ visible, onHide, onSuccess, unitEconConfig }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [tempPassword, setTempPassword] = useState("");
  const [makeAdmin, setMakeAdmin] = useState(false);
  const [unitAccess, setUnitAccess] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { showToast } = useToast();

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setTempPassword("");
    setMakeAdmin(false);
    setUnitAccess([]);
    setErrors({});
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) newErrors.firstName = "First name is required";
    if (!lastName.trim()) newErrors.lastName = "Last name is required";
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email format";
    }
    if (tempPassword && tempPassword.length < 8) {
      newErrors.tempPassword = "Password must be at least 8 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setSubmitting(true);
      const payload: any = {
        email: email.trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        make_admin: makeAdmin,
        ...(unitEconConfig ? { unit_access: makeAdmin ? [] : unitAccess } : {}),
      };
      if (tempPassword) {
        payload.temp_password = tempPassword;
      }

      const resp = await HTTP.post("usermgmt/users", payload);

      if (resp.status === 201) {
        showToast("User created successfully", "success", "Success");
        if (!resp.data?.superset_provisioned) {
          showToast(
            "Note: User will be fully provisioned in dashboard on first login",
            "info",
            "Info"
          );
        }
        resetForm();
        onHide();
        onSuccess();
      }
    } catch (error) {
      const errorMsg = error?.response?.data?.error || "Failed to create user";
      const errorDetails = error?.response?.data?.details;
      showToast(
        errorDetails ? `${errorMsg}: ${JSON.stringify(errorDetails)}` : errorMsg,
        "error",
        "Error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleHide = () => {
    resetForm();
    onHide();
  };

  const footer = (
    <div>
      <Button
        label="Cancel"
        icon="pi pi-times"
        className="p-button-text"
        onClick={handleHide}
        disabled={submitting}
      />
      <Button
        label="Create User"
        icon="pi pi-check"
        onClick={handleSubmit}
        loading={submitting}
      />
    </div>
  );

  return (
    <Dialog
      visible={visible}
      onHide={handleHide}
      header="Create New User"
      style={{ width: "500px" }}
      footer={footer}
      closable={!submitting}
    >
      <div className="flex flex-column gap-3 pt-2">
        <div className="flex flex-column gap-2">
          <label htmlFor="firstName">First Name *</label>
          <InputText
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Enter first name"
            className={errors.firstName ? "p-invalid" : ""}
          />
          {errors.firstName && <small className="p-error">{errors.firstName}</small>}
        </div>

        <div className="flex flex-column gap-2">
          <label htmlFor="lastName">Last Name *</label>
          <InputText
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Enter last name"
            className={errors.lastName ? "p-invalid" : ""}
          />
          {errors.lastName && <small className="p-error">{errors.lastName}</small>}
        </div>

        <div className="flex flex-column gap-2">
          <label htmlFor="email">Email *</label>
          <InputText
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email address"
            className={errors.email ? "p-invalid" : ""}
          />
          {errors.email && <small className="p-error">{errors.email}</small>}
        </div>

        <div className="flex flex-column gap-2">
          <label htmlFor="tempPassword">Temporary Password (optional)</label>
          <InputText
            id="tempPassword"
            type="password"
            value={tempPassword}
            onChange={(e) => setTempPassword(e.target.value)}
            placeholder="Min 8 characters (optional)"
            className={errors.tempPassword ? "p-invalid" : ""}
          />
          {errors.tempPassword && <small className="p-error">{errors.tempPassword}</small>}
          <small className="text-color-secondary">
            If set, user must change this password on first login.
          </small>
        </div>

        <div className="flex align-items-center gap-3 mt-2">
          <Checkbox
            inputId="makeAdmin"
            checked={makeAdmin}
            onChange={(e) => setMakeAdmin(e.checked)}
          />
          <label htmlFor="makeAdmin">Make this user a Customer Admin</label>
        </div>
        <small className="text-color-secondary">
          Customer Admins can manage users and promote/demote other admins.
        </small>

        {unitEconConfig && (
          <div className="flex flex-column gap-2 mt-2">
            <label htmlFor="unitAccess">{unitEconConfig.display_name}</label>
            {makeAdmin ? (
              <small className="text-color-secondary">
                Admins have access to all {unitEconConfig.display_name.toLowerCase()} data.
              </small>
            ) : (
              <>
                <MultiSelect
                  id="unitAccess"
                  value={unitAccess}
                  options={unitEconConfig.values.map((v) => ({ label: v, value: v }))}
                  onChange={(e) => setUnitAccess(e.value)}
                  placeholder={`Select ${unitEconConfig.display_name}`}
                  display="chip"
                  filter
                  className="w-full"
                />
                <small className="text-color-secondary">
                  Select which {unitEconConfig.display_name.toLowerCase()} data this user can access.
                </small>
              </>
            )}
          </div>
        )}
      </div>
    </Dialog>
  );
};

export default CreateUserForm;
