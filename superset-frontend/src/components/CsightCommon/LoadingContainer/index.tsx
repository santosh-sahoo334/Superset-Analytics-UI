/* eslint-disable */
import React from "react";

const LoadingContainer: React.FunctionComponent = () => (
  <div className="w-full">
    <div
      className="h-screen w-full flex align-items-center justify-content-center top-0 left-0 absolute text-center bg-color"
      style={{ zIndex: 99999999999999 }}
    >
      <i
        className="pi pi-spin pi-spinner"
        style={{ fontSize: "4rem", color: "#4472c4" }}
      ></i>
    </div>
  </div>
);

export default LoadingContainer;
