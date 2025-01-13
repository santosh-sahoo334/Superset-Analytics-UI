/* eslint-disable */
import React, { useEffect, useState } from 'react';
import { Cell, LabelList, Pie, PieChart, Tooltip } from 'recharts';
import { GRAPH_COLORS, useAIBotContext } from '../../Context';

interface BarChartProps {
    title: string
    labels: string[]
    data: string[]
}
const PieGraph: React.FunctionComponent<BarChartProps> = ({ data, labels, title }) => {
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
            <PieChart
                style={{ outline: 'none' }}
                width={isResize ? 500 : 380} height={400}
            >
                <Pie data={dataSet} type="monotone" dataKey="value" stroke="#fff">
                    <LabelList dataKey="name" color='#fff' position="right" style={{ fontSize: "10px" }} formatter={(tick) => tick.length > 10 ? `${tick.substring(0, 10)}...` : tick} />
                    {dataSet.map((_entry, index) => {
                        return (
                            <Cell style={{ outline: 'none' }} key={`cell-${index}`} fill={GRAPH_COLORS[index % GRAPH_COLORS.length]} color='#fff' />
                        )
                    })}
                </Pie>
                <Tooltip />
            </PieChart>
            {/* </ResponsiveContainer> */}
        </div>
    );
}

export default PieGraph