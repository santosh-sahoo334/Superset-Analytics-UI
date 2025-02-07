/* eslint-disable */
// @ts-nocheck
// import axiosInstance from "../../CsightCommon/config/axiosInstance";
import { HTTP } from "../../CsightCommon/config/http-common";
import { useAuth } from "../../CsightCommon/context/AuthContext";
import { useToast } from "../../CsightCommon/context/ToastContext";
import React, {
  createContext,
  ReactNode,
  useContext,
  useRef,
  useState,
} from "react";

export const GRAPH_COLORS = [
  "#005AAB",
  "#FFB81A",
  "#EB2A2E",
  "#45BA84",
  "#F36E24",
  "#1E252B",
  "#828C93",
  "#DAE2E5",
];
export const dateFormatOption = {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "numeric",
  minute: "numeric",
  hour12: true,
};

export interface GraphData {
  title: string;
  labels: string[];
  values: string[];
}

export interface PromptAndRespponse {
  id: string;
  question: string;
  answer: string | null;
  task_id: string | null;
  suggested_questions: string[];
  isLoading: boolean;
  isGraphType?: boolean;
  graphType?: string;
  graphData?: GraphData;
  questionTime: Date | null;
  answerTime: Date | null;
  notShow: boolean;
}

interface SelectedGraph {
  isSelected: boolean;
  type: string | null;
  graph_type: string | null;
}

interface FlashCardData {
  id: string;
  task_id: string | null;
  question: string;
  answer: string | null;
  isLoading: boolean;
}

interface AIBotContextType {
  opneChatModal: boolean;
  setOpenChatModal: React.Dispatch<React.SetStateAction<boolean>>;
  isResize: boolean;
  setIsResize: React.Dispatch<React.SetStateAction<boolean>>;
  question: string;
  setQuestion: React.Dispatch<React.SetStateAction<string>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  prompts: PromptAndRespponse[];
  setPrompts: React.Dispatch<React.SetStateAction<PromptAndRespponse[]>>;
  getTextAnswer: (task_id: string) => Promise<void>;
  getTaskID: (question: string, question_id: string) => Promise<void>;
  getGraphTaskID: (
    question: string,
    question_id: string,
    chart_type: string
  ) => Promise<void>;
  messageContainerRef: React.MutableRefObject<any>;
  selectedGraph: SelectedGraph;
  setSelectedGraph: React.Dispatch<React.SetStateAction<SelectedGraph>>;
  flashCardData: FlashCardData[];
  setFlashCardData: React.Dispatch<React.SetStateAction<FlashCardData[]>>;
  selectedDropDownGraph: any;
  setselectedDropDownGraph: React.Dispatch<any>;
}

const AibotContext = createContext<AIBotContextType>({
  opneChatModal: false,
  setOpenChatModal: () => false,
  isResize: false,
  setIsResize: () => {},
  question: "",
  setQuestion: () => "",
  isLoading: false,
  setIsLoading: () => false,
  prompts: [],
  setPrompts: () => [],
  getTaskID: async () => {},
  getGraphTaskID: async () => {},
  getTextAnswer: async () => {},
  messageContainerRef: null,
  selectedGraph: { isSelected: false, type: null, graph_type: null },
  setSelectedGraph: () => {},
  flashCardData: [],
  setFlashCardData: () => {},
  selectedDropDownGraph: null,
  setselectedDropDownGraph: () => null,
});

interface AIBotProviderProps {
  children: ReactNode;
}

const AIbotState = () => {
  const [opneChatModal, setOpenChatModal] = useState<boolean>(false);
  const [isResize, setIsResize] = useState<boolean>(false);
  const messageContainerRef = useRef<any>(null);
  const { showToast } = useToast();
  const { accessToken } = useAuth();
  const [question, setQuestion] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedGraph, setSelectedGraph] = useState<SelectedGraph>({
    isSelected: false,
    type: null,
    graph_type: null,
  });
  const [selectedDropDownGraph, setselectedDropDownGraph] = useState<any>(null);
  const [flashCardData, setFlashCardData] = useState<FlashCardData[]>([]);

  const [prompts, setPrompts] = useState<PromptAndRespponse[]>([
    // {
    //     question: "What are Total Cost incurred by AWs EC2 Instances on monthly basis for   Jan, Feb and Mar 2024?",
    //     answer: "Based on the documents provided, here are the total costs incurred by AWS EC2 instances on a monthly basis for January, February, and March 2024:\n\n- **January 2024**: $45,200\n- **February 2024**: $42,800\n- **March 2024**: $48,600",
    //     task_id: "1",
    //     suggested_questions:
    //         [
    //             '1. What is the difference in AWS costs between February 2024 and March 2024?',
    //             '2. Which specific AWS services contributed most significantly to the cost increase from February to March 2024?',
    //             '3. How did the use of reserved instances impact AWS costs in February 2024 compared to January 2024?',
    //             '4. What are some key cost optimization opportunities identified for January 2024?',
    //             '5. How does the FOCUS schema help in allocating shared costs among different business units?'
    //         ],
    //     isLoading: false,
    //     id: "1",
    //     answerTime: new Date(),
    //     questionTime: new Date(),
    // },
  ]);

 const parseSuggestedQuestions = (jsonString: string) => {
    try {
      const pattern = /^```json\s*([\s\S]*?)\s*```$/;
      const cleanedString = jsonString.replace(pattern, "$1")?.trim();
      return JSON.parse(cleanedString);
    } catch (error) {
      return [];
    }
  };

  const extractTextBeforeJson = (input: string) => {
    // Find the index where the JSON starts

    const jsonStartIndex = input.indexOf("```json");

    if (jsonStartIndex === -1) return input;
    // Extract the text before the JSON
    const contextText = input.substring(0, jsonStartIndex).trim();
    return contextText;
  };

  const removeCommentsFromJSON = (jsonString: string) => {
    // Remove single-line comments (//)
    jsonString = jsonString.replaceAll(/\/\/.*(?=[\n\r])/g, "");
    // Remove multi-line comments (/* ... */)
    jsonString = jsonString.replaceAll(/\/\*[\s\S]*?\*\//g, "");
    return jsonString;
  };

  const parseGraphData = (jsonString: string) => {
    try {
      const pattern = /```json\s*([\s\S]*?)\s*```/;
      const match = jsonString.match(pattern);

      // If a match is found, return the clean JSON content
      if (match && match[1]) {
        const cleanedString = match[1].trim();
        // Remove trailing commas before JSON parsing
        const removeTrailingCommas = cleanedString.replace(/,(\s*[}\]])/g, '$1');
        const removeCommentFromCleanedJson = 
          removeCommentsFromJSON(removeTrailingCommas);
        const parsedString = JSON.parse(removeCommentFromCleanedJson);

        return {
          isValid: true,
          data: {
            title: parsedString?.title || "",
            labels: parsedString?.labels || [],
            values: parsedString?.values || [],
          },
        };
      } else {
        return {
          isValid: false,
          data: null,
        };
      }
    } catch (error) {
      console.log("parseError", error);
      return {
        isValid: false,
        data: null,
      };
    }
  };

  const getTextAnswer = async (
    task_id: string,
    isGraphType: boolean = false
  ) => {
    try {
      setIsLoading(true);
      const taskStatusPayload = {
        task_id: task_id
        // email_id: process.env.REACT_APP_CINDY_EMAIL_ID_TOKEN,
        // AUTH_TOKEN: process.env.REACT_APP_CINDY_AUTH_TOKEN,
      };
      const { data } = await HTTP.post("/ragq/task_status", taskStatusPayload, { headers: { Authorization: accessToken } });

      if (data && data?.status === "Pending") {
        setTimeout(() => {
          getTextAnswer(task_id, isGraphType);
        }, 2000);
        return;
      }

      if (data && data?.result?.answer) {
        setPrompts((prompts:any) =>
          prompts?.map((p:any) => {
            if (p.task_id === task_id) {
              const graphData = isGraphType
                ? parseGraphData(data?.result?.answer)
                : null;
              return {
                ...p,
                answer: isGraphType
                  ? extractTextBeforeJson(data?.result?.answer)
                  : data?.result?.answer,
                suggested_questions: parseSuggestedQuestions(
                  data?.result?.suggested_questions
                ),
                isLoading: false,
                graphData: graphData?.isValid ? graphData?.data : null,
                answerTime: new Date(),
              };
            }
            return p;
          })
        );
      }
      setQuestion("");
      setSelectedGraph({ graph_type: null, isSelected: false, type: null });
      setselectedDropDownGraph(null);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      showToast("Something went wrong.", "error", "Something went wrong.");
    }
  };

  const getTaskID = async (question: string, question_id: string) => {
    try {
      setIsLoading(true);
      const taskPayload = {
        org_id: process.env.REACT_APP_CINDY_ORG_ID,
        project_id: process.env.REACT_APP_CINDY_PROJECT_ID,
        question: question,
        doc_type: process.env.REACT_APP_CINDY_DOC_TYPE,
        app_type: process.env.REACT_APP_CINDY_APP_TYPE
        // email_id: process.env.REACT_APP_CINDY_EMAIL_ID_TOKEN,
        // AUTH_TOKEN: process.env.REACT_APP_CINDY_AUTH_TOKEN,
      };
      const { data } = await HTTP.post("/ragq/", taskPayload, { headers: { Authorization: accessToken } });
      if (data && data?.task_id) {
        setPrompts((prevPrompt) => {
          return prevPrompt?.map((prompt) => {
            if (prompt?.id === question_id) {
              return { ...prompt, task_id: data?.task_id };
            }
            return prompt;
          });
        });
        getTextAnswer(data?.task_id);
        if (messageContainerRef?.current) {
          setTimeout(() => {
            messageContainerRef?.current.scrollIntoView({ behavior: "smooth" });
          }, 50);
        }
        return;
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      showToast("Something went wrong.", "error", "Something went wrong.");
    }
  };

  const getGraphTaskID = async (
    question: string,
    question_id: string,
    chart_type: string
  ) => {
    try {
      setIsLoading(true);
      const taskPayload = {
        question: question,
        chart_type,
        org_id: process.env.REACT_APP_CINDY_ORG_ID,
        project_id: process.env.REACT_APP_CINDY_PROJECT_ID,
        doc_type: process.env.REACT_APP_CINDY_DOC_TYPE,
        app_type: process.env.REACT_APP_CINDY_APP_TYPE
        // email_id: process.env.REACT_APP_CINDY_EMAIL_ID_TOKEN,
        // AUTH_TOKEN: process.env.REACT_APP_CINDY_AUTH_TOKEN,
      };
      const { data } = await HTTP.post("/ragq4chart/", taskPayload, { headers: { Authorization: accessToken } });
      if (data && data?.task_id) {
        setPrompts((prevPrompt) => {
          return prevPrompt?.map((prompt) => {
            if (prompt?.id === question_id) {
              return { ...prompt, task_id: data?.task_id };
            }
            return prompt;
          });
        });
        getTextAnswer(data?.task_id, true);
        if (messageContainerRef?.current) {
          setTimeout(() => {
            messageContainerRef?.current.scrollIntoView({ behavior: "smooth" });
          }, 100);
        }
        return;
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      showToast("Something went wrong.", "error", "Something went wrong.");
    }
  };

  return {
    opneChatModal,
    setOpenChatModal,
    isResize,
    setIsResize,
    question,
    setQuestion,
    isLoading,
    setIsLoading,
    prompts,
    setPrompts,
    getTextAnswer,
    getTaskID,
    messageContainerRef,
    selectedGraph,
    setSelectedGraph,
    getGraphTaskID,
    flashCardData,
    setFlashCardData,
    selectedDropDownGraph,
    setselectedDropDownGraph,
  };
};

export function AIBotProvider({ children }: AIBotProviderProps): JSX.Element {
  const values = AIbotState();
  return (
    <>
      <AibotContext.Provider value={values}>{children}</AibotContext.Provider>
    </>
  );
}

export const useAIBotContext = () => useContext(AibotContext);
