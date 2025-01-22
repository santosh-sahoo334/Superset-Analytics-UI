/* eslint-disable */
import React from 'react'
import { useAIBotContext } from '../../Context'

const AiDialogHeader = () => {
    const { setOpenChatModal, isResize, setIsResize,setQuestion } = useAIBotContext()

    const onClickClose = () => {
        setOpenChatModal(false)
        setIsResize(false)
        setQuestion("") 
    }

    const onClickResize = () => {
        setIsResize(!isResize)
    }

    return (
        <div style={{ height: "86px", background: "#18279A", width: isResize ? "80%" : "523px", zIndex: 1 }} className='p-4 flex align-items-center justify-content-between fixed'>
            <div className='flex align-items-center gap-3'>
                <img src="/static/assets/images/layout/images/cindy-white.svg" alt='Ai Icon' height={54} width={54} />
                <div>
                    <h2 className='m-0' style={{ fontSize: "20px", color: "#FCFCFD" }}>Cindy.ai</h2>
                    <p className='m-0 text-base' style={{ color: "#FCFCFD" }} >Gen AI Companion</p>
                </div>
            </div>
            <div className='flex gap-3'>
                <img src={!isResize ? "/static/assets/images/layout/images/ai-resize.svg" : "/static/assets/images/layout/images/ai-resize-out.svg"} alt='Ai Icon' height={20} width={20} className='cursor-pointer' onClick={onClickResize} />
                <img src="/static/assets/images/layout/images/ai-close.svg" alt='Ai Icon' height={24} width={24} className='cursor-pointer' onClick={onClickClose} />
            </div>
        </div>
    )
}

export default AiDialogHeader