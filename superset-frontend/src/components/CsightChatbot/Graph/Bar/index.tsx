/* eslint-disable */
import React, { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts';
import { GRAPH_COLORS, useAIBotContext } from '../../Context';

interface BarChartProps {
    title: string
    labels: string[]
    data: string[]
}
const BarGraph: React.FunctionComponent<BarChartProps> = ({ data, labels, title }) => {
    const [dataSet, setDataSet] = useState<any[]>([])
    const { isResize } = useAIBotContext()

    useEffect(() => {
        if (labels && labels?.length > 0) {
            const graphData = labels?.map(((label, index) => {
                return {
                    name: label,
                    value: data?.[index] || 0,
                    fill: GRAPH_COLORS[index % GRAPH_COLORS.length]
                }
            }))
            setDataSet(graphData)
        }
    }, [JSON.stringify(labels)])

    if (dataSet?.length === 0) return <></>

    return (
        <div className='chart-container'>
            {/* <ResponsiveContainer width="100%" aspect={1} > */}
            {title && <p className='text-center px-2'>
                {title}
            </p>}
            <BarChart style={{ outline: 'none' }} data={dataSet} width={isResize ? 500 : 380} height={400}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name"
                    tickFormatter={(tick) => tick.length > 10 ? `${tick.substring(0, 4)}...` : tick}
                    axisLine={false} />
                <YAxis />
                <Tooltip />
                <Bar style={{ outline: 'none' }} dataKey="value" fill="#8884d8" isAnimationActive={false} />
            </BarChart>
            {/* </ResponsiveContainer> */}
        </div>
    );
}

export default BarGraph