/* eslint-disable */
// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { InputSwitch } from "primereact/inputswitch";
import { MultiSelect } from "primereact/multiselect";
import { HTTP } from "../../CsightCommon/config/http-common";
import { useToast } from "../../CsightCommon/context/ToastContext";

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  enabled: boolean;
  is_federated: boolean;
  is_admin: boolean;
  unit_access?: string[];
}

interface UnitEconConfig {
  display_name: string;
  values: string[];
  role_prefix: string;
}

interface EditUserFormProps {
  visible: boolean;
  user: User | null;
  onHide: () => void;
  onSuccess: () => void;
  unitEconConfig: UnitEconConfig | null;
}

const EditUserForm: React.FC<EditUserFormProps> = ({ visible, user, onHide, onSuccess, unitEconConfig }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [unitAccess, setUnitAccess] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { showToast } = useToast();

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || "");
      setLastName(user.last_name || "");
      setEnabled(user.enabled);
      setUnitAccess(user.unit_access || []);
      setErrors({});
    }
  }, [user]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!firstName.trim()) newErrors.firstName = "First name is required";
    if (!lastName.trim()) newErrors.lastName = "Last name is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || !user) return;

    try {
      setSubmitting(true);
      const payload: any = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        enabled: enabled,
      };

      // Include unit_access for non-admin users if config is available
      if (unitEconConfig && !user.is_admin) {
        payload.unit_access = unitAccess;
      }

      const resp = await HTTP.put(`usermgmt/users/${user.id}`, payload);

      if (resp.status === 200) {
        showToast("User updated successfully", "success", "Success");
        onHide();
        onSuccess();
      }
    } catch (error) {
      showToast(
        error?.response?.data?.error || "Failed to update user",
        "error",
        "Error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const footer = (
    <div>
      <Button
        label="Cancel"
        icon="pi pi-times"
        className="p-button-text"
        onClick={onHide}
        disabled={submitting}
      />
      <Button
        label="Save Changes"
        icon="pi pi-check"
        onClick={handleSubmit}
        loading={submitting}
      />
    </div>
  );

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header="Edit User"
      style={{ width: "500px" }}
      footer={footer}
      closable={!submitting}
    >
      {user && (
        <div className="flex flex-column gap-3 pt-2">
          <div className="flex flex-column gap-2">
            <label htmlFor="editEmail">Email</label>
            <InputText
              id="editEmail"
              value={user.email}
              disabled
              className="p-disabled"
            />
            <small className="text-color-secondary">Email cannot be changed.</small>
          </div>

          <div className="flex flex-column gap-2">
            <label htmlFor="editFirstName">First Name *</label>
            <InputText
              id="editFirstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Enter first name"
              className={errors.firstName ? "p-invalid" : ""}
              disabled={user.is_federated}
            />
            {errors.firstName && <small className="p-error">{errors.firstName}</small>}
            {user.is_federated && <small className="text-color-secondary">Name is managed by Active Directory.</small>}
          </div>

          <div className="flex flex-column gap-2">
            <label htmlFor="editLastName">Last Name *</label>
            <InputText
              id="editLastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Enter last name"
              className={errors.lastName ? "p-invalid" : ""}
              disabled={user.is_federated}
            />
            {errors.lastName && <small className="p-error">{errors.lastName}</small>}
          </div>

          {unitEconConfig && (
            <div className="flex flex-column gap-2 mt-2">
              <label htmlFor="editUnitAccess">{unitEconConfig.display_name}</label>
              {user.is_admin ? (
                <small className="text-color-secondary">
                  Admins have access to all {unitEconConfig.display_name.toLowerCase()} data.
                </small>
              ) : (
                <>
                  <MultiSelect
                    id="editUnitAccess"
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
      )}
    </Dialog>
  );
};

export default EditUserForm;
