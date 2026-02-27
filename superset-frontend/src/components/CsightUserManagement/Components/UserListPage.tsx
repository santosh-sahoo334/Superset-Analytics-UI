/* eslint-disable */
// @ts-nocheck
import React, { useEffect, useState, useMemo } from "react";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { Tag } from "primereact/tag";
import { ProgressSpinner } from "primereact/progressspinner";
import { InputText } from "primereact/inputtext";
import { HTTP, isCustomerAdmin, parseJWT, Cookies, REFRESH_TOKEN } from "../../CsightCommon/config/http-common";
import { useToast } from "../../CsightCommon/context/ToastContext";

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  enabled: boolean;
  created_on: number | null;
  username: string;
  is_admin: boolean;
  is_federated: boolean;
  unit_access?: string[];
}

interface UnitEconConfig {
  display_name: string;
  values: string[];
  role_prefix: string;
}

interface UserListPageProps {
  onCreateUser: () => void;
  onEditUser: (user: User) => void;
  unitEconConfig: UnitEconConfig | null;
}

const UserListPage: React.FC<UserListPageProps> = ({ onCreateUser, onEditUser, unitEconConfig }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState<boolean>(false);
  const [showResetPasswordDialog, setShowResetPasswordDialog] = useState<boolean>(false);
  const [tempPassword, setTempPassword] = useState<string>("");
  const [promotingUserId, setPromotingUserId] = useState<string | null>(null);
  const { showToast } = useToast();

  // Get current logged-in user's email from JWT
  const currentUserEmail = useMemo(() => {
    try {
      const token = Cookies.get(REFRESH_TOKEN);
      if (!token) return "";
      const payload = parseJWT(token);
      return payload.email || "";
    } catch {
      return "";
    }
  }, []);

  const viewerIsAdmin = useMemo(() => isCustomerAdmin(), []);

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

  const handlePromoteAdmin = async (user: User) => {
    try {
      setPromotingUserId(user.id);
      const resp = await HTTP.post(`usermgmt/users/${user.id}/promote-admin`);
      if (resp.status === 200) {
        showToast("User promoted to admin", "success", "Success");
        fetchUsers();
      }
    } catch (error) {
      showToast(
        error?.response?.data?.error || "Failed to promote user",
        "error",
        "Error"
      );
    } finally {
      setPromotingUserId(null);
    }
  };

  const handleDemoteAdmin = async (user: User) => {
    try {
      setPromotingUserId(user.id);
      const resp = await HTTP.post(`usermgmt/users/${user.id}/demote-admin`);
      if (resp.status === 200) {
        showToast("User demoted from admin", "success", "Success");
        fetchUsers();
      }
    } catch (error) {
      showToast(
        error?.response?.data?.error || "Failed to demote user",
        "error",
        "Error"
      );
    } finally {
      setPromotingUserId(null);
    }
  };

  const unitAccessBodyTemplate = (rowData: User) => {
    const currentAccess = rowData.unit_access || [];

    if (!unitEconConfig) {
      return null;
    }

    return (
      <div className="flex gap-1 flex-wrap">
        {currentAccess.map((v) => (
          <Tag key={v} value={v} severity="info" />
        ))}
        {currentAccess.length === 0 && (
          <span className="text-color-secondary text-sm">None</span>
        )}
      </div>
    );
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

  const roleBodyTemplate = (rowData: User) => {
    return (
      <Tag
        value={rowData.is_admin ? "Admin" : "User"}
        severity={rowData.is_admin ? "warning" : "info"}
      />
    );
  };

  const actionBodyTemplate = (rowData: User) => {
    const isSelf = currentUserEmail && rowData.email === currentUserEmail;
    const isDbUser = !rowData.is_federated;

    return (
      <div className="flex gap-2">
        {/* Edit: Admin can edit DB users, or self if DB user */}
        {isDbUser && (viewerIsAdmin || isSelf) && (
          <Button
            icon="pi pi-pencil"
            className="p-button-rounded p-button-text p-button-sm"
            tooltip="Edit"
            tooltipOptions={{ position: "top" }}
            onClick={() => onEditUser(rowData)}
          />
        )}
        {/* Promote/Demote: Admin only, not for self */}
        {viewerIsAdmin && !isSelf && (
          <Button
            icon={rowData.is_admin ? "pi pi-arrow-down" : "pi pi-arrow-up"}
            className={`p-button-rounded p-button-text p-button-sm ${rowData.is_admin ? "p-button-danger" : "p-button-info"}`}
            tooltip={rowData.is_admin ? "Demote from Admin" : "Promote to Admin"}
            tooltipOptions={{ position: "top" }}
            loading={promotingUserId === rowData.id}
            onClick={() => rowData.is_admin ? handleDemoteAdmin(rowData) : handlePromoteAdmin(rowData)}
          />
        )}
        {/* Activate/Deactivate: Admin only, not for self */}
        {viewerIsAdmin && !isSelf && (
          <Button
            icon={rowData.enabled ? "pi pi-ban" : "pi pi-check-circle"}
            className={`p-button-rounded p-button-text p-button-sm ${rowData.enabled ? "p-button-warning" : "p-button-success"}`}
            tooltip={rowData.enabled ? "Deactivate" : "Activate"}
            tooltipOptions={{ position: "top" }}
            onClick={() => handleToggleStatus(rowData)}
          />
        )}
        {/* Reset Password: DB users only */}
        {isDbUser && (
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
        )}
      </div>
    );
  };

  const header = (
    <div className="flex align-items-center justify-content-between">
      <span className="p-input-icon-left">
        <i className="pi pi-search" style={{ paddingLeft: "0.75rem" }} />
        <InputText
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Search users..."
          className="p-inputtext-sm"
          style={{ paddingLeft: "2.5rem" }}
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
        header={users.length > 0 ? header : null}
        emptyMessage="No users found."
        loading={loading}
        stripedRows
        size="small"
      >
        <Column field="first_name" header="Name" body={nameBodyTemplate} sortable />
        <Column field="email" header="Email" sortable />
        <Column field="is_admin" header="Role" body={roleBodyTemplate} sortable style={{ width: "100px" }} />
        <Column field="enabled" header="Status" body={statusBodyTemplate} sortable style={{ width: "120px" }} />
        {unitEconConfig && (
          <Column
            field="unit_access"
            header={unitEconConfig.display_name}
            body={unitAccessBodyTemplate}
            style={{ width: "240px" }}
          />
        )}
        <Column header="Actions" body={actionBodyTemplate} style={{ width: "220px" }} />
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
