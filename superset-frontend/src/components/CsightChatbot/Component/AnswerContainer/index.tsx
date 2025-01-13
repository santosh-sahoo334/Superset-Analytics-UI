/* eslint-disable */
import React from 'react'
import { v4 as uuidv4 } from "uuid"
import { GraphData, useAIBotContext } from '../../Context'
import BarEchart from '../../Graph/Echart/BarEchart'
import LineEchart from '../../Graph/Echart/LineEchart'
import PieEchart from '../../Graph/Echart/PieEchart'
import DonutEchart from '../../Graph/Echart/DonutEchart'
import { useToast } from '../../../CsightCommon/context/ToastContext'

interface AnswerContainerProps {
    answer: string
    isLoading: boolean
    suggested_questions: string[]
    isGraphType: boolean
    graphType: string | null
    graphData: GraphData | null
    date: Date | null
}

export const SuggestionQuestion = ({ question = "N/A", onClickSuggestion = (_question: string) => { } }) => {
    return <div className='border-1 py-2 px-3 border-round-lg w-fit cursor-pointer' style={{ borderColor: "#4657B8", color: "#4657B8", textOverflow: "ellipsis" }} onClick={() => onClickSuggestion(question)}>
        {question}
    </div>
}

const AnswerContainer: React.FC<AnswerContainerProps> = ({ answer, isLoading, suggested_questions = [], graphData, isGraphType, date, graphType }) => {
    const { isResize, getTaskID, setPrompts } = useAIBotContext()
    const { showToast } = useToast()

    const onClickSuggestion = (question: string) => {
        if (!question) {
            return showToast("Please type valid question", "error", "Invalid Question")
        }
        const id = uuidv4();
        setPrompts((p => ([...p, { id, answer: "", question: question, suggested_questions: [], task_id: null, isLoading: true, questionTime: new Date(), answerTime: null }])))
        getTaskID(question, id)
    }
    return (
        <div className='flex flex-column gap-4 w-full h-full'>
            {isLoading && <div style={{ color: "#98A2B3", textAlign: "left" }}>
                <i
                    className="pi pi-spin pi-spinner"
                    style={{ fontSize: "2rem", color: "#4472c4" }}
                ></i>
            </div>}

            {!isLoading && <div className='flex align-items-start gap-3 w-full'>
                <img src="/static/assets/images/layout/images/ai-icon.svg" alt='Ai Icon' height={34} width={34} />
                <div className={`answer_container flex flex-column`} >
                    <div style={{ width: isResize ? "70%" : "100%", whiteSpace: "pre-line" }}
                        dangerouslySetInnerHTML={{
                            __html: (answer).replaceAll(/\*\*(.*?)\*\*/g, '<b>$1</b>')
                        }}
                    />
                    {isGraphType && graphData?.labels && graphData?.labels?.length > 0 && <div className="graph_container mt-2">
                        {graphType === "bar" && <BarEchart data={graphData?.values} labels={graphData?.labels} title={graphData?.title} />}
                        {graphType === "line" && <LineEchart data={graphData?.values} labels={graphData?.labels} title={graphData?.title} />}
                        {graphType === "pie" && <PieEchart data={graphData?.values} labels={graphData?.labels} title={graphData?.title} />}
                        {graphType === "donut" && <DonutEchart data={graphData?.values} labels={graphData?.labels} title={graphData?.title} />}
                    </div>}

                    {date && <span className='question-date'>{date.toLocaleString('en-US', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                        hour12: true,
                    }).replace(',', ' -')}</span>}
                </div>
            </div>}



            {!isLoading && suggested_questions?.length > 0 && <div className='pl-6'>
                <p style={{ fontWeight: 500, fontSize: "14px", color: "#1D2939" }}>Suggestions:</p>
                <div className="questions-container">
                    <div className="flex gap-3 flex-column">
                        {suggested_questions?.map((question, index) => (
                            <div key={index}>
                                <SuggestionQuestion question={question} onClickSuggestion={onClickSuggestion} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>}
        </div>
    )
}

export default AnswerContainer