/* eslint-disable */
import React from "react";
import "../../../styles/UI/stepper.scss";
import { CheckCircleFilled, CheckCircleOutlined } from "@ant-design/icons";

interface Step {
  label: string;
  view: string;
}

interface StepperProps {
  steps: Step[];
  checkEditView: (view: string) => boolean;
  checkStepIsDone: (view: string) => boolean;
  handleView: (view: string) => void;
}

const Stepper: React.FC<StepperProps> = ({
  steps,
  checkEditView,
  checkStepIsDone,
  handleView,
}) => {
  const handleStepView = (view: string) => {
    handleView(view);
  };

  return (
    <div className="stepper-horizontal">
      {steps.map((step, index) => (
        <div
          key={step.view}
          className={`step 
            ${checkStepIsDone(step.view) ? "done" : ""} 
            ${checkEditView(step.view) ? "editing" : ""}`}
        >

          <div
            className="step-title flex gap-2"
            onClick={() => handleStepView(step.view)}
          >{
            checkStepIsDone(step.view) ? <CheckCircleFilled className="icon-color text-3xl"/> : <CheckCircleOutlined className="icon-color text-3xl"/>
          }
            {step.label}
          </div>
          <div className="step-bar-left"></div>
          {index !== steps.length - 1 && <div className="step-bar-right"></div>}
        </div>
      ))}
    </div>
  );
};

export default Stepper;
