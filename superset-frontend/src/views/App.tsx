// @ts-nocheck
/* eslint-disable */
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
import React, { Suspense, useEffect } from 'react';
import { hot } from 'react-hot-loader/root';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useLocation,
  Redirect,
} from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { GlobalStyles } from 'src/GlobalStyles';
import ErrorBoundary from 'src/components/ErrorBoundary';
import Loading from 'src/components/Loading';
import Menu from 'src/features/home/Menu';
import getBootstrapData from 'src/utils/getBootstrapData';
import ToastContainer from 'src/components/MessageToasts/ToastContainer';
import setupApp from 'src/setup/setupApp';
import setupPlugins from 'src/setup/setupPlugins';
import { routes, isFrontendRoute } from 'src/views/routes';
import { Logger, LOG_ACTIONS_SPA_NAVIGATION } from 'src/logger/LogUtils';
import setupExtensions from 'src/setup/setupExtensions';
import { logEvent } from 'src/logger/actions';
import { store } from 'src/views/store';
import { RootContextProviders } from './RootContextProviders';
import { ScrollToTop } from './ScrollToTop';
import RootLayout from 'src/pages/rootLayout';
import { AuthProvider } from 'src/components/CsightCommon/context/AuthContext';
import { AIBotProvider } from 'src/components/CsightChatbot/Context';
import ScrollButtons from 'src/components/ScrollButtons';
import MainLayout from 'src/components/MainLayout';
import RootLayoutCsight from './layout/layout';
import MainLayoutCsight from './layout/MainLayout';
import Cookies from 'js-cookie';
import "../../src/styles/UI/page.scss";
import "../../src/styles/UI/field.scss";
import "../../src/styles/UI/stepper.scss";
import "../../src/styles/layout/layout.scss";
// import Login from 'src/pages/Login';

setupApp();
setupPlugins();
setupExtensions();

const bootstrapData = getBootstrapData();

const userEmail:any = bootstrapData?.user?.username || null;

const adminList =process.env.ADMIN_EMAIL || [];


let lastLocationPathname: string;

const boundActions = bindActionCreators({ logEvent }, store.dispatch);

const LocationPathnameLogger = () => {
  const location = useLocation();
  useEffect(() => {
    // This will log client side route changes for single page app user navigation
    boundActions.logEvent(LOG_ACTIONS_SPA_NAVIGATION, {
      path: location.pathname,
    });
    // reset performance logger timer start point to avoid soft navigation
    // cause dashboard perf measurement problem
    if (lastLocationPathname && lastLocationPathname !== location.pathname) {
      Logger.markTimeOrigin();
    }
    lastLocationPathname = location.pathname;
  }, [location.pathname]);
  return <></>;
};

const App = () => {

  useEffect(() => {
    if(userEmail && !adminList?.includes(userEmail)){
      const mainMenu = document.getElementById('main-menu');
      if (mainMenu) {
        mainMenu.style.display = 'none';
      }
    }
  }, [bootstrapData]);

  return (
    <Router>
      <AIBotProvider>
        

      <RootLayout>
        {/* <ScrollButtons /> */}
    <LocationPathnameLogger />
    <RootContextProviders>
      <GlobalStyles />
      
      {
      userEmail && adminList?.includes(userEmail) ?
      <Menu
        data={bootstrapData.common.menu_data}
        isFrontendRoute={isFrontendRoute}
      /> : null
      }
      <Switch>
        {routes.map(({ path, Component, props = {}, Fallback = Loading,layout: Layout }) => (
          <Route path={path} key={path} >
            <Suspense fallback={<Fallback />}>
              <ErrorBoundary>
                { Layout && userEmail && !adminList?.includes(userEmail) ? <AuthProvider><Layout> <Component user={bootstrapData.user} {...props} /> </Layout></AuthProvider> : <Component user={bootstrapData.user} {...props} />}
              </ErrorBoundary>
            </Suspense>
          </Route>
        ))}
        <Route path="*">
          <Redirect to={`/dworks/dashboard/${Cookies.get('slug') || 'teksecur'}/`} />
        </Route>
      </Switch>
      {
      userEmail && adminList?.includes(userEmail) ?
      <ToastContainer /> : null
      }
        </RootContextProviders>
      </RootLayout>
      </AIBotProvider>
    </Router>
  );
};

export default hot(App);
