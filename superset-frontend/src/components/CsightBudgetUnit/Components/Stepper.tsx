/* eslint-disable */
import React from "react";
import "../../../styles/UI/stepper.scss";

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
    <div className="stepper-horizontal" id="stepper1">
      {steps.map((step) => (
        <div
          key={step.view}
          className={`step ${checkStepIsDone(step.view) ? "done" : ""} ${
            checkEditView(step.view) ? "editing" : ""
          }`}
        >
          <div className="step-circle"></div>
          <div className="step-title" onClick={() => handleStepView(step.view)}>
            {step.label}
          </div>
          <div className="step-bar-left"></div>
          <div className="step-bar-right"></div>
        </div>
      ))}
    </div>
  );
};

export default Stepper;
