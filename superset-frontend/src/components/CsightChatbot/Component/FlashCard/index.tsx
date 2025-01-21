/* eslint-disable */
// @ts-nocheck
import React, { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { useAIBotContext } from "../../Context";
import { useToast } from "../../../CsightCommon/context/ToastContext";
import axiosInstance from "../../../CsightCommon/config/axiosInstance";

const FalshCard = ({clickedNavItem}:any) => {
  const { showToast } = useToast();
  const { flashCardData, setFlashCardData }:any = useAIBotContext();

  const questionsList:any = {
    "Cost": "Ask Cindy about your cloud spend analysis and cost optimization opportunities. I can help identify spending patterns and potential savings.",
    "Dashboard": "Want to understand your dashboard metrics better? Ask me to explain the trends and insights from your cloud performance data.",
    "Utilization": "Ask Cindy about your resource utilization patterns and optimization opportunities. I can help analyze usage trends and identify underutilized resources.",
    "Billing": "Ask Cindy about your billing details and invoice analysis. I can help explain charges, track spending patterns, and identify unusual costs.",
    "Tags": "Ask Cindy about your tag compliance and cost allocation insights. I can help identify missing tags and improve resource tracking.",
    "Observability": "Ask Cindy about your cloud resource metrics and monitoring insights. I can help analyze performance patterns and usage trends.",
    "Anomaly": "Ask Cindy to identify unusual spending patterns and cost spikes in your cloud resources. I can help analyze trends and potential cost impacts.",
    "Recommendations": "Wondering how to optimize your cloud costs? I'm here to help with personalized recommendations - just ask!",
    "Governance": "Need insights on your governance metrics? I can help you understand the month-over-month changes and key trends.",
    "Bud vs Act": "Let me help you monitor your cloud spending against budgets. Ask about current trends and forecasts!",
    "Budget Unit": "Let me help you monitor your cloud spending against budgets. Ask about current trends and forecasts!",
    "GreenOps": "Ask Cindy about your sustainability metrics and carbon footprint. I can help analyze environmental impact and suggest eco-friendly optimizations.",
    "OnPrem": "Ask Cindy about your on-premises infrastructure analysis and metrics. I can help track datacenter utilization, costs, and efficiency.",
  }

  const getTextAnswer = async (
    task_id: string,
    isGraphType: boolean = false
  ) => {
    try {
      const taskStatusPayload = {
        task_id: task_id,
        email_id: process.env.REACT_APP_CINDY_EMAIL_ID_TOKEN,
        AUTH_TOKEN: process.env.REACT_APP_CINDY_AUTH_TOKEN,
      };
      const { data } = await axiosInstance.post(
        "/task_status",
        taskStatusPayload
      );

      if (data && data?.status === "Pending") {
        setTimeout(() => {
          getTextAnswer(task_id, isGraphType);
        }, 2000);
        return;
      }

      if (data && data?.result?.answer) {
        setFlashCardData((fd:any) => {
          return fd.map((item:any) => {
            if (item?.task_id === task_id) {
              return {
                ...item,
                isLoading: false,
                answer: data?.result?.answer,
              };
            }
            return item;
          });
        });
      }
    } catch (error) {
      showToast(
        "Unable to load Flash card Data.",
        "error",
        "Something went wrong."
      );
    }
  };

  const getTaskID = async (question: string, question_id: string) => {
    try {
      const taskPayload = {
        question: question,
        query_type: "flash_card",
        org_id: process.env.REACT_APP_CINDY_ORG_ID,
        project_id: process.env.REACT_APP_CINDY_PROJECT_ID,
        doc_type: process.env.REACT_APP_CINDY_DOC_TYPE,
        app_type: process.env.REACT_APP_CINDY_APP_TYPE,
        email_id: process.env.REACT_APP_CINDY_EMAIL_ID_TOKEN,
        AUTH_TOKEN: process.env.REACT_APP_CINDY_AUTH_TOKEN,
      };
      const { data } = await axiosInstance.post("/ragq", taskPayload);
      if (data && data?.task_id) {
        setFlashCardData((fd:any) => {
          return fd.map((item:any) => {
            if (item?.id === question_id) {
              return {
                ...item,
                task_id: data?.task_id,
                isLoading: true,
              };
            }
            return item;
          });
        });
        getTextAnswer(data?.task_id, true);
        return;
      }
    } catch (error) {
      showToast(
        "Unable to load Flash card Data.",
        "error",
        "Something went wrong."
      );
    }
  };

  useEffect(() => {
    if (flashCardData?.length <= 0 && clickedNavItem && questionsList[clickedNavItem]) {
      // const q1 =
      //   "Which specific AWS services contributed most significantly to the cost increase from February to March 2024?";
      const id = uuidv4();
      setFlashCardData([
        { answer: null, id: id, isLoading: true, question: questionsList[clickedNavItem], task_id: null },
      ]);
      getTaskID(questionsList[clickedNavItem], id);
    }
  }, []);

  return (
    <>
      {flashCardData?.map((fd:any) => {
        return (
          <div
            style={{
              padding: "18px 12px",
              backgroundColor: "#F2F4F7",
              borderRadius: "8px",
              color: "#000",
            }}
            className="w-full ny-4"
          >
            {fd?.isLoading && (
              <i
                className="pi pi-spin pi-spinner"
                style={{ fontSize: "2rem", color: "#4472c4" }}
              ></i>
            )}
            {!fd?.isLoading && (
              <>
                <div
                  style={{ whiteSpace: "pre-line" }}
                  dangerouslySetInnerHTML={{
                    __html: (fd?.answer).replaceAll(
                      /\*\*(.*?)\*\*/g,
                      "<b>$1</b>"
                    ),
                  }}
                />
              </>
            )}
          </div>
        );
      })}
    </>
  );
};

export default FalshCard;
