/* eslint-disable */
import React, { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { useAIBotContext } from "../../Context";
import { useToast } from "../../../CsightCommon/context/ToastContext";
import axiosInstance from "../../../CsightCommon/config/axiosInstance";

const FalshCard = () => {
  const { showToast } = useToast();
  const { flashCardData, setFlashCardData } = useAIBotContext();

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
        setFlashCardData((fd) => {
          return fd.map((item) => {
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
        setFlashCardData((fd) => {
          return fd.map((item) => {
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
    if (flashCardData?.length <= 0) {
      const q1 =
        "Which specific AWS services contributed most significantly to the cost increase from February to March 2024?";
      const id = uuidv4();
      setFlashCardData([
        { answer: null, id: id, isLoading: true, question: q1, task_id: null },
      ]);
      getTaskID(q1, id);
    }
  }, []);

  return (
    <>
      {flashCardData?.map((fd) => {
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
