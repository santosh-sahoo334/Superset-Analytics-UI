/* eslint-disable */
import ReactECharts, { EChartsOption } from "echarts-for-react";
import React, { useEffect, useState } from 'react';
import { GRAPH_COLORS, useAIBotContext } from '../../../Context';
interface LineEchartProps {
    title: string
    labels: string[]
    data: string[]
}
const LineEchart: React.FunctionComponent<LineEchartProps> = ({ data, labels, title }) => {
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
                xAxis: {
                    type: 'category',
                    data: labels
                },
                yAxis: {
                    type: 'value'
                },
                series: [
                    {
                        data: [],
                        
                    }
                ],
            }

            const graphData = labels?.map(((_label, index) => {
                return {
                    value: data?.[index] || 0,
                    itemStyle: {
                        color: GRAPH_COLORS[index % GRAPH_COLORS.length]
                    }
                }
            }))
            setOptions({
                ...o, series: {
                    data: graphData,
                    type: 'line'
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

export default LineEchart;