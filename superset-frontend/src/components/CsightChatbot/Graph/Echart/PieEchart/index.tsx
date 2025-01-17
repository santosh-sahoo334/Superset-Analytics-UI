/* eslint-disable */
// @ts-nocheck
import ReactECharts, { EChartsOption } from "echarts-for-react";
import React, { useEffect, useState } from 'react';
import { GRAPH_COLORS, useAIBotContext } from '../../../Context';
interface PieEchartProps {
    title: string
    labels: string[]
    data: string[]
}
const PieEchart: React.FunctionComponent<PieEchartProps> = ({ data, labels, title }) => {
    const [dataSet, setDataSet] = useState<any[]>([])
    const [option, setOptions] = useState<null | EChartsOption>(null)
    const { isResize } = useAIBotContext()

    useEffect(() => {
        if (labels && labels?.length > 0) {
            const o: EChartsOption = {
                title: {
                    text: title,
                    left: 'center',
                    textStyle: {
                        overflow: "breakAll",
                        width: 300
                    }
                },
                tooltip: {
                    trigger: 'axis'
                },
                series: [
                    {
                        name: title,
                        type: 'pie',
                        radius: '50%',
                        data: [],
                    }
                ],
            }

            const graphData = labels?.map(((_label, index) => {
                return {
                    value: data?.[index] || 0,
                    name: _label,
                    itemStyle: {
                        color: GRAPH_COLORS[index % GRAPH_COLORS.length]
                    }
                }
            }))
            setOptions({
                ...o, series: {
                    data: graphData,
                    name: title,
                    type: 'pie',
                    radius: '50%',
                }
            })

            setDataSet(graphData)
        }
    }, [JSON.stringify(labels)])

    if (dataSet?.length === 0) return <></>

    return (
        <div className='chart-container' style={{ width: isResize ? "60%" : 400, height: 400 }}>
            <ReactECharts option={option} className="h-full w-full" />
        </div>
    );
}

export default PieEchart;