/* eslint-disable */
// @ts-nocheck
// import axiosInstance from "../../CsightCommon/config/axiosInstance";
import React from "react";
import { HTTP, DWORKS_HTTP, RAG_HTTP } from "../../CsightCommon/config/http-common";
import { useAuth } from "../../CsightCommon/context/AuthContext";
import { useToast } from "../../CsightCommon/context/ToastContext";
import React, {
  createContext,
  ReactNode,
  useContext,
  useRef,
  useState,
} from "react";
import Cookie from "js-cookie";
import React from "react";

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
  getTaskID: (question: string, question_id: string, filterData: any) => Promise<void>;
  getSpinalAnswer: (question: string, question_id: string, filterData: any, pageName: string, slugName: string) => Promise<void>;
  getGraphTaskID: (
    question: string,
    question_id: string,
    chart_type: string,
    filterData: any
  ) => Promise<void>;
  messageContainerRef: React.MutableRefObject<any>;
  selectedGraph: SelectedGraph;
  setSelectedGraph: React.Dispatch<React.SetStateAction<SelectedGraph>>;
  flashCardData: FlashCardData[];
  setFlashCardData: React.Dispatch<React.SetStateAction<FlashCardData[]>>;
  selectedDropDownGraph: any;
  setselectedDropDownGraph: React.Dispatch<any>;
  getQuestionList: (body: any) => Promise<void>;
  currentQuestionList: any[];
  setCurrentQuestionList: React.Dispatch<React.SetStateAction<any[]>>;
}

const AibotContext = createContext<AIBotContextType>({
  opneChatModal: false,
  setOpenChatModal: () => false,
  isResize: false,
  setIsResize: () => { },
  question: "",
  setQuestion: () => "",
  isLoading: false,
  setIsLoading: () => false,
  prompts: [],
  setPrompts: () => [],
  getTaskID: async () => { },
  getSpinalAnswer: async () => { },
  getGraphTaskID: async () => { },
  getTextAnswer: async () => { },
  messageContainerRef: null,
  selectedGraph: { isSelected: false, type: null, graph_type: null },
  setSelectedGraph: () => { },
  flashCardData: [],
  setFlashCardData: () => { },
  selectedDropDownGraph: null,
  setselectedDropDownGraph: () => null,
  getQuestionList: async () => { },
  currentQuestionList: [],
  setCurrentQuestionList: () => { },
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

  const [currentQuestionList, setCurrentQuestionList] = useState([]);

  const parseSuggestedQuestions = (jsonString: string) => {
    try {
      const pattern = /^```json\s*([\s\S]*?)\s*```$/;
      const cleanedString = jsonString.replace(pattern, "$1")?.trim();
      return JSON.parse(cleanedString);
    } catch (error) {
      return null;
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

  interface ParsedResponseData {
    answer: string;
    suggestedQuestions: any[];
  }

  const parseResponseData = (data: { answer: string; question: string; suggested_questions: string }): ParsedResponseData => {
    try {
      // Check if the answer contains JSON with a chart keyword
      const chartJsonMatch = data.answer.match(/```json\s*([\s\S]*?)\s*```/);
      if (chartJsonMatch && chartJsonMatch[1] && chartJsonMatch[1].includes('"chart"')) {
        // If JSON contains chart data, return the answer as is without extracting
        let suggestedQuestions: any[] = [];

        if (data?.suggested_questions && data?.suggested_questions?.length > 0) {
            try {
              // Check if suggested_questions is already a JSON string with ```json markers
              if (data?.suggested_questions?.includes('```json')) {
                const suggestedJsonMatch = data?.suggested_questions?.match(/```json\s*([\s\S]*?)\s*```/);
                if (suggestedJsonMatch && suggestedJsonMatch?.[1]) {
                  const jsonContent = suggestedJsonMatch?.[1]?.trim();
                  suggestedQuestions = JSON.parse(jsonContent);
                }
              } else {
                // Try to parse it directly as JSON
                suggestedQuestions = JSON.parse(data?.suggested_questions || "[]");
              }
            } catch (suggestedError) {
              console.error("Error parsing suggested_questions:", suggestedError);
            }
          }


        return {
          answer: data.answer,
          suggestedQuestions: suggestedQuestions
        };
      }
      
      // If no chart data, proceed with normal parsing
      // Split the answer by the JSON block markers
      const parts = data.answer.split(/```json|```/);
      
      // Combine text parts (before and after JSON) and clean them
      const textParts = parts.filter((part, index) => index % 2 === 0)
        .map(part => part.trim())
        .filter(part => part.length > 0);
      
      // Join text parts with proper spacing
      const textAnswer = textParts.join('\n\n');

      // Extract JSON content
      let suggestedQuestions: any[] = [];
      const jsonMatch = data.answer.match(/```json\s*([\s\S]*?)\s*```/);
      
      if (jsonMatch && jsonMatch[1]) {
        const jsonContent = jsonMatch[1].trim();
        suggestedQuestions = JSON.parse(jsonContent);
      }

      // console.log("suggestedQuestions===", suggestedQuestions);

      // If suggestedQuestions is empty, check if suggested_questions exists and parse it
      if ((data?.suggested_questions && data?.suggested_questions?.length > 0) || (suggestedQuestions?.length === 0 && data?.suggested_questions)) {
        try {
          // Check if suggested_questions is already a JSON string with ```json markers
          if (data?.suggested_questions?.includes('```json')) {
            const suggestedJsonMatch = data?.suggested_questions?.match(/```json\s*([\s\S]*?)\s*```/);
            if (suggestedJsonMatch && suggestedJsonMatch?.[1]) {
              const jsonContent = suggestedJsonMatch?.[1]?.trim();
              suggestedQuestions = JSON.parse(jsonContent);
            }
          } else {
            // Try to parse it directly as JSON
            suggestedQuestions = JSON.parse(data?.suggested_questions || "[]");
          }
        } catch (suggestedError) {
          console.error("Error parsing suggested_questions:", suggestedError);
        }
      }

      return {
        answer: textAnswer,
        suggestedQuestions
      };
    } catch (error) {
      console.error("Error parsing response data:", error);
      return {
        answer: data.answer,
        suggestedQuestions: []
      };
    }
  };

  const parseGraphData = (jsonString: string) => {
    try {
      // Extract all JSON blocks from the response
      const pattern = /```json\s*([\s\S]*?)\s*```/g;
      const matches = [...jsonString.matchAll(pattern)];
      
      // If no matches found, return invalid result
      if (!matches || matches.length === 0) {
        return {
          isValid: false,
          data: null,
        };
      }
      
      // Look for a JSON block that contains chart data
      for (const match of matches) {
        if (match && match[1]) {
          const cleanedString = match[1].trim();
          
          // Check if this block contains placeholder values like "value1, value2"
          const containsPlaceholders = /\[.*value\d.*\]/i.test(cleanedString);
          
          if (containsPlaceholders) {
            // Extract title, labels, and create dummy values
            try {
              // Use regex to extract the title
              const titleMatch = /"title"\s*:\s*"([^"]+)"/.exec(cleanedString);
              const title = titleMatch ? titleMatch[1] : "Chart";
              
              // Extract labels array using regex
              const labelsMatch = /"labels"\s*:\s*\[(.*?)\]/.exec(cleanedString);
              const labelsString = labelsMatch ? labelsMatch[1] : "";
              const labels = labelsString.split(',')
                .map(label => label.trim().replace(/"/g, ''))
                .filter(label => label.length > 0);
              
              // Create dummy values (all 10)
              const values = Array(labels.length).fill(10);
              
              return {
                isValid: true,
                data: {
                  title: title,
                  labels: labels,
                  values: values,
                },
              };
            } catch (placeholderError) {
              console.log("Error parsing placeholder values:", placeholderError);
              continue;
            }
          }
          
          // Regular JSON parsing for non-placeholder data
          try {
            // Remove trailing commas before JSON parsing
            const removeTrailingCommas = cleanedString.replace(/,(\s*[}\]])/g, '$1');
            const removeCommentFromCleanedJson = removeCommentsFromJSON(removeTrailingCommas);
            const parsedString = JSON.parse(removeCommentFromCleanedJson);
            
            // Check if this JSON block contains chart data
            if (parsedString.chart) {
              // Extract data from the chart object
              const chartData = parsedString.chart;
              
              // Check if values is an array of objects with label and data properties
              const isComplexValuesFormat = Array.isArray(chartData?.values) && 
                chartData?.values?.length > 0 && 
                typeof chartData?.values?.[0] === 'object' &&
                chartData?.values?.[0]?.label &&
                Array.isArray(chartData?.values?.[0]?.data);

              // Transform complex format while maintaining backward compatibility
              const formattedValues = isComplexValuesFormat 
                ? chartData?.values?.map((item: any) => ({
                    label: item?.label,
                    data: item?.data
                  }))
                : chartData?.values || [];

              return {
                isValid: true,
                data: {
                  title: chartData?.title || "",
                  labels: chartData?.labels || [],
                  values: formattedValues,
                },
              };
            } else if (parsedString.title && (parsedString.labels || parsedString.values)) {
              // Direct chart format without the "chart" wrapper
              // Check if values is an array of objects with label and data properties
              const isComplexValuesFormat = Array.isArray(parsedString?.values) && 
                parsedString?.values?.length > 0 && 
                typeof parsedString?.values?.[0] === 'object' &&
                parsedString?.values?.[0]?.label &&
                Array.isArray(parsedString?.values?.[0]?.data);

              // Transform complex format while maintaining backward compatibility
              const formattedValues = isComplexValuesFormat 
                ? parsedString?.values?.map((item: any) => ({
                    label: item?.label,
                    data: item?.data
                  }))
                : parsedString?.values || [];

              return {
                isValid: true,
                data: {
                  title: parsedString?.title || "",
                  labels: parsedString?.labels || [],
                  values: formattedValues,
                },
              };
            }
            // If this JSON block doesn't contain chart data, continue to the next one
          } catch (innerError) {
            // If parsing this specific JSON block fails, try the next one
            console.log("Error parsing individual JSON block:", innerError);
            continue;
          }
        }
      }
      
      // If we've checked all JSON blocks and none contain chart data
      return {
        isValid: false,
        data: null,
      };
    } catch (error) {
      console.log("parseGraphData error:", error);
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
        setPrompts((prompts: any) =>
          prompts?.map((p: any) => {
            if (p.task_id === task_id) {
              // console.log("301 p===", p);
              if (p?.isStandardQuestion) {
                const { answer, suggestedQuestions } = parseResponseData(data?.result);
                // console.log("answer===", answer);
                // console.log("suggestedQuestions===", suggestedQuestions);
                const graphData = isGraphType
                  ? parseGraphData(data?.result?.answer)
                  : null;
                // console.log("graphData===", graphData);
                const questionsList = suggestedQuestions && suggestedQuestions.length>0 ? 
                (suggestedQuestions?.['on-screen_questions'] || suggestedQuestions || currentQuestionList || []) 
                : parseSuggestedQuestions(
                  data?.result?.suggested_questions
                ) || currentQuestionList || [];

                return {
                  ...p,
                  answer: isGraphType
                    ? extractTextBeforeJson(answer)
                    : answer,
                  suggested_questions: questionsList,
                  isLoading: false,
                  graphData: graphData?.isValid ? graphData?.data : null,
                  answerTime: new Date(),
                };
              } else {
                const graphData = isGraphType
                  ? parseGraphData(data?.result?.answer)
                  : null;
                // console.log("graphData===", graphData);
                return {
                  ...p,
                  answer: isGraphType
                    ? extractTextBeforeJson(data?.result?.answer)
                    : data?.result?.answer,
                  suggested_questions: p?.spinalQuestions ? currentQuestionList : parseSuggestedQuestions(
                    data?.result?.suggested_questions
                  ) || currentQuestionList || [],
                  isLoading: false,
                  graphData: graphData?.isValid ? graphData?.data : null,
                  answerTime: new Date(),
                };
              }
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
      setPrompts((prevPrompt) => {
        return prevPrompt?.map((prompt) => {
          if (prompt?.task_id === task_id) {
            return { ...prompt, isLoading: false };
          }
          return prompt;
        });
      });
    }
  };

  const ragQuerySpinalCord = async (data: any, question: string, question_id: string) => {
    try {
      // console.log("ragQuerySpinalCord data===", data);
      const taskPayload = {
        org_id: process.env.REACT_APP_CINDY_ORG_ID,
        project_id: process.env.REACT_APP_CINDY_PROJECT_ID,
        question: question,
        doc_type: process.env.REACT_APP_CINDY_DOC_TYPE,
        app_type: process.env.REACT_APP_CINDY_APP_TYPE,
        spinal_cord_data: JSON.stringify(data),
        // email_id: process.env.REACT_APP_CINDY_EMAIL_ID_TOKEN,
        // AUTH_TOKEN: process.env.REACT_APP_CINDY_AUTH_TOKEN,
      };
      const { data: dataSpinalCord } = await HTTP.post("/ragqexpress/", taskPayload, { headers: { Authorization: accessToken } });
      // console.log("ragQuerySpinalCord data===", dataSpinalCord);
      if (dataSpinalCord && dataSpinalCord?.task_id) {
        setPrompts((prevPrompt) => {
          return prevPrompt?.map((prompt) => {
            if (prompt?.id === question_id) {
              return { ...prompt, task_id: dataSpinalCord?.task_id };
            }
            return prompt;
          });
        });
        getTextAnswer(dataSpinalCord?.task_id);
      } else {
        setPrompts((prevPrompt) => {
          return prevPrompt?.map((prompt) => {
            if (prompt?.id === question_id) {
              return { ...prompt, isLoading: false,suggested_questions: currentQuestionList || [] };
            }
            return prompt;
          });
        });
        setIsLoading(false);
        showToast("Something went wrong.", "error", "Something went wrong.");
      }
    } catch (error) {
      setIsLoading(false);
      showToast("Something went wrong.", "error", "Something went wrong.");
      setPrompts((prevPrompt) => {
        return prevPrompt?.map((prompt) => {
          if (prompt?.id === question_id) {
            return { ...prompt, isLoading: false,suggested_questions: currentQuestionList || [] };
          }
          return prompt;
        });
      });
    }
  }

  const getSpinalAnswer = async (question: string, question_id: string, filterData: any, pageName: string, slugName: string) => {
    try {
      setIsLoading(true);
      const taskPayload = {
        question: question,
        ...filterData,
        page_name: pageName,
        slug_name: slugName
      };
      let { data } = await DWORKS_HTTP.post("/cisght/ask_q", taskPayload);
      // console.log("getSpinalAnswer data===", data);
      data = data && data.length > 0 ? data : [];
      ragQuerySpinalCord(data, question, question_id);
    } catch (error) {
      setIsLoading(false);
      showToast("Something went wrong.", "error", "Something went wrong.");
      setPrompts((prevPrompt) => {
        return prevPrompt?.map((prompt) => {
          if (prompt?.id === question_id) {
            return { ...prompt, isLoading: false,suggested_questions: currentQuestionList };
          }
          return prompt;
        });
      });
    }
  }

  const getTaskID = async (question: string, question_id: string, filterData: any) => {
    try {
      setIsLoading(true);
      const taskPayload = {
        org_id: process.env.REACT_APP_CINDY_ORG_ID,
        project_id: process.env.REACT_APP_CINDY_PROJECT_ID,
        question: question,
        doc_type: process.env.REACT_APP_CINDY_DOC_TYPE,
        app_type: process.env.REACT_APP_CINDY_APP_TYPE,
        slug_name: Cookie.get("slug"),
        ...filterData
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

  const getQuestionList = async (body: any) => {
    try {
      const { data } = await DWORKS_HTTP.post("/csight/quesiton_list", body);
      return data;
    } catch (error) {
      console.log("getQuestionList error", error);
      return [];
    }
  }

  const getGraphTaskID = async (
    question: string,
    question_id: string,
    chart_type: string,
    filterData?: any
  ) => {
    try {
      setIsLoading(true);
      const taskPayload = {
        question: question,
        chart_type,
        org_id: process.env.REACT_APP_CINDY_ORG_ID,
        project_id: process.env.REACT_APP_CINDY_PROJECT_ID,
        doc_type: process.env.REACT_APP_CINDY_DOC_TYPE,
        app_type: process.env.REACT_APP_CINDY_APP_TYPE,
        slug_name: Cookie.get("slug"),
        ...filterData
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
    getQuestionList,
    getSpinalAnswer,
    currentQuestionList, 
    setCurrentQuestionList
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
