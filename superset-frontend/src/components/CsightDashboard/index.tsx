/* eslint-disable */
// @ts-nocheck

import { Card } from "primereact/card";
import React, { useContext, useEffect, useState } from "react";
import SearchDashboard from "../CsightCommon/SearchDashboard";
import { RecommendationsTable } from "../CsightCommon/dashboardCardData/Recommendations";
import PotentalSavings from "../CsightCommon/dashboardCardData/PotentialSavings";
import ResourcesTable from "../CsightCommon/dashboardCardData/Resources";
import AlertsTableUI from "../CsightCommon/dashboardCardData/Alerts";
import { HTTP } from "../CsightCommon/config/http-common";
import { useHistory } from "react-router-dom";
import LoadingSpinner from "../CsightCommon/LoadingSpinner";
import { useAuth } from "../CsightCommon/context/AuthContext";
import { LayoutContext } from "src/layout/context/layoutcontext";

const searchIconsData = {
  cost: { icon: "/static/assets/images/layout/images/bill.png", title: "Cost" },
  utilization: { icon: "/static/assets/images/layout/images/cpu.png", title: "Utilization" },
  dashboard: {
    icon: "/static/assets/images/layout/images/satisfaction-scale.png",
    title: "Dashboard",
  },
  recommendations: {
    icon: "/static/assets/images/layout/images/notebook.png",
    title: "Recommendation",
  },
  anomaly: {
    icon: "/static/assets/images/layout/images/glitch.png",
    title: "Anomaly",
  },
  billing: {
    icon: "/static/assets/images/layout/images/bill.png",
    title: "Billing",
  },
  governance: {
    icon: "/static/assets/images/layout/images/government.png",
    title: "Governance",
  },
  'green ops': {
    icon: "/static/assets/images/layout/images/save-the-planet.png",
    title: "GreenOps",
  },
  observability: {
    icon: "/static/assets/images/layout/images/save-the-planet.png",
    title: "Observability",
  },
  tags: {
    icon: "/static/assets/images/layout/images/price-tag.png",
    title: "Tags",
  },
  budget: {
    icon: "/static/assets/images/layout/images/profit.png",
    title: "Budget",
  }
};

const listNavItems = [{
  key: 'anomaly',
  navItem: 'Tags',
  selectItem: 'Anomaly'
},{
  key: 'billing',
  navItem: 'Billing Plans',
  selectItem: 'Billing'
},{
  key: 'cost',
  navItem: 'Cost',
  selectItem: 'Cost'
},{
  key: 'governance',
  navItem: 'Executive Report',
  selectItem: 'Governance'
},{
  key: 'green ops',
  navItem: 'GreenOps',
  selectItem: 'Green ops'
},{
  key: 'observability',
  navItem: 'Observability',
  selectItem: 'Observability'
},{
  key: 'recommendations',
  navItem: 'Recommendations',
  selectItem: 'Recommendations'
},{
  key: 'tags',
  navItem: 'Tags',
  selectItem: 'Tags'
},{
  key: 'utilization',
  navItem: 'Utilization',
  selectItem: 'Utilization'
},{
  key: 'budget',
  navItem: 'Budget vs Actuals',
  selectItem: 'Budget'
},{
  key: 'on prem',
  navItem: 'OnPrem',
  selectItem: ''
}];


type RecentSubSearch = {
  count: number;
  keyword: string;
  last_searched: string;
};

type SearchData = {
  count: number;
  keyword: string;
  last_searched: string;
  recent_sub_searches?: RecentSubSearch[];
};

const CsightDashboard = () => {
  const [savingsData, setSavingsData] = useState<any>([]);
  const [costData, setCostData] = useState<any>([]);
  // const defaultOrder = ["Cost", "Utilization", "Dashboard", "Recommendation"];
  const defaultOrder: SearchData[] = [
    {
      count: 1,
      keyword: "Cost",
      last_searched: "2024-11-21T14:10:28.566449",
    },
    {
      count: 1,
      keyword: "Utilization",
      last_searched: "2024-11-21T14:10:28.566449",
    },
    {
      count: 1,
      keyword: "Dashboard",
      last_searched: "2024-11-21T14:10:28.566449",
    },
    {
      count: 1,
      keyword: "Recommendation",
      last_searched: "2024-11-21T14:10:28.566449",
    },
  ];

  const [searchOrder, setSearchOrder] = useState<SearchData[]>(defaultOrder);
  const [loading, setLoading] = useState<Boolean>(true);
  const [recentSearchLoader, setRecentSearchLoader] = useState<Boolean>(true);
  const history = useHistory();

  const { accessToken } = useAuth();
  const openDocument = (url) => {
    window.open(url, "_blank"); // Open document in a new tab
  };

  const getMonthlyAndPotentialSavings = async () => {
    try {
      setLoading(true);
      const savingResponse = await HTTP.get("/savings/", {
        headers: { Authorization: accessToken },
      });
      const costResponse = await HTTP.get("/cost/", {
        headers: { Authorization: accessToken },
      });
      setCostData(costResponse?.data);
      setSavingsData(savingResponse?.data);
    } catch (error) {
      console.error("Failed to fetch savings:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSearchOrder = async () => {
    try {
      setRecentSearchLoader(true);
      const response = await HTTP.get("/search/");
      setSearchOrder(response?.data?.recent_searches);
    } catch (error) {
      console.log("serachorder-error", error);
    } finally {
      setRecentSearchLoader(false);
    }
  };

  useEffect(() => {
    getSearchOrder();
    getMonthlyAndPotentialSavings();
  }, []);

 

  const { activeNavItem, setActiveNavItem,setClickedNavItem } = useContext(LayoutContext);

  const updateRecentSearch = async (searchKeyword: string) => {
    try {
      await HTTP.post("/search/", {
        keyword: searchKeyword?.toLowerCase(),
      });
    } catch (error) {}
  };

  const handleItemClick = (routeItem,searchTerm) => {
    updateRecentSearch(routeItem?.label);
    const filterSelectItems = listNavItems.filter(item=>item.selectItem == routeItem?.label);
    if(filterSelectItems && filterSelectItems.length>0){
      if(routeItem?.label == 'Budget'){
        if(searchTerm?.includes('un')){
          setActiveNavItem('Budget Unit');
          setClickedNavItem('Budget Unit')
        }else{
          setActiveNavItem('Budget vs Actuals');
          setClickedNavItem('Bud vs Act')
        }
      }else{
        setActiveNavItem(filterSelectItems?.[0]?.navItem);
        setClickedNavItem(filterSelectItems?.[0]?.selectItem)
      }
    }
    // history.push(routeItem?.route);

  };

  return (
    <div className="flex flex-column w-full gap-2 pl-2 pr-2 mt-[50px]">
      <Card className="card-bg w-full custom-dashboard-card">
        <div className="flex flex-column md:flex-row gap-4 justify-content-between align-items-center">
          {/* Left Side Potential Savings */}
          <div className="w-full md:w-3 relative percenatge-saved-card ">
            <div className="percenatge-saved-left-card flex-shrink-0 w-full md:w-3 equal-card-size">
              <PotentalSavings
                title="Monthly Cost"
                result={costData?.result}
                loading={loading}
              />
            </div>
          </div>

          {/* Centered Circle Icon Section */}
          <div className="flex flex-column align-items-center w-full md:w-6">
            <SearchDashboard onClickItem={handleItemClick} />
            <div
              className={`md:gap-0 gap-4 flex flex-column justify-content-center md:w-full sm:flex-row dashboard-width`}
            >
              {" "}
              <div
                className={`${
                  searchOrder.length < 1
                    ? "empty-circle-container px-1 py-2"
                    : ""
                } flex justify-content-center`}
              >
                {recentSearchLoader ? (
                  <div className="circle-container-loader px-1 py-2">
                    {" "}
                    <LoadingSpinner size="30px" />
                  </div>
                ) : (
                  searchOrder?.map((item, index) => {
                    return (
                      <div className="circle-container px-1 py-2" key={index}>
                        <div className="circle-border">
                          <img
                            src={
                              searchIconsData[item.keyword?.toLowerCase()]?.icon
                            }
                            alt="CSIGHT"
                            width={60}
                            height={60}
                            className="circle-image"
                          />
                        </div>
                        <div className="text-center mt-2 font-bold">
                          {item.keyword?.length > 11
                            ? item.keyword?.slice(0, 8) + ".."
                            : item.keyword}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Right Side Potential Savings */}
          <div className="w-full md:w-3 relative percenatge-saved-card ">
            <div className="percenatge-saved-right-card flex-shrink-0 w-full md:w-3 equal-card-size">
              <PotentalSavings
                title="Potential Savings"
                result={savingsData?.result}
                loading={loading}
              />
            </div>
          </div>
        </div>
      </Card>

      <div className="flex flex-column gap-4 md:flex-row">
        <div
          className="card-bg w-full text-center text-2xl font-bold md:w-6"
          style={{ height: "330px" }}
        >
          <AlertsTableUI />
        </div>

        <div
          className="card-bg w-full text-center text-2xl md:h-4 font-bold md:w-6"
          style={{ height: "330px" }}
        >
          <RecommendationsTable />
        </div>
      </div>

      <div className="flex flex-column gap-4 md:flex-row">
        <div
          className="card-bg w-full text-center text-2xl font-bold md:w-6"
          style={{ height: "330px" }}
        >
          <ResourcesTable />
        </div>
        <Card className="card-bg w-full md:w-6">
          <div className="text-center text-2xl font-bold pt-2">
            Knowledge Corner
          </div>
          <ul>
            <li
              style={{ color: "#4472c4" }}
              className="text-xl font-bold cursor-pointer"
              onClick={() =>
                openDocument(
                  "https://www.teksecur.com/blog/understanding-focus-datasets-in-finops-a-foundation-for-cloud-financial-excellence"
                )
              }
            >
              Focus - Data Model
            </li>
            <li
              style={{ color: "#4472c4" }}
              className="text-xl font-bold cursor-pointer"
              onClick={() =>
                openDocument(
                  "https://www.teksecur.com/blog/unit-economics-in-finops-measuring-cloud-value"
                )
              }
            >
              Unit Economics
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default CsightDashboard;
