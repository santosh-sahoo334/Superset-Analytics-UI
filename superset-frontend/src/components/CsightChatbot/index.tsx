/* eslint-disable */
// @ts-nocheck
import React, { useContext,useEffect, useState } from 'react';
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { v4 as uuidv4 } from "uuid";
import AiDialogHeader from "./Component/AiDialogHeader";
import AnswerContainer from "./Component/AnswerContainer";
import FalshCard from "./Component/FlashCard";
import QuestionContainer from "./Component/QuestionContainer";
import { useAIBotContext } from "./Context";
import { useToast } from "../CsightCommon/context/ToastContext";
import { Input } from 'antd'; // Import Input from Ant Design
const { TextArea } = Input; // Destructure TextArea from Input
import { OverlayPanel } from 'primereact/overlaypanel';
import { useRef } from 'react';
import { LayoutContext } from "../../layout/context/layoutcontext";
import { questionsList } from "./Component/FlashCard";


interface GRAPH_ITEMS {
  name: string;
  code: string;
  type: string;
}

const GRAPHS: GRAPH_ITEMS[] = [
  { name: "Bar Chart", code: "bar", type: "g1" },
  { name: "Donut Chart", code: "donut", type: "g2" },
  { name: "Pie", code: "pie", type: "g4" },
  { name: "Line", code: "line", type: "g5" },
];

const countryOptionTemplate = (option) => {
  return (
    <div className="flex align-items-center">
      {option?.type === "g1" && (
        <div className={"icon-container"} title="Bar Graph">
          <img src={"/static/assets/images/graph/g1.svg"} alt="" height={20} width={20} />
        </div>
      )}
      {option?.type === "g2" && (
        <div className={"icon-container"} title="Bar Graph">
          <img src={"/static/assets/images/graph/g2.svg"} alt="" height={20} width={20} />
        </div>
      )}
      {option?.type === "g4" && (
        <div className={"icon-container"} title="Bar Graph">
          <img src={"/static/assets/images/graph/g4.svg"} alt="" height={20} width={20} />
        </div>
      )}
      {option?.type === "g5" && (
        <div className={"icon-container"} title="Bar Graph">
          <img src={"/static/assets/images/graph/g5.svg"} alt="" height={20} width={20} />
        </div>
      )}
      <div>{option.name}</div>
    </div>
  );
};

const ChatBot = () => {
  const {
    opneChatModal,
    setOpenChatModal,
    isResize,
    getTaskID,
    question,
    setQuestion,
    prompts,
    isLoading,
    messageContainerRef,
    setPrompts,
    selectedGraph,
    setSelectedGraph,
    getGraphTaskID,
    selectedDropDownGraph,
    setselectedDropDownGraph,
    flashCardData
  } = useAIBotContext();

  const { clickedNavItem,previousNavItem,setPreviousNavItem } = useContext(LayoutContext);

  const { showToast } = useToast();

  const op = useRef<OverlayPanel>(null);

  const [containerHeight, setContainerHeight] = useState(120);
  // const [currentNavItem, setCurrentNavItem] = useState('Dashboard');

  // useEffect(() => {
  //   setCurrentNavItem(clickedNavItem);
  // }, []);

  const onClickChatIcon = () => {
    setOpenChatModal(!opneChatModal);
  };

  const onClickSend = () => {
    if (!question) {
      return showToast(
        "Please type valid question",
        "error",
        "Invalid Question"
      );
    }
    const id = uuidv4();

    // Handling Graph Question
    if (selectedGraph?.isSelected && selectedGraph?.graph_type) {
      setPrompts((p) => [
        ...p,
        {
          id,
          answer: "",
          question: question,
          suggested_questions: [],
          task_id: null,
          isLoading: true,
          isGraphType: true,
          graphType: selectedGraph?.graph_type,
          questionTime: new Date(),
          answerTime: null,
        },
      ]);
      getGraphTaskID(question, id, selectedGraph?.graph_type);
      return;
    }

    setPrompts((p) => [
      ...p,
      {
        id,
        answer: "",
        question: question,
        suggested_questions: [],
        task_id: null,
        isLoading: true,
        questionTime: new Date(),
        answerTime: null,
      },
    ]);
    getTaskID(question, id);
  };

  // const onClickGraph = (type: string, graph_type: string) => {
  //     if (selectedGraph?.isSelected && selectedGraph?.type === type) {
  //         setSelectedGraph({ graph_type: null, isSelected: false, type: null })
  //         setselectedDropDownGraph(null)
  //         return
  //     }
  //     setSelectedGraph({ graph_type, isSelected: true, type })
  // }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        // Allow new line
        // Do not prevent default to allow new line
      } else {
        // Submit the prompt
        e.preventDefault(); // Prevent default to stop new line
        onClickSend();
      }
    }
  };


  useEffect(() => {
    const textarea = document.getElementById('questionInput');
    if (textarea instanceof HTMLTextAreaElement) {
      textarea.style.height = question ? 'auto' : '66px';
      if (question) {
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    }
  }, [question]);

  useEffect(() => {
    const textarea = document.getElementById('questionInput');
    if (textarea instanceof HTMLTextAreaElement) {
      const newHeight = Math.max(120, textarea.scrollHeight); // 54px for padding/margins
      setContainerHeight(newHeight);
    }
  }, [question]);

  useEffect(() => {
    if(flashCardData?.length <= 0){
      setPreviousNavItem(clickedNavItem);
      return
    }
    if(!opneChatModal){
      return
    }
    if(previousNavItem === clickedNavItem){
      return
    }
    setPreviousNavItem(clickedNavItem);
    
    const id = uuidv4();
    setPrompts((p) => [
      ...p,
      {
        id,
        answer: questionsList[clickedNavItem],
        question: '',
        suggested_questions: [],
        task_id: null,
        isLoading: false,
        questionTime: new Date(),
        answerTime: new Date(),
        notShow: true
      },
    ]);


    // setPrompts((prompts:any) =>
    //   prompts?.map((p:any) => {
    //     if (p.task_id === task_id) {
    //       const graphData = isGraphType
    //         ? parseGraphData(data?.result?.answer)
    //         : null;
    //       return {
    //         ...p,
    //         answer: isGraphType
    //           ? extractTextBeforeJson(data?.result?.answer)
    //           : data?.result?.answer,
    //         suggested_questions: parseSuggestedQuestions(
    //           data?.result?.suggested_questions
    //         ),
    //         isLoading: false,
    //         graphData: graphData?.isValid ? graphData?.data : null,
    //         answerTime: new Date(),
    //       };
    //     }
    //     return p;
    //   })
    // );
    // getTaskID(questionsList[clickedNavItem], id);
  }, [opneChatModal]);


  return (
    <div className="relative">
      <Dialog
        position="bottom-right"
        contentClassName="p-0 border-round-top-sm"
        showHeader={false}
        visible={opneChatModal}
        style={
          isResize
            ? {
              width: "80%",
              height: "100vh",
              maxHeight: "100%",
              margin: "0px",
            }
            : { width: "523px", height: "684px" }
        }
        onHide={() => {
          if (!opneChatModal) return;
          setOpenChatModal(false);
        }}
      >
        <AiDialogHeader />

        <div style={{ height: `120px` }} />

        <div
          className="flex flex-column align-items-end gap-4"
          style={{ padding: "0px 24px 0px 24px" }}
          ref={messageContainerRef}
        >
          <FalshCard clickedNavItem={clickedNavItem} />
          {prompts?.map((p, index) => {
            return (
              <div
                className="flex flex-column align-items-end gap-4 w-full"
                ref={prompts?.length === index + 1 ? messageContainerRef : null}
              >
                {!p?.notShow && (
                <QuestionContainer
                  question={p.question}
                  date={p?.questionTime}
                />)}
                <AnswerContainer
                  answer={p.answer}
                  isLoading={p.isLoading}
                  suggested_questions={p.suggested_questions}
                  isGraphType={p?.isGraphType}
                  graphData={p?.graphData}
                  graphType={p?.graphType}
                  date={p?.answerTime}
                />
              </div>
            );
          })}
          <p>
            The response is AI-generated and should be independently verified
            for accuracy.
          </p>
        </div>

        <div style={{ height: `${containerHeight}px`, transition: 'height 0.2s ease' }} />


        <div
          className="py-1 px-1 flex flex-column align-items-start w-full border-top-1 absolute bottom-0"
          style={{ borderColor: "#D0D5DD", background: "white" }}
        >
          <div className="flex flex-column w-full" style={{ 
              border: '1px solid #E5E7EB'  // Light gray border
            }}>
            <TextArea
              id="questionInput"
              value={question}
              onChange={(e) => {
                if (e.target) {
                  setQuestion(e.target.value);
                  // Auto-adjust height based on content
                  const textarea = e.target as HTMLTextAreaElement;
                  textarea.style.height = 'auto';
                  textarea.style.height = `${textarea.scrollHeight}px`;
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleKeyDown(e);
                } else if (e.key === 'Enter' && e.shiftKey) {
                  // Let the newline happen naturally and adjust height
                  setTimeout(() => {
                    const textarea = document.getElementById('questionInput');
                    if (textarea) {
                      textarea.style.height = 'auto';
                      textarea.style.height = `${textarea.scrollHeight}px`;
                    }
                  }, 0);
                }
              }}
              onPaste={(e: React.ClipboardEvent<HTMLTextAreaElement>) => {
                // Wait for the paste to complete
                setTimeout(() => {
                  const textarea = document.getElementById('questionInput');
                  if (textarea instanceof HTMLTextAreaElement) {
                    textarea.style.height = 'auto';
                    textarea.style.height = `${textarea.scrollHeight}px`;
                  }
                }, 10);
              }}
              placeholder="How can Cindy help you today?"
              className='no-focus-border'
              style={{
                width: '100%',
                resize: 'none',
                minHeight: '66px',
                maxHeight: '200px',
                padding: '8px 12px',
                lineHeight: '1.5',
                overflowY: 'auto',
                border: 'none',
                outline: 'none'
              }}
              rows={3}
              minLength={2}
              disabled={isLoading}
            />

            {/* Icons row */}
            <div className="flex justify-content-between align-items-center w-full">
              {/* Left side - Chart controls with reduced size */}
              <div className="flex align-items-center">
                <Button
                  icon="pi pi-chart-bar"
                  className="p-button-rounded p-button-text"
                  onClick={(e) => op.current?.toggle(e)}
                  tooltip="Select Chart Type"
                  style={{
                    width: '2rem',
                    height: '2rem',
                    padding: '0.25rem'
                  }}
                />
                {selectedDropDownGraph && (
                  <span className="text-sm text-500 ml-2 flex align-items-center">
                    {selectedDropDownGraph.name}
                    <i
                      className="pi pi-times text-500 cursor-pointer hover:text-700 ml-2"
                      style={{ fontSize: '0.875rem' }}
                      onClick={() => {
                        setSelectedGraph({
                          graph_type: null,
                          isSelected: false,
                          type: null,
                        });
                        setselectedDropDownGraph(null);
                      }}
                      title="Clear Selection"
                    />
                  </span>
                )}
              </div>


              {/* Right side - Send button with reduced size */}
              <Button
                disabled={isLoading}
                icon="pi pi-send"
                onClick={onClickSend}
                className="p-button-rounded"
                style={{
                  marginRight: '5px',
                  transform: "rotate(40deg)",
                  width: '1.75rem',
                  height: '1.75rem',
                  backgroundColor: '#18279A',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '0.30rem'
                }}
              />
            </div>
          </div>
        </div>

        <OverlayPanel ref={op} className="w-20rem">
          <div className="grid grid-nogutter">
            {GRAPHS.map((graph) => (
              <div
                key={graph.type}
                className="col-6 cursor-pointer p-3 hover:surface-100"
                onClick={() => {
                  const value = graph;
                  if (!value) {
                    setSelectedGraph({
                      graph_type: null,
                      isSelected: false,
                      type: null,
                    });
                    setselectedDropDownGraph(null);
                  } else {
                    setSelectedGraph({
                      graph_type: value.code,
                      isSelected: true,
                      type: value.type,
                    });
                    setselectedDropDownGraph(value);
                  }
                  op.current?.hide();
                }}
              >
                <div className="flex align-items-center gap-2">
                  <img
                    src={`/static/assets/images/graph/${graph.type}.svg`}
                    alt=""
                    height={20}
                    width={20}
                  />
                  <span>{graph.name}</span>
                </div>
              </div>
            ))}
          </div>
        </OverlayPanel>
      </Dialog>
      {!opneChatModal && (
        <div
          className="fixed right-0 bottom-0 p-3"
          style={{ zIndex: 10000000 }}
        >
          <img
            src="/static/assets/images/layout/images/ai-icon.svg"
            className=" cursor-pointer"
            onClick={() => { onClickChatIcon() }}
            alt="Ai Icon"
            height={82}
            width={82}
          />
        </div>
      )}
    </div>
  );
};

export default ChatBot;
