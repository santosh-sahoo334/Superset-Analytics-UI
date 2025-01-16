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
          {question && (
            <div className="pt-2 align-right w-full flex justify-content-end">
              <Dropdown
                value={selectedDropDownGraph}
                showClear
                onChange={(e) => {
                  if (!e?.value) {
                    setSelectedGraph({
                      graph_type: null,
                      isSelected: false,
                      type: null,
                    });
                    setselectedDropDownGraph(e.value);
                    return;
                  }
                  setSelectedGraph({
                    graph_type: e?.value?.code,
                    isSelected: true,
                    type: e?.value?.type,
                  });
                  setselectedDropDownGraph(e.value);
                }}
                options={GRAPHS}
                optionLabel="name"
                placeholder="Select a Chart Type"
                className="w-full md:w-18rem"
                itemTemplate={countryOptionTemplate}
              />
              {/* <div className="flex mb-2 align-items-center py-2 gap-3">
                                <div className={selectedGraph?.type === "g1" && selectedGraph?.isSelected ? "icon-container-sel" : "icon-container"} onClick={() => onClickGraph("g1", "bar")} title='Bar Graph'>
                                    <img
                                        src={selectedGraph?.type === "g1" && selectedGraph?.isSelected ? "/graph/g1_sel.svg" : "/graph/g1.svg"}
                                        alt=""
                                        height={35}
                                        width={44}
                                    />
                                </div>
                                <div className={selectedGraph?.type === "g2" && selectedGraph?.isSelected ? "icon-container-sel" : "icon-container"} onClick={() => onClickGraph("g2", "donut")} title='Donut Graph'>
                                    <img
                                        src={selectedGraph?.type === "g2" && selectedGraph?.isSelected ? "/graph/g2_sel.svg" : "/graph/g2.svg"}
                                        alt=""
                                        height={35}
                                        width={44}
                                    />
                                </div> */}
              {/* <div className={selectedGraph?.type === "g3" && selectedGraph?.isSelected ? "icon-container-sel" : "icon-container"} onClick={() => onClickGraph("g3", "bar")}>
                            <img
                                src={selectedGraph?.type === "g3" && selectedGraph?.isSelected ? "/graph/g3_sel.svg" : "/graph/g3.svg"}
                                alt=""
                                height={35}
                                width={34}
                            />
                        </div> */}
              {/* <div className={selectedGraph?.type === "g4" && selectedGraph?.isSelected ? "icon-container-sel" : "icon-container"} onClick={() => onClickGraph("g4", "pie")} title='Pie Graph'>
                                    <img
                                        src={selectedGraph?.type === "g4" && selectedGraph?.isSelected ? "/graph/g4_sel.svg" : "/graph/g4.svg"}
                                        alt=""
                                        height={35}
                                        width={41}
                                    />
                                </div>
                                <div className={selectedGraph?.type === "g5" && selectedGraph?.isSelected ? "icon-container-sel" : "icon-container"} onClick={() => onClickGraph("g5", "line")} title='Line Graph'>
                                    <img
                                        src={selectedGraph?.type === "g5" && selectedGraph?.isSelected ? "/graph/g5_sel.svg" : "/graph/g5.svg"}
                                        alt=""
                                        height={35}
                                        width={35}
                                    />
                                </div> */}
              {/* <div className={selectedGraph?.type === "g6" && selectedGraph?.isSelected ? "icon-container-sel" : "icon-container"} onClick={() => onClickGraph("g6", "bar")}>
                            <img
                                src={selectedGraph?.type === "g6" && selectedGraph?.isSelected ? "/graph/g6_sel.svg" : "/graph/g6.svg"}
                                alt=""
                                height={35}
                                width={39}
                            />
                        </div> */}
              {/* </div> */}
            </div>
          )}
          <div className="flex align-items-center w-full">
          <TextArea
                id="questionInput"
                value={question}
                onChange={(e) => {
                  setQuestion(e.target.value);
                }}
                onKeyDown={handleKeyDown}
                placeholder="How can Cindy help you today?"
                style={{ fontSize: "16px", width: "100%", marginRight: '5px', marginTop: '5px' }}
                minLength={1}
                rows={1} // Set the number of visible rows
                disabled={isLoading}
              />
            <Button
              disabled={isLoading}
              icon="pi pi-send"
              onClick={onClickSend}
              className="border-none border-circle shadow-none text-white"
              style={{
                marginTop: '5px',
                background: "#18279a",
                minWidth: "40px",
                height: "40px",
                transform: "rotate(40deg)",
              }}
            />
          </div>
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
