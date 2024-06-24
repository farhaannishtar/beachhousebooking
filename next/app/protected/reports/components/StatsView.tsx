"use client"
import BarChart from "@/components/charts/BarChart";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

export interface StatsState {
    filter: {
        month: "June" | "July",
        employee: "Prabhu" | "Yasmeen" | "Rafica" | "Nusrath" | null
        referral: "Google" | "Instagram" | null
    }
    rawReservationsResponse: string,
    rawCheckinsResponse: string
}

const monthConvert = { "June": 6, "July": 7 }

export default function StatsView() {
    const supabase = createClient();

    useEffect(() => {
        supabase.rpc('get_booking_stats', { month: monthConvert[formState.filter.month], year: 2024, employee: formState.filter.employee, referral: formState.filter.referral }).then(({ data, error }) => {
            if (error) {
                console.log("error ", error);
            }
            setFormState((prevState) => {
                return {
                    ...prevState,
                    rawReservationsResponse: JSON.stringify(data)
                }
            })
            console.log(' rawReservationsResponse: ', data);
            let barData = {
                labels: Object.keys(data?.daily),
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
                    },
                    {

                        backgroundColor: '#F0F2F5',
                        label: 'Inqueries',
                        borderColor: '#757575',
                        borderWidth: {
                            top: 2,
                            left: 0,
                            right: 0,
                        },
                        data: Object.values(data?.daily).map((d: any) => d.inquiriesCount),
                    },
                ],
            };
            setData(barData)
        })

        supabase.rpc('get_checkin_stats', { month: monthConvert[formState.filter.month], year: 2024, employee: formState.filter.employee, referral: formState.filter.referral }).then(({ data, error }) => {
            if (error) {
                console.log("error ", error);
            }
            setFormState((prevState) => {
                return {
                    ...prevState,
                    rawCheckinsResponse: JSON.stringify(data)
                }
            })
            console.log(' rawCheckinsResponse: ', data);

        })


    }, []);
    const [formState, setFormState] = useState<StatsState>(
        {
            filter: {
                month: "June",
                employee: null,
                referral: null
            },
            rawReservationsResponse: "",
            rawCheckinsResponse: ""
        });

    // Charts params 
    const [dataX, setData] = useState<any>({
        labels: [],
        datasets: [
            {
                label: 'My First dataset',
                backgroundColor: 'rgba(75,192,192,0.2)',
                borderColor: 'rgba(75,192,192,1)',
                borderWidth: 1,
                hoverBackgroundColor: 'rgba(75,192,192,0.4)',
                hoverBorderColor: 'rgba(75,192,192,1)',
                data: [65, 59, 80, 81, 56, 55, 40],
            },
        ],
    });

    const options = {
        responsive: true,
        scales: {

            y: {
                stacked: true,
                border: {
                    display: false
                },
                grid: {
                    display: false,
                },
                ticks: {
                    display: false,
                },
            },
            x: {
                stacked: true,
                grid: {
                    display: false,
                },
                ticks: {
                    display: false,
                },

            }
        },
        plugins: {
            legend: {
                position: 'top' as const,
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
                        return `${label}: ${value} `;
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
        <div className='flex flex-col gap-6' >
            <div className='flex items-center h-[72px]' >
                <span className=" material-symbols-outlined cursor-pointer hover:text-selectedButton"  >arrow_back</span>
                <h1 className='text-lg font-bold leading-6 w-full text-center '>Reports</h1>
            </div>
            <div>
                <h1 className="title">Inquiries vs Confirmed</h1>
                <BarChart data={dataX} options={options} />
            </div>
            <div>
                <h1 className="title">Income from Reservations</h1>
                <BarChart data={dataX} options={options} />
            </div>
            <div>
                <h1 className="title">Income from Checkins</h1>
                <BarChart data={dataX} options={options} />
            </div>
        </div >
    );
}