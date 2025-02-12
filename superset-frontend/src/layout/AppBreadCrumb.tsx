/* eslint-disable */
// @ts-nocheck
import { useLocation } from "react-router-dom";
import { ObjectUtils } from "primereact/utils";
import React, { useContext, useEffect, useState } from "react";
import { LayoutContext } from "./context/layoutcontext";
import { Breadcrumb } from "../types/layout";

const AppBreadcrumb = () => {
  const { pathname } = useLocation();
  const [breadcrumb, setBreadcrumb] = useState<Breadcrumb | null>(null);
  const { clickedNavItem } = useContext(LayoutContext);
  

  const breadcrumbs = [
    {from: null, labels: 'Dashboard'},
    {from: null, labels: 'Profile'},
    
    {from: 'Observe', labels: 'Cost'},
    {from: 'Observe', labels: 'Billing'},
    {from: 'Observe', labels: 'Utilization'},
    {from: 'Observe', labels: 'Tags'},

    {from: 'Optimize', labels: 'Recommendations'},
    {from: 'Optimize', labels: 'Observability'},
    {from: 'Optimize', labels: 'Anomaly'},

    {from: 'Operate', labels: 'Governance'},
    {from: 'Operate', labels: 'Bud vs Act', replaceName: 'Budget vs Actuals'},
    {from: 'Operate', labels: 'Budget Unit'},
    {from: 'Operate', labels: 'GreenOps', replaceName: 'Green Ops'},

    {from: null, labels: 'OnPrem'},
  ];

  // useEffect(() => {
  //   const filteredBreadcrumbs = breadcrumbs?.find((crumb) => {
  //     const lastPathSegment = crumb.to.split("/").pop();
  //     const lastRouterSegment = pathname.split("/").pop();

  //     if (
  //       lastRouterSegment?.startsWith("[") &&
  //       !isNaN(Number(lastPathSegment))
  //     ) {
  //       return (
  //         pathname.split("/").slice(0, -1).join("/") ===
  //         crumb.to?.split("/").slice(0, -1).join("/")
  //       );
  //     }
  //     return crumb.to === pathname;
  //   });

  //   // Set "Dashboard" breadcrumb if route is "/"
  //   if (pathname === "/") {
  //     setBreadcrumb({ labels: ["Dashboard"] });
  //   } else {
  //     setBreadcrumb(filteredBreadcrumbs);
  //   }
  // }, [pathname, breadcrumbs]);

  const replaceName:any = {
    'Billing Plans': 'Billing',
    'Tags': 'Anamoly',
    'Budget vs Actuals': 'Bud vs Act',
    'BudgetUnit': 'BudgetUnit'
  }

  return (
    <nav className="layout-breadcrumb" style={{display: 'flex'}}>
      <ol>
        {breadcrumbs.map((item) => {
          if (item.labels === clickedNavItem) {
            return (
              <li key={item.labels}>
                {item.from && `${item.from}`}&nbsp;&nbsp;
                {item.from && `|`}
                &nbsp;&nbsp;{item.replaceName || item.labels}
              </li>
            );
          }
          return null;
        })}
      </ol>
    </nav>
  );
};

export default AppBreadcrumb;
