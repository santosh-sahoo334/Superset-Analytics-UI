/* eslint-disable */
// @ts-nocheck
/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import React, { FC, Suspense, useEffect,useState, useMemo, useRef, useContext} from 'react';
import { Global } from '@emotion/react';
import { useHistory } from 'react-router-dom';
import {
  CategoricalColorNamespace,
  getSharedLabelColor,
  SharedLabelColorSource,
  t,
  useTheme,
} from '@superset-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import { useToasts } from 'src/components/MessageToasts/withToasts';
import Loading from 'src/components/Loading';
import {
  useDashboard,
  useDashboardCharts,
  useDashboardDatasets,
} from 'src/hooks/apiResources';
import { hydrateDashboard } from 'src/dashboard/actions/hydrate';
import { setDatasources } from 'src/dashboard/actions/datasources';
import injectCustomCss from 'src/dashboard/util/injectCustomCss';

import { LocalStorageKeys, setItem } from 'src/utils/localStorageHelpers';
import { URL_PARAMS } from 'src/constants';
import { getUrlParam } from 'src/utils/urlUtils';
import { setDatasetsStatus } from 'src/dashboard/actions/dashboardState';
import {
  getFilterValue,
  getPermalinkValue,
} from 'src/dashboard/components/nativeFilters/FilterBar/keyValue';
import DashboardContainer from 'src/dashboard/containers/Dashboard';

import shortid from 'shortid';
import { DashboardLayout, RootState } from '../types';
import {
  chartContextMenuStyles,
  filterCardPopoverStyle,
  headerStyles,
} from '../styles';
import SyncDashboardState, {
  getDashboardContextLocalStorage,
} from '../components/SyncDashboardState';
import { LayoutContext } from 'src/layout/context/layoutcontext';
import CsightDashboard from 'src/components/CsightDashboard';
import CsightBudgetUnit from 'src/components/CsightBudgetUnit';
import CsightUserManagement from 'src/components/CsightUserManagement';
import getBootstrapData from 'src/utils/getBootstrapData';
import UserInformation from 'src/components/UserInformation';
import { isCustomerAdmin } from 'src/components/CsightCommon/config/http-common';
import React from 'react';
import { RootState } from '../reducers/types';

const bootstrapData = getBootstrapData();

export const DashboardPageIdContext = React.createContext('');

const DashboardBuilder = React.lazy(
  () =>
    import(
      /* webpackChunkName: "DashboardContainer" */
      /* webpackPreload: true */
      'src/dashboard/components/DashboardBuilder/DashboardBuilder'
    ),
);

const UnderConstruction = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      textAlign: 'center'
    }}>
      <svg xmlns="http://www.w3.org/2000/svg" 
           id="coming_soon" 
           height="200px" 
           width="200px" 
           viewBox="0 0 512 512"
           style={{ marginBottom: '20px' }}
      >
        <g>
            <g>
                <circle cx="319.528" cy="256" fill="#95d6a4" r="184.972" data-original="#95D6A4" className="active-path" style={{ fill: "#E33B3B" }} data-old_color="#95d6a4" />
                <path d="m319.528 71.029c-4.682 0-9.322.178-13.917.52 95.656 7.115 171.055 86.976 171.055 184.451s-75.399 177.336-171.055 184.452c4.595.342 9.235.52 13.917.52 102.157-.001 184.972-82.815 184.972-184.972s-82.815-184.971-184.972-184.971z" fill="#78c2a4" data-original="#78C2A4" className="" style={{ fill: "#FB5252" }} data-old_color="#78c2a4" />
                <circle cx="319.528" cy="256" fill="#f4fbff" r="142.033" data-original="#F4FBFF" className="" style={{ fill: "#F4FBFF" }} />
                <path d="m319.528 113.967c-4.321 0-8.594.204-12.817.582 72.435 6.48 129.215 67.33 129.215 141.451s-56.78 134.97-129.215 141.451c4.223.377 8.496.582 12.817.582 78.443 0 142.033-63.59 142.033-142.032 0-78.444-63.59-142.034-142.033-142.034z" fill="#daf1f4" data-original="#DAF1F4" className="" style={{ fill: "#DAF1F4" }} />
                <g>
                    <path d="m38.872 149.21h79.098c4.142 0 7.5-3.357 7.5-7.5s-3.358-7.5-7.5-7.5h-79.098c-4.142 0-7.5 3.357-7.5 7.5s3.357 7.5 7.5 7.5z" data-original="#000000" className="" style={{ fill: "#000000" }} />
                    <path d="m115.258 185.317h-31.246c-4.142 0-7.5 3.357-7.5 7.5s3.358 7.5 7.5 7.5h31.246c4.142 0 7.5-3.357 7.5-7.5s-3.358-7.5-7.5-7.5z" data-original="#000000" className="" style={{ fill: "#000000" }} />
                    <path d="m7.5 237.327h76.512c4.142 0 7.5-3.357 7.5-7.5s-3.358-7.5-7.5-7.5h-76.512c-4.142 0-7.5 3.357-7.5 7.5s3.358 7.5 7.5 7.5z" data-original="#000000" className="" style={{ fill: "#000000" }} />
                    <path d="m125.47 370.289c0-4.143-3.358-7.5-7.5-7.5h-79.098c-4.142 0-7.5 3.357-7.5 7.5s3.358 7.5 7.5 7.5h79.098c4.142 0 7.5-3.357 7.5-7.5z" data-original="#000000" className="" style={{ fill: "#000000" }} />
                    <path d="m115.258 311.683h-31.246c-4.142 0-7.5 3.357-7.5 7.5s3.358 7.5 7.5 7.5h31.246c4.142 0 7.5-3.357 7.5-7.5s-3.358-7.5-7.5-7.5z" data-original="#000000" className="" style={{ fill: "#000000" }} />
                    <path d="m91.512 282.173c0-4.143-3.358-7.5-7.5-7.5h-76.512c-4.142 0-7.5 3.357-7.5 7.5s3.358 7.5 7.5 7.5h76.512c4.142 0 7.5-3.357 7.5-7.5z" data-original="#000000" className="" style={{ fill: "#000000" }} />
                    <path d="m319.529 165.83c4.143 0 7.5-3.357 7.5-7.5v-11.448c0-4.143-3.357-7.5-7.5-7.5s-7.5 3.357-7.5 7.5v11.448c0 4.143 3.357 7.5 7.5 7.5z" data-original="#000000" className="" style={{ fill: "#000000" }} />
                    <path d="m401.99 173.538c-2.93-2.928-7.678-2.928-10.607 0l-8.095 8.095c-2.929 2.93-2.929 7.678 0 10.607 2.931 2.929 7.678 2.928 10.607 0l8.095-8.095c2.928-2.929 2.928-7.677 0-10.607z" data-original="#000000" className="" style={{ fill: "#000000" }} />
                    <path d="m417.199 248.5c-4.143 0-7.5 3.357-7.5 7.5s3.357 7.5 7.5 7.5h11.447c4.143 0 7.5-3.357 7.5-7.5s-3.357-7.5-7.5-7.5z" data-original="#000000" className="" style={{ fill: "#000000" }} />
                    <path d="m393.895 319.759c-2.93-2.928-7.678-2.928-10.607 0-2.929 2.93-2.929 7.678 0 10.607l8.095 8.095c2.931 2.929 7.678 2.928 10.607 0 2.929-2.93 2.929-7.678 0-10.607z" data-original="#000000" className="" style={{ fill: "#000000" }} />
                    <path d="m312.029 353.67v11.447c0 4.143 3.357 7.5 7.5 7.5s7.5-3.357 7.5-7.5v-11.447c0-4.143-3.357-7.5-7.5-7.5s-7.5 3.358-7.5 7.5z" data-original="#000000" className="" style={{ fill: "#000000" }} />
                    <path d="m245.162 319.759-8.095 8.095c-2.929 2.93-2.929 7.678 0 10.607 2.93 2.929 7.678 2.928 10.606 0l8.095-8.095c2.929-2.93 2.929-7.678 0-10.607-2.928-2.928-7.677-2.928-10.606 0z" data-original="#000000" className="" style={{ fill: "#000000" }} />
                    <path d="m210.411 248.5c-4.142 0-7.5 3.357-7.5 7.5s3.358 7.5 7.5 7.5h11.448c4.142 0 7.5-3.357 7.5-7.5s-3.358-7.5-7.5-7.5z" data-original="#000000" className="" style={{ fill: "#000000" }} />
                    <path d="m255.769 181.633-8.095-8.095c-2.929-2.928-7.678-2.928-10.606 0-2.929 2.93-2.929 7.678 0 10.607l8.095 8.095c2.93 2.929 7.678 2.928 10.606 0 2.929-2.929 2.929-7.677 0-10.607z" style={{ fill: "#000000" }} />
                    <path d="m359.859 256c0-4.143-3.357-7.5-7.5-7.5h-25.33v-55.684c0-4.143-3.357-7.5-7.5-7.5s-7.5 3.357-7.5 7.5v63.184c0 4.143 3.357 7.5 7.5 7.5h32.83c4.142 0 7.5-3.357 7.5-7.5z" style={{ fill: "#000000" }} />
                    <path d="m461.741 254.762c4.135-.251 7.283-3.806 7.032-7.94-4.771-78.703-70.327-140.354-149.245-140.354-82.452 0-149.532 67.08-149.532 149.533 0 82.452 67.08 149.532 149.532 149.532 73.869 0 136.9-54.122 147.865-127.157.615-4.096-2.207-7.915-6.304-8.53-4.086-.613-7.915 2.206-8.53 6.304-9.85 65.614-66.506 114.384-133.031 114.384-74.181 0-134.532-60.351-134.532-134.532s60.351-134.533 134.532-134.533c71.001 0 129.98 55.461 134.272 126.263.25 4.132 3.802 7.27 7.941 7.03z" style={{ fill: "#000000" }} />
                    <path d="m319.528 63.529c-26.381 0-52.228 5.473-76.018 15.708h-132.329c-4.142 0-7.5 3.357-7.5 7.5s3.358 7.5 7.5 7.5h104.113c-14.077 9.06-27.036 19.988-38.462 32.604-2.78 3.069-2.546 7.812.524 10.593 3.071 2.781 7.812 2.546 10.594-.524 33.602-37.102 81.561-58.381 131.578-58.381 97.858 0 177.472 79.613 177.472 177.471 0 97.857-79.613 177.471-177.472 177.471-97.858 0-177.471-79.613-177.471-177.471 0-34.268 9.789-67.528 28.307-96.186 2.248-3.479 1.25-8.121-2.229-10.369-3.479-2.247-8.121-1.251-10.37 2.229-20.09 31.088-30.708 67.163-30.708 104.326 0 67.766 35.206 127.458 88.285 161.763h-104.16c-4.142 0-7.5 3.357-7.5 7.5s3.358 7.5 7.5 7.5h132.225c23.36 10.099 49.097 15.708 76.122 15.708 106.128 0 192.471-86.342 192.471-192.471s-86.343-192.471-192.472-192.471z" style={{ fill: "#000000" }} />
                    </g>
            </g>
        </g>
    </svg>
    <h1 style={{ fontSize: '2rem' }}>Coming soon!</h1>
    </div>
  )
}


const originalDocumentTitle = document.title;

type PageProps = {
  idOrSlug: string;
  className?: string;
};

const DashboardWrapper = ({ isVisible, children,className }) => {
  return (
    <div style={{ display: isVisible ? 'block' : 'none' }} className={className}>
      {children}
    </div>
  );
};

export const DashboardPage: FC<PageProps> = ({ idOrSlug,className }: PageProps) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const history = useHistory();
  const dashboardPageId = useMemo(() => shortid.generate(), []);
  const hasDashboardInfoInitiated = useSelector<RootState, Boolean>(
    ({ dashboardInfo }) =>
      dashboardInfo && Object.keys(dashboardInfo).length > 0,
  );
  const { addDangerToast } = useToasts();
  const { result: dashboard, error: dashboardApiError } =
    useDashboard(idOrSlug);   
  const { result: charts, error: chartsApiError } =
    useDashboardCharts(idOrSlug);
  const {
    result: datasets,
    error: datasetsApiError,
    status,
  } = useDashboardDatasets(idOrSlug);
  const isDashboardHydrated = useRef(false);

  const error = dashboardApiError || chartsApiError;
  const readyToRender = Boolean(dashboard && charts);
  const { dashboard_title, css, metadata, id = 0 } = dashboard || {};
  const { activeNavItem } = useContext(LayoutContext);

  const componentPages = [{
    component: <CsightDashboard/>,
    tabName: 'Dashboard'
  },{
    component: <CsightBudgetUnit/>,
    tabName: 'Budget Unit'
  },{
    component: <CsightUserManagement/>,
    tabName: 'User Management'
  },{
    component: <UserInformation userInfo={{
      userName: bootstrapData?.user?.username,
      isActive: bootstrapData?.user?.isActive,
      role: 'FinOps Analyst',
      loginCount: bootstrapData?.user?.loginCount,
      firstName: bootstrapData?.user?.firstName,
      lastName: bootstrapData?.user?.lastName,
      email: bootstrapData?.user?.email
    }}/>,
    tabName: 'Profile'
  }];

  useEffect(() => {
    // mark tab id as redundant when user closes browser tab - a new id will be
    // generated next time user opens a dashboard and the old one won't be reused
    const handleTabClose = () => {
      const dashboardsContexts = getDashboardContextLocalStorage();

      setItem(LocalStorageKeys.DashboardExploreContext, {
        ...dashboardsContexts,
        [dashboardPageId]: {
          ...dashboardsContexts[dashboardPageId],
          isRedundant: true,
        },
      });
    };
    window.addEventListener('beforeunload', handleTabClose);
    return () => {
      window.removeEventListener('beforeunload', handleTabClose);
    };
  }, [dashboardPageId]);


  useEffect(() => {
    dispatch(setDatasetsStatus(status));
  }, [dispatch, status]);

  useEffect(() => {
    // eslint-disable-next-line consistent-return
    async function getDataMaskApplied() {
      const permalinkKey = getUrlParam(URL_PARAMS.permalinkKey);
      const nativeFilterKeyValue = getUrlParam(URL_PARAMS.nativeFiltersKey);
      const isOldRison = getUrlParam(URL_PARAMS.nativeFilters);

      let dataMask = nativeFilterKeyValue || {};
      // activeTabs is initialized with undefined so that it doesn't override
      // the currently stored value when hydrating
      let activeTabs: string[] | undefined;
      if (permalinkKey) {
        const permalinkValue = await getPermalinkValue(permalinkKey);
        if (permalinkValue) {
          ({ dataMask, activeTabs } = permalinkValue.state);
        }
      } else if (nativeFilterKeyValue) {
        dataMask = await getFilterValue(id, nativeFilterKeyValue);
      }
      if (isOldRison) {
        dataMask = isOldRison;
      }

      if (readyToRender) {
        if (!isDashboardHydrated.current) {
          isDashboardHydrated.current = true;
        }
        dispatch(
          hydrateDashboard({
            history,
            dashboard,
            charts,
            activeTabs,
            dataMask,
          }),
        );
      }
      return null;
    }
    
    if (id) getDataMaskApplied();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readyToRender]);

  useEffect(() => {
    if (dashboard_title) {
      document.title = dashboard_title;
    }
    return () => {
      document.title = originalDocumentTitle;
    };
  }, [dashboard_title]);

  useEffect(() => {
    if (typeof css === 'string') {
      // returning will clean up custom css
      // when dashboard unmounts or changes
      return injectCustomCss(css);
    }
    return () => {};
  }, [css]);

  useEffect(() => {
    const sharedLabelColor = getSharedLabelColor();
    sharedLabelColor.source = SharedLabelColorSource.Dashboard;
    return () => {
      // clean up label color
      const categoricalNamespace = CategoricalColorNamespace.getNamespace(
        metadata?.color_namespace,
      );
      categoricalNamespace.resetColors();
      sharedLabelColor.clear();
    };
  }, [metadata?.color_namespace]);

  useEffect(() => {
    if (datasetsApiError) {
      addDangerToast(
        t('Error loading chart datasources. Filters may not work correctly.'),
      );
    } else {
      dispatch(setDatasources(datasets));
    }
  }, [addDangerToast, datasets, datasetsApiError, dispatch]);

  // Determine if the active view is a custom page (independent of dashboard data)
  const userEmail: any = bootstrapData?.user?.username || null;
  const adminList = process.env.ADMIN_EMAIL || [];
  const isAdmin = adminList.includes(userEmail);

  const customPageNames = ['Dashboard', 'Budget Unit', 'User Management', 'Profile'];
  const isCustomPage = customPageNames.includes(activeNavItem) && !isAdmin;

  // Resolve the custom component (if applicable)
  const getCustomComponent = () => {
    if (activeNavItem === 'User Management' && !isCustomerAdmin()) return null;
    return componentPages.find(p => p.tabName === activeNavItem)?.component || null;
  };

  if (error) throw error; // caught in error boundary

  const customComponent = isCustomPage ? getCustomComponent() : null;

  return (
    <div className={`dashboard-page ${className}`} id="dashboard-page">
      <Global
        styles={[
          filterCardPopoverStyle(theme),
          headerStyles(theme),
          chartContextMenuStyles(theme),
        ]}
      />

      {/* Custom pages: render immediately, no dashboard loading gate */}
      {customComponent && (
        <div style={{ display: isCustomPage ? 'block' : 'none' }}>
          {customComponent}
        </div>
      )}

      {/* Superset Dashboard: render after data ready, hide when custom page active */}
      {(!readyToRender || !hasDashboardInfoInitiated) ? (
        !isCustomPage ? <Loading /> : null
      ) : (
        <div style={{ display: isCustomPage ? 'none' : 'block' }}>
          <SyncDashboardState dashboardPageId={dashboardPageId} />
          <DashboardPageIdContext.Provider value={dashboardPageId}>
            <DashboardContainer>
              <Suspense fallback={<Loading />}>
                <DashboardBuilder />
              </Suspense>
            </DashboardContainer>
          </DashboardPageIdContext.Provider>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
