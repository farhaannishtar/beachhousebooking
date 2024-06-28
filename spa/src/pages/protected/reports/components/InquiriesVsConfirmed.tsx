"use client"
import BarChart from "@/components/charts/BarChart";
import { max } from "lodash";
import { useEffect, useState } from "react";

interface InquiriesVsConfirmedProps {
    data?: any
}

const InquiriesVsConfirmed: React.FC<InquiriesVsConfirmedProps> = ({ data }) => {


    useEffect(() => {
        console.log({ data });

        let barData = {
            labels: [0, ...Object.keys(data?.daily)],
            datasets: [
                {

                    backgroundColor: '#757575',
                    label: 'Confirmed',
                    borderWidth: {
                        top: 2,
                        left: 0,
                        right: 0,
                    },
                    data: Object.values(data?.daily).map((d: any) => d.confirmedCount),
                    metadata: { data: Object.values(data?.daily).map((d: any) => d.inquiriesCount), label: 'Inquiries' }
                },
                {

                    backgroundColor: '#F0F2F5',
                    label: 'Inquiries',
                    borderColor: '#757575',
                    borderWidth: {
                        top: 2,
                        left: 0,
                        right: 0,
                    },
                    data: Object.values(data?.daily).map((d: any) => d.inquiriesCount),
                    metadata: { data: Object.values(data?.daily).map((d: any) => d.confirmedCount), label: 'Confirmed' }
                },
            ],
        };
        setData(barData)
    }, [data]);


    // Charts params 
    const [dataX, setData] = useState<any>({
        labels: [],
        datasets: [
            {
                backgroundColor: '#F0F2F5',
                label: 'Inquiries',
                borderColor: '#757575',
                borderWidth: {
                    top: 2,
                    left: 0,
                    right: 0,
                },
                data: [65, 59, 80, 81, 56, 55, 40],
            },
        ],
    });

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {

            y: {
                stacked: true,
                border: {
                    display: false
                },
                ticks: {
                    maxTicksLimit: 5,
                },

            },
            x: {
                stacked: true,
                ticks: {
                    min: 5,
                    maxTicksLimit: 7,
                    callback: function (value: any, index: any, values: any) {
                        if (index === 0) {
                            return '';
                        }
                        return value;
                    },
                },

            }
        },
        plugins: {
            legend: {
                display: false
            },
            title: {
                display: true,
                text: '',
            },
            tooltip: {
                callbacks: {
                    label: function (context: any) {

                        const label = context.dataset.label || '';
                        const value = context.raw;
                        const secondStackValue = context.dataset.metadata.data[context.dataIndex]
                        const secondStackLabel = context.dataset.metadata.label

                        return [`${label}: ${value}`, `${secondStackLabel}: ${secondStackValue}`];
                    },
                    title: function (context: any) {
                        const date = new Date();  // 2009-11-10
                        const month = date.toLocaleString('default', { month: 'long' });
                        const dayNumber = context[0]?.label || '';
                        return `${dayNumber} ${month}`;
                    },
                },
            }
        },
    };

    return (
        <div className="h-60" >

            <BarChart data={dataX} options={options} />

        </div >
    );
}
export default InquiriesVsConfirmed;