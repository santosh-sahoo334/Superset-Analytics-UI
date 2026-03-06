/* eslint-disable */
// @ts-nocheck
import React, { useState, useCallback, useEffect } from "react";
import { Button } from "primereact/button";
import UserListPage from "./Components/UserListPage";
import CreateUserForm from "./Components/CreateUserForm";
import EditUserForm from "./Components/EditUserForm";
import { HTTP } from "../CsightCommon/config/http-common";
import { FeatureFlag, isFeatureEnabled } from "@superset-ui/core";

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  enabled: boolean;
  created_on: number | null;
  username: string;
  is_admin: boolean;
  unit_access?: string[];
}

interface UnitEconConfig {
  display_name: string;
  values: string[];
  role_prefix: string;
}

const CsightUserManagement = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [unitEconConfig, setUnitEconConfig] = useState<UnitEconConfig | null>(null);

  useEffect(() => {
    if (isFeatureEnabled(FeatureFlag.CsightRlsFlag)) {
      HTTP.get("usermgmt/unit-economics")
        .then((resp) => setUnitEconConfig(resp.data))
        .catch(() => setUnitEconConfig(null));
    }
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowEditDialog(true);
  };

  return (
    <div>
      <div className="h-full bg-white" style={{ margin: "10px 15px", width: "98%", borderRadius: "4px" }}>
        <div className="px-2 pb-4 pt-2 w-full custom-table no-data dashboard-table">
          <div className="flex align-items-center justify-content-between w-full mb-2 horizontal-border pb-2">
            <h3 className="text-2xl custom-text-grey">User Management</h3>
            <Button
              label="Add User"
              className="custom-bg-light-blue"
              icon="pi pi-user-plus"
              onClick={() => setShowCreateDialog(true)}
            />
          </div>
          <UserListPage
            key={refreshKey}
            onCreateUser={() => setShowCreateDialog(true)}
            onEditUser={handleEditUser}
            unitEconConfig={unitEconConfig}
          />
        </div>
      </div>

      <CreateUserForm
        visible={showCreateDialog}
        onHide={() => setShowCreateDialog(false)}
        onSuccess={handleRefresh}
        unitEconConfig={unitEconConfig}
      />

      <EditUserForm
        visible={showEditDialog}
        user={selectedUser}
        onHide={() => {
          setShowEditDialog(false);
          setSelectedUser(null);
        }}
        onSuccess={handleRefresh}
        unitEconConfig={unitEconConfig}
      />
    </div>
  );
};

export default CsightUserManagement;
