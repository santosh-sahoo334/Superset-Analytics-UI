/* eslint-disable */
import React from 'react'
import { useAIBotContext } from '../../Context'

interface QuestionContainerProps {
    question: string
    date: Date | null
}

const QuestionContainer: React.FunctionComponent<QuestionContainerProps> = ({ question, date }) => {
    const { isResize } = useAIBotContext()
    return (
        <div className='question_container' style={{ width: isResize ? "40%" : "285px;", whiteSpace: "pre-line" }}>
            <span>{question}</span>
            {date && <span className='question-date'>{date.toLocaleString('en-US', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                hour12: true,
            }).replace(',', ' -')}</span>}
        </div>
    )
}

export default QuestionContainer