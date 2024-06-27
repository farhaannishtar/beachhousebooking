"use client"
import BarChart from "@/components/charts/BarChart";
import { useEffect, useState } from "react";

interface IncomeFromCheckinProps {
    data?: any
}

const IncomeFromCheckin: React.FC<IncomeFromCheckinProps> = ({ data }) => {


    useEffect(() => {
        console.log({ data });

        let barData = {
            labels: Object.keys(data?.daily),
            datasets: [

                {

                    backgroundColor: '#F0F2F5',
                    label: 'Incomes',
                    borderColor: '#757575',
                    borderWidth: {
                        top: 2,
                        left: 0,
                        right: 0,
                    },
                    data: Object.values(data?.daily).map((d: any) => d.sum / 1000),
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
                label: 'Inqueries',
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
                    min: 5,
                    maxTicksLimit: 5,
                    callback: function (value: any, index: any, values: any) {
                        if (index === 0) {
                            return '';
                        }
                        return `${value}k`;
                    }
                }

            },
            x: {
                stacked: true,
                ticks: {
                    min: 5,
                    maxTicksLimit: 7,
                    callback: function (value: any, index: any, values: any) {
                        // Hide the first tick
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
                        return `${label}: ₹${value}K`;
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
export default IncomeFromCheckin;