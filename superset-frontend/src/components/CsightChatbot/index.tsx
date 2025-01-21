/* eslint-disable */
// @ts-nocheck
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
  } = useAIBotContext();

  const { showToast } = useToast();

  const op = useRef<OverlayPanel>(null);

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

        <div style={{ height: "120px" }} />

        <div
          className="flex flex-column align-items-end gap-4"
          style={{ padding: "0px 24px 0px 24px" }}
          ref={messageContainerRef}
        >
          <FalshCard />
          {prompts?.map((p, index) => {
            return (
              <div
                className="flex flex-column align-items-end gap-4 w-full"
                ref={prompts?.length === index + 1 ? messageContainerRef : null}
              >
                <QuestionContainer
                  question={p.question}
                  date={p?.questionTime}
                />
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

        <div style={{ height: "120px" }} />

        <div
          className="py-1 px-4 flex flex-column align-items-start w-full border-top-1 absolute bottom-0"
          style={{ borderColor: "#D0D5DD", background: "white" }}
        >
          <div className="flex align-items-center w-full">
            <TextArea
              id="questionInput"
              value={question}
              onChange={(e) => {
                setQuestion(e.target.value);
              }}
              onKeyDown={handleKeyDown}
              placeholder="How can Cindy help you today?"
              // style={{ 
              //   fontSize: "16px", 
              //   width: "100%", 
              //   marginRight: '5px', 
              //   marginTop: '5px',
              //   resize: 'none'
              // }}
              rows={3}
              minLength={2}
              // autoSize={{ 
              //   minRows: 3, 
              //   maxRows: 15
              // }}
              disabled={isLoading}
            />
            <Button
              disabled={isLoading}
              icon="pi pi-send"
              onClick={onClickSend}
              className="border-none border-circle shadow-none text-white"
              style={{
                marginTop: '5px',
                marginLeft: '5px',
                background: "#18279a",
                minWidth: "40px",
                height: "40px",
                transform: "rotate(40deg)",
              }}
            />
          </div>

          {/* Chart selection row */}
          <div className="w-full flex align-items-center mt-1">
            <Button
              icon="pi pi-chart-bar"
              className="p-button-rounded p-button-text"
              onClick={(e) => op.current?.toggle(e)}
              tooltip="Select Chart Type"
              style={{ 
                width: '2rem', 
                height: '2rem',
                padding: '0'
              }}
            />
            {selectedDropDownGraph && (
              <span className="text-sm text-500">
                Selected: {selectedDropDownGraph.name}
              </span>
            )}
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
              <div
                className="col-12 flex justify-content-end p-1 border-top-1"
                onClick={() => {
                  setSelectedGraph({
                    graph_type: null,
                    isSelected: false,
                    type: null,
                  });
                  setselectedDropDownGraph(null);
                  op.current?.hide();
                }}
              >
                <i 
                  className="pi pi-times text-500 cursor-pointer hover:text-700" 
                  style={{ 
                    fontSize: '0.875rem',
                    padding: '4px'
                  }}
                  title="Clear Selection"
                />
              </div>
            </div>
          </OverlayPanel>
        </div>
      </Dialog>
      {!opneChatModal && (
        <div
          className="fixed right-0 bottom-0 p-3"
          style={{ zIndex: 10000000 }}
        >
          <img
            src="/static/assets/images/layout/images/ai-icon.svg"
            className=" cursor-pointer"
            onClick={()=>{onClickChatIcon()}}
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
