/* eslint-disable */
import { MenuModal } from "../types/layout";
import AppSubMenu from "./AppSubMenu";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  DollarOutlined
} from '@ant-design/icons';


const AppMenu = () => {
  const { pathname } = useLocation();
  const model: MenuModal[] = [
    {
      label: "Dashboard",
      to: "",
      image: "/static/assets/images/layout/images/dashboard.png",
      items: [],
    },
    {
      label: "Observe",
      image: "/static/assets/images/layout/images/observe.png",
      items: [
        { label: "Cost", image: "/static/assets/images/layout/images/bill.png", to: "", tabName: "Cost" },
        {
          label: "Utilization",
          image: "/static/assets/images/layout/images/cpu.png",
          to: "",
          tabName: "Utilization"
        },
        { label: "Tags", image: "/static/assets/images/layout/images/price-tag.png", to: "", tabName: "Tags" },
        { label: "Billing", image: "/static/assets/images/layout/images/bill.png", to: "", tabName: "Billing Plans" },
      ],
    },
    {
      label: "Optimize",
      image: "/static/assets/images/layout/images/optimize.png",
      items: [
        {
          label: "Observability",
          image: "/static/assets/images/layout/images/save-the-planet.png",
          to: "/observability", tabName: "Observability" 
        },
        {
          label: "Anomaly",
          image: "/static/assets/images/layout/images/glitch.png",
          to: "/anomaly", tabName: "Tags"
        },
        {
          label: "Recommendations",
          image: "/static/assets/images/layout/images/like.png",
          to: "/recommendations", tabName: "Recommendations" 
        },
      ],
    },
    {
      label: "Operate",
      image: "/static/assets/images/layout/images/operational.png",
      items: [
        {
          label: "Governance",
          to: "/governance",
          image: "/static/assets/images/layout/images/government.png",
          tabName: "Executive Report"
        },
        {
          label: "Budget",
          icon: <DollarOutlined style={{marginRight: 10,marginLeft: 5}}/>,
          items: [
            {
              label: "Bud vs Act",
              to: "/budget",
              image: "/static/assets/images/layout/images/profit.png",
              className: "ml-2",
              tabName: "Budget vs Actuals" 
            },
            {
              label: "Budget Unit",
              to: "/budget-unit",
              image: "/static/assets/images/layout/images/calculator.png",
              className: "ml-2",
              tabName: "Budget Unit"
            },
          ],
        },
        {
          label: "Green Ops",
          to: "",
          image: "/static/assets/images/layout/images/save-the-planet.png",
          tabName: "GreenOps"
        },
      ],
    },
    {
      label: "OnPrem",
      to: "",
      image: "/static/assets/images/layout/images/money.png",
      items: [],
      tabName: "OnPrem"
    },
  ];

  const [filteredModel, setFilteredModel] = useState<MenuModal[]>(model);



  useEffect(() => {
    if (pathname === "/") {
      setFilteredModel(model.filter((item) => item.label !== "Dashboard"));
    } else {
      setFilteredModel(model);
    }
  }, [pathname]);

  return <AppSubMenu model={filteredModel} />;
};

export default AppMenu;
