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
  const { breadcrumbs,clickedNavItem } = useContext(LayoutContext);

  useEffect(() => {
    const filteredBreadcrumbs = breadcrumbs?.find((crumb) => {
      const lastPathSegment = crumb.to.split("/").pop();
      const lastRouterSegment = pathname.split("/").pop();

      if (
        lastRouterSegment?.startsWith("[") &&
        !isNaN(Number(lastPathSegment))
      ) {
        return (
          pathname.split("/").slice(0, -1).join("/") ===
          crumb.to?.split("/").slice(0, -1).join("/")
        );
      }
      return crumb.to === pathname;
    });

    // Set "Dashboard" breadcrumb if route is "/"
    if (pathname === "/") {
      setBreadcrumb({ labels: ["Dashboard"] });
    } else {
      setBreadcrumb(filteredBreadcrumbs);
    }
  }, [pathname, breadcrumbs]);

  const replaceName:any = {
    'Billing Plans': 'Billing',
    'Tags': 'Anamoly',
    'Budget vs Actuals': 'Bud vs Act',
    'BudgetUnit': 'BudgetUnit'
  }

  return (
    <nav className="layout-breadcrumb">
      <ol>
      <li key={clickedNavItem}>{clickedNavItem}</li>
        {/* {ObjectUtils.isNotEmpty(breadcrumb)
          ? breadcrumb.labels.map((label, index) => (
              <React.Fragment key={index}>
                {index !== 0 && (
                  <li className="layout-breadcrumb-chevron"> | </li>
                )}
                <li key={index}>{label}</li>
              </React.Fragment>
            ))
          : null} */}
      </ol>
    </nav>
  );
};

export default AppBreadcrumb;
