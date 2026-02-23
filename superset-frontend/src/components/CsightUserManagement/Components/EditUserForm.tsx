/* eslint-disable */
// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { InputSwitch } from "primereact/inputswitch";
import { HTTP } from "../../CsightCommon/config/http-common";
import { useToast } from "../../CsightCommon/context/ToastContext";

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  enabled: boolean;
  is_federated: boolean;
}

interface EditUserFormProps {
  visible: boolean;
  user: User | null;
  onHide: () => void;
  onSuccess: () => void;
}

const EditUserForm: React.FC<EditUserFormProps> = ({ visible, user, onHide, onSuccess }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { showToast } = useToast();

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || "");
      setLastName(user.last_name || "");
      setEnabled(user.enabled);
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
      const payload = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        enabled: enabled,
      };

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
        </div>
      )}
    </Dialog>
  );
};

export default EditUserForm;
