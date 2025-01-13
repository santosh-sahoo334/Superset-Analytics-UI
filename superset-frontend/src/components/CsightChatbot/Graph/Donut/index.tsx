/* eslint-disable */
import React, { useEffect, useState } from 'react';
import { Cell, LabelList, Legend, Pie, PieChart, Tooltip } from 'recharts';
import { GRAPH_COLORS, useAIBotContext } from '../../Context';

interface BarChartProps {
    title: string
    labels: string[]
    data: string[]
}
const DonutGraph: React.FunctionComponent<BarChartProps> = ({ data, labels, title }) => {
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

    const renderColorfulLegendText = (value: string, entry: any) => {
        return (
            <span style={{ color: "#596579", fontWeight: 500, padding: "10px" }}>
                {value}
            </span>
        );
    };

    return (
        <div className='chart-container'>
            {/* <ResponsiveContainer width="100%" aspect={1} > */}
            {title && <p className='text-center px-2'>
                {title}
            </p>}
            <PieChart
                width={isResize ? 500 : 380} height={400}
                style={{ outline: 'none' }}
            >
                <Legend
                    height={36}
                    iconType="circle"
                    layout="centric"
                    verticalAlign="top"
                    iconSize={10}
                    formatter={renderColorfulLegendText}
                />
                <Pie data={dataSet} type="monotone" dataKey="value" stroke="#fff" label
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={0}
                >
                    {/* <LabelList dataKey="name" color='#fff' position="right" style={{ fontSize: "10px" }} formatter={(tick) => tick.length > 10 ? `${tick.substring(0, 10)}...` : tick} /> */}
                    {/* {dataSet.map((_entry, index) => {
                        return (
                            <Cell style={{ outline: 'none' }} key={`cell-${index}`} fill={GRAPH_COLORS[index % GRAPH_COLORS.length]} color='#fff' />
                        )
                    })} */}
                </Pie>
                <Tooltip />
            </PieChart>
            {/* </ResponsiveContainer> */}
        </div>
    );
}

export default DonutGraph