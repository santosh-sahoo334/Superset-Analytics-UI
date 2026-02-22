/* eslint-disable */
// @ts-nocheck
import React, { useEffect, useState } from "react";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { Tag } from "primereact/tag";
import { ProgressSpinner } from "primereact/progressspinner";
import { InputText } from "primereact/inputtext";
import { HTTP } from "../../CsightCommon/config/http-common";
import { useToast } from "../../CsightCommon/context/ToastContext";

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  enabled: boolean;
  created_on: number | null;
  username: string;
}

interface UserListPageProps {
  onCreateUser: () => void;
  onEditUser: (user: User) => void;
}

const UserListPage: React.FC<UserListPageProps> = ({ onCreateUser, onEditUser }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState<boolean>(false);
  const [showResetPasswordDialog, setShowResetPasswordDialog] = useState<boolean>(false);
  const [tempPassword, setTempPassword] = useState<string>("");
  const { showToast } = useToast();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const resp = await HTTP.get("usermgmt/users");
      setUsers(resp.data?.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      showToast(
        error?.response?.data?.error || "Failed to load users",
        "error",
        "Error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeactivate = async () => {
    if (!selectedUser) return;
    try {
      setLoading(true);
      const resp = await HTTP.delete(`usermgmt/users/${selectedUser.id}`);
      if (resp.status === 200) {
        showToast("User deactivated successfully", "success", "Success");
        fetchUsers();
      }
    } catch (error) {
      showToast(
        error?.response?.data?.error || "Failed to deactivate user",
        "error",
        "Error"
      );
    } finally {
      setLoading(false);
      setShowDeactivateDialog(false);
      setSelectedUser(null);
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser || !tempPassword) return;
    try {
      setLoading(true);
      const resp = await HTTP.post(
        `usermgmt/users/${selectedUser.id}/reset-password`,
        { temp_password: tempPassword }
      );
      if (resp.status === 200) {
        showToast("Password reset successfully", "success", "Success");
      }
    } catch (error) {
      showToast(
        error?.response?.data?.error || "Failed to reset password",
        "error",
        "Error"
      );
    } finally {
      setLoading(false);
      setShowResetPasswordDialog(false);
      setSelectedUser(null);
      setTempPassword("");
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      setLoading(true);
      const resp = await HTTP.put(
        `usermgmt/users/${user.id}`,
        { enabled: !user.enabled }
      );
      if (resp.status === 200) {
        showToast(
          `User ${user.enabled ? "deactivated" : "activated"} successfully`,
          "success",
          "Success"
        );
        fetchUsers();
      }
    } catch (error) {
      showToast(
        error?.response?.data?.error || "Failed to update user status",
        "error",
        "Error"
      );
    } finally {
      setLoading(false);
    }
  };

  const nameBodyTemplate = (rowData: User) => {
    return <span>{rowData.first_name} {rowData.last_name}</span>;
  };

  const statusBodyTemplate = (rowData: User) => {
    return (
      <Tag
        value={rowData.enabled ? "Active" : "Inactive"}
        severity={rowData.enabled ? "success" : "danger"}
      />
    );
  };

  const actionBodyTemplate = (rowData: User) => {
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-text p-button-sm"
          tooltip="Edit"
          tooltipOptions={{ position: "top" }}
          onClick={() => onEditUser(rowData)}
        />
        <Button
          icon={rowData.enabled ? "pi pi-ban" : "pi pi-check-circle"}
          className={`p-button-rounded p-button-text p-button-sm ${rowData.enabled ? "p-button-warning" : "p-button-success"}`}
          tooltip={rowData.enabled ? "Deactivate" : "Activate"}
          tooltipOptions={{ position: "top" }}
          onClick={() => handleToggleStatus(rowData)}
        />
        <Button
          icon="pi pi-key"
          className="p-button-rounded p-button-text p-button-sm"
          tooltip="Reset Password"
          tooltipOptions={{ position: "top" }}
          onClick={() => {
            setSelectedUser(rowData);
            setShowResetPasswordDialog(true);
          }}
        />
      </div>
    );
  };

  const header = (
    <div className="flex align-items-center justify-content-between">
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Search users..."
          className="p-inputtext-sm"
        />
      </span>
    </div>
  );

  if (loading && users.length === 0) {
    return (
      <div className="flex justify-content-center align-items-center" style={{ height: "300px" }}>
        <ProgressSpinner />
      </div>
    );
  }

  return (
    <div>
      <DataTable
        value={users}
        paginator
        rows={10}
        rowsPerPageOptions={[5, 10, 25]}
        globalFilter={globalFilter}
        header={header}
        emptyMessage="No users found."
        loading={loading}
        stripedRows
        size="small"
      >
        <Column field="first_name" header="Name" body={nameBodyTemplate} sortable />
        <Column field="email" header="Email" sortable />
        <Column field="enabled" header="Status" body={statusBodyTemplate} sortable style={{ width: "120px" }} />
        <Column header="Actions" body={actionBodyTemplate} style={{ width: "180px" }} />
      </DataTable>

      {/* Reset Password Dialog */}
      <Dialog
        visible={showResetPasswordDialog}
        onHide={() => {
          setShowResetPasswordDialog(false);
          setSelectedUser(null);
          setTempPassword("");
        }}
        header="Reset Password"
        style={{ width: "400px" }}
        footer={
          <div>
            <Button
              label="Cancel"
              icon="pi pi-times"
              className="p-button-text"
              onClick={() => {
                setShowResetPasswordDialog(false);
                setTempPassword("");
              }}
            />
            <Button
              label="Reset"
              icon="pi pi-check"
              disabled={tempPassword.length < 8}
              onClick={handleResetPassword}
            />
          </div>
        }
      >
        <div className="flex flex-column gap-3">
          <p>Reset password for <strong>{selectedUser?.email}</strong></p>
          <div className="flex flex-column gap-2">
            <label htmlFor="tempPassword">Temporary Password (min 8 characters)</label>
            <InputText
              id="tempPassword"
              type="password"
              value={tempPassword}
              onChange={(e) => setTempPassword(e.target.value)}
              placeholder="Enter temporary password"
            />
          </div>
          <small className="text-color-secondary">
            User will be required to change this password on next login.
          </small>
        </div>
      </Dialog>
    </div>
  );
};

export default UserListPage;
