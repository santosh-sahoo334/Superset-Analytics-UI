/* eslint-disable */
// @ts-nocheck
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { useEffect, useState } from "react";
import "../../../src/styles/layout/sidebar/_search_card.scss";
import { HTTP } from "./config/http-common";
import  { SearchOutlined } from '@ant-design/icons';


const SearchDashboard = ({ onClickItem = (route) => {} }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchMappings, setSearchMappings] = useState({});

  const getAllowedKeyWords = async () => {
    try {
      const response = await HTTP.get("/search/keywords/");
      const tempSearchMappings: Record<
        string,
        { label: string; route: string }
      > = {};
      const keywords = response?.data?.keywords as Record<string, string[]>;

      Object.entries(keywords).forEach(([label, keywords]) => {
        const route = `/${label.replace(" ", "").toLowerCase()}`; // Generate route dynamically
        keywords?.forEach((keyword) => {
          tempSearchMappings[
            keyword.charAt(0).toUpperCase() + keyword.slice(1)
          ] = {
            label: label.charAt(0).toUpperCase() + label.slice(1), // Capitalize label
            route,
          };
        });
      });

      setSearchMappings(tempSearchMappings);
    } catch (error) {
      console.log("response-keyword-error", error);
    }
  };

  useEffect(() => {
    getAllowedKeyWords();
  }, []);

  const filteredItems = Array.from(
    new Map(
      Object.keys(searchMappings)
        .filter((key) => key.toLowerCase().includes(searchTerm.toLowerCase()))
        .map((key) => [searchMappings[key].route, searchMappings[key]])
    ).values()
  );

  return (
    <div className="flex flex-column gap-3 pb-2 pt-3 relative input-w">
      {/* Search Bar */}
      <div className="relative">
        <div className="relative w-full max-w-lg">
          <SearchOutlined className="pi pi-search absolute input-search-icon transform -translate-y-1/2 text-gray-700"/>
          {/* <i className="pi pi-search absolute input-search-icon transform -translate-y-1/2 text-gray-700"></i> */}
          <InputText
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search csight"
            className={`pl-12 py-3 search-inputBox rounded-full shadow-none w-full text-gray-700 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
              searchTerm ? "search-active" : ""
            }`}
          />
        </div>
      </div>
      {searchTerm && (
        <Card className="search-result search-card-list">
          {filteredItems.length > 0 ? (
            <ul className="list-none p-3">
              {filteredItems.map((item, index) => (
                <li
                  key={index}
                  className="text-lg mb-2 cursor-pointer"
                  onClick={() => onClickItem(item,searchTerm)} // Navigate on click
                >
                  {item.label}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-lg p-2">No items found.</p>
          )}
        </Card>
      )}
    </div>
  );
};

export default SearchDashboard;
