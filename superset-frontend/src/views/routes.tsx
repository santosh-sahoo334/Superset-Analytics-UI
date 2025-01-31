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
import { FeatureFlag, isFeatureEnabled } from '@superset-ui/core';
import React, { lazy } from 'react';
import MainLayoutCsight from './layout/MainLayout';
import getBootstrapData from 'src/utils/getBootstrapData';


// not lazy loaded since this is the home page.
// import Home from 'src/pages/Home';

{/* @ts-ignore: Disable TypeScript check for ReactRouterRoute */}
const ChartCreation = lazy(() =>import(/* webpackChunkName: "ChartCreation" */ 'src/pages/ChartCreation'));
const Home = lazy(() =>import(/* webpackChunkName: "ChartCreation" */ 'src/pages/Home'));

const AnnotationLayerList = lazy(
  () =>
    import(
      /* webpackChunkName: "AnnotationLayerList" */ 'src/pages/AnnotationLayerList'
    ),
);

const AlertReportList = lazy(
  () =>
    import(
      /* webpackChunkName: "AlertReportList" */ 'src/pages/AlertReportList'
    ),
);

const AnnotationList = lazy(
  () =>
    import(/* webpackChunkName: "AnnotationList" */ 'src/pages/AnnotationList'),
);

const ChartList = lazy(
  () => import(/* webpackChunkName: "ChartList" */ 'src/pages/ChartList'),
);

const CssTemplateList = lazy(
  () =>
    import(
      /* webpackChunkName: "CssTemplateList" */ 'src/pages/CssTemplateList'
    ),
);

const DashboardList = lazy(
  () =>
    import(/* webpackChunkName: "DashboardList" */ 'src/pages/DashboardList'),
);

const Dashboard = lazy(
  () => import(/* webpackChunkName: "Dashboard" */ 'src/pages/Dashboard'),
);

const DatabaseList = lazy(
  () => import(/* webpackChunkName: "DatabaseList" */ 'src/pages/DatabaseList'),
);

const DatasetList = lazy(
  () => import(/* webpackChunkName: "DatasetList" */ 'src/pages/DatasetList'),
);

const DatasetCreation = lazy(
  () =>
    import(
      /* webpackChunkName: "DatasetCreation" */ 'src/pages/DatasetCreation'
    ),
);

const ExecutionLogList = lazy(
  () =>
    import(
      /* webpackChunkName: "ExecutionLogList" */ 'src/pages/ExecutionLogList'
    ),
);

const Chart = lazy(
  () => import(/* webpackChunkName: "Chart" */ 'src/pages/Chart'),
);

const QueryHistoryList = lazy(
  () =>
    import(
      /* webpackChunkName: "QueryHistoryList" */ 'src/pages/QueryHistoryList'
    ),
);

const SavedQueryList = lazy(
  () =>
    import(/* webpackChunkName: "SavedQueryList" */ 'src/pages/SavedQueryList'),
);

const SqlLab = lazy(
  () => import(/* webpackChunkName: "SqlLab" */ 'src/pages/SqlLab'),
);

const AllEntities = lazy(
  () => import(/* webpackChunkName: "AllEntities" */ 'src/pages/AllEntities'),
);

const Tags = lazy(
  () => import(/* webpackChunkName: "Tags" */ 'src/pages/Tags'),
);

const RowLevelSecurityList = lazy(
  () =>
    import(
      /* webpackChunkName: "RowLevelSecurityList" */ 'src/pages/RowLevelSecurityList'
    ),
);

type Routes = {
  path: string;
  Component: React.ComponentType;
  Fallback?: React.ComponentType;
  props?: React.ComponentProps<any>;
  layout?: React.ComponentType
}[];

export const routes: Routes = [
  // Default route that's always available
  {
    path: '/dworks/dashboard/:idOrSlug/',
    Component: Dashboard,
    layout: MainLayoutCsight
  },
];

// Admin-only routes
const adminRoutes: Routes = [
  {
    path: '/dworks/welcome/',
    Component: Home,
  },
  {
    path: '/dashboard/list/',
    Component: DashboardList,
  },
  {
    path: '/chart/add',
    Component: ChartCreation,
  },
  {
    path: '/chart/list/',
    Component: ChartList,
  },
  {
    path: '/tablemodelview/list/',
    Component: DatasetList,
  },
  {
    path: '/databaseview/list/',
    Component: DatabaseList,
  },
  {
    path: '/savedqueryview/list/',
    Component: SavedQueryList,
  },
  {
    path: '/csstemplatemodelview/list/',
    Component: CssTemplateList,
  },
  {
    path: '/annotationlayer/list/',
    Component: AnnotationLayerList,
  },
  {
    path: '/annotationlayer/:annotationLayerId/annotation/',
    Component: AnnotationList,
  },
  {
    path: '/sqllab/history/',
    Component: QueryHistoryList,
  },
  {
    path: '/alert/list/',
    Component: AlertReportList,
  },
  {
    path: '/report/list/',
    Component: AlertReportList,
    props: {
      isReportEnabled: true,
    },
  },
  {
    path: '/alert/:alertId/log/',
    Component: ExecutionLogList,
  },
  {
    path: '/report/:alertId/log/',
    Component: ExecutionLogList,
    props: {
      isReportEnabled: true,
    },
  },
  {
    path: '/explore/',
    Component: Chart,
  },
  {
    path: '/dworks/explore/p',
    Component: Chart,
  },
  {
    path: '/dataset/add/',
    Component: DatasetCreation,
  },
  {
    path: '/dataset/:datasetId',
    Component: DatasetCreation,
  },
  {
    path: '/rowlevelsecurity/list',
    Component: RowLevelSecurityList,
  },
  {
    path: '/sqllab/',
    Component: SqlLab,
  },
];

// Get bootstrap data and check admin status
const bootstrapData = getBootstrapData();
const userEmail = bootstrapData?.user?.username || null;
const adminList = process.env.ADMIN_EMAIL || [];

// Add admin routes if user is admin
if (userEmail && adminList?.includes(userEmail)) {
  routes.push(...adminRoutes);
}

if (isFeatureEnabled(FeatureFlag.TaggingSystem)) {
  if (userEmail && adminList?.includes(userEmail)) {
    routes.push({
      path: '/dworks/all_entities/',
      Component: AllEntities,
    });
    routes.push({
      path: '/dworks/tags/',
      Component: Tags,
    });
  }
}

const frontEndRoutes:any = routes
  .map(r => r.path)
  .reduce(
    (acc, curr) => ({
      ...acc,
      [curr]: true,
    }),
    {},
  );

export function isFrontendRoute(path?: string) {
  if (path) {
    const basePath = path.split(/[?#]/)[0]; // strip out query params and link bookmarks
    return !!frontEndRoutes[basePath];
  }
  return false;
}
