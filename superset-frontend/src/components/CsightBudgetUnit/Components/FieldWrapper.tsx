/* eslint-disable */
// @ts-nocheck
import React, { useState, useCallback, ReactNode, useEffect } from "react";
import { Accordion, AccordionTab } from "primereact/accordion";
// import TagsDisplay from '@/components/Taggable/TagsDisplay'; // Adjust the path as necessary.
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";

import "../../../styles/UI/field.scss";

interface CustomAccordionProps {
  label?: string;
  helperText?: string;
  valueType?: "input" | "chips";
  charCount?: number;
  isShowdiffer?: boolean;
  isEditMode?: boolean;
  children?: ReactNode;
  expandAll?: Boolean;
  key?: number;
  value?: any;
}

const FieldWrapper: React.FC<CustomAccordionProps> = ({
  label = "",
  helperText = "",
  valueType = "input",
  charCount = 45,
  isShowdiffer = false,
  isEditMode,
  children,
  expandAll,
  key,
  value,
}) => {
  const [isExpanded, setIsExpanded] = useState(expandAll ? true : false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const handleTabOpen = useCallback(() => {
    setIsExpanded(true);
    setExpandedIndex(0);
  }, []);

  const handleTabClose = useCallback(() => {
    setIsExpanded(false);
    setExpandedIndex(1);
  }, []);

  useEffect(() => {
    setExpandedIndex(expandAll ? 0 : null);
  }, [expandAll]);

  return (
    <Accordion
      activeIndex={expandedIndex}
      className="custom-accordion mb-1"
      onTabOpen={handleTabOpen}
      onTabClose={handleTabClose}
      onTabChange={(e) => setExpandedIndex(e.index as number)}
      // key={Math.random()}
    >
      <AccordionTab
        headerTemplate={
          <div className="grid w-full align-items-center">
            <div className="col-3 form-label text-right dark-black align-items-center">
              {label.length > charCount
                ? `${label.slice(0, charCount)}...`
                : label}
              {label.length > charCount && (
                <span className="ml-1" title={label}>
                  ...
                </span>
              )}
            </div>

            {expandedIndex === null && isEditMode ? (
              <div
                className={`col-9 text-lg dark-gray ${
                  isShowdiffer ? "highlight-color" : ""
                }`}
              >
                {valueType === "chips" ? (
                  //   <TagsDisplay isShowHover={true} tags={[]} /> {/* Placeholder tags */}
                  <div></div>
                ) : helperText.length > charCount ? (
                  `${helperText.slice(0, charCount)}...`
                ) : (
                  value
                )}
              </div>
            ) : (
              <div
                className={`col-9 text-lg dark-gray ${
                  isShowdiffer ? "highlight-color" : ""
                }`}
              >
                {helperText}
              </div>
            )}
          </div>
        }
      >
        {/* Render children inside AccordionTab */}
        {children}
      </AccordionTab>
    </Accordion>
  );
};

export default FieldWrapper;
