"use client"
import BarChart from "@/components/charts/BarChart";
import InquiriesVsConfirmed from "./InquiriesVsConfirmed";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import IncomeFromReservation from "./IncomeFromReservation";
import IncomesFromCheckin from "./IncomeFromCheckin";

export interface StatsState {
    filter: {
        month: "June" | "July",
        employee: "Prabhu" | "Yasmeen" | "Rafica" | "Nusrath" | null
        referral: "Google" | "Instagram" | null
    }
    rawReservationsResponse: any,
    rawCheckinsResponse: any
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
                    rawReservationsResponse: data
                }
            })
            console.log(' rawReservationsResponse: ', data);

        })

        supabase.rpc('get_checkin_stats', { month: monthConvert[formState.filter.month], year: 2024, employee: formState.filter.employee, referral: formState.filter.referral }).then(({ data, error }) => {
            if (error) {
                console.log("error ", error);
            }
            setFormState((prevState) => {
                return {
                    ...prevState,
                    rawCheckinsResponse: data
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
            rawReservationsResponse: { daily: [], monthly: [] },
            rawCheckinsResponse: { daily: [], monthly: [] }
        });

    const conversionRate = (formState?.rawReservationsResponse?.monthly?.confirmedCount / formState?.rawReservationsResponse?.monthly?.inquiriesCount) * 100

    return (
        <div className='flex flex-col gap-6' >
            <div className='flex items-center h-[72px]' >
                <span className=" material-symbols-outlined cursor-pointer hover:text-selectedButton"  >arrow_back</span>
                <h1 className='text-lg font-bold leading-6 w-full text-center '>Reports</h1>
            </div>
            <div >
                <h1 className="title my-4">Summary</h1>
                <div className="flex flex-col  gap-4">
                    <div className="flex gap-4">
                        <div className="flex-1 rounded-xl h-28 bg-typo_light-100 flex flex-col justify-end py-2 gap-4 px-6">
                            <h3 className="label !p-0 !font-medium">Inquiries</h3>
                            <h1 className="title">{formState?.rawReservationsResponse?.monthly?.inquiriesCount}</h1>
                        </div>
                        <div className="flex-1 rounded-xl h-28 bg-typo_light-100 flex flex-col justify-end py-2 gap-4 px-6">
                            <h3 className="label !p-0 !font-medium">Confirmed</h3>
                            <h1 className="title">{formState?.rawReservationsResponse?.monthly?.confirmedCount}</h1>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1 rounded-xl h-28 bg-typo_light-100 flex flex-col justify-end py-2 gap-4 px-6">
                            <h3 className="label !p-0 !font-medium">Conversion Rate</h3>
                            <h1 className="title">{conversionRate ? conversionRate.toFixed(1) + '%' : 0}</h1>
                        </div>
                        <div className="flex-1 rounded-xl h-28 bg-typo_light-100 flex flex-col justify-end py-2 gap-4 px-6">
                            <h3 className="label !p-0 !font-medium"> Total Income  reservations</h3>
                            <h1 className="title">{'₹' + (parseInt(formState?.rawReservationsResponse?.monthly?.confirmedSum)).toLocaleString() }</h1>
                        </div>
                    </div>
                </div>
            </div>
            <div >
                <h1 className="title">Inquiries vs Confirmed</h1>
                <InquiriesVsConfirmed data={formState.rawReservationsResponse} />
            </div>
            <div>
                <h1 className="title">Income from Reservations</h1>
                <IncomeFromReservation data={formState.rawReservationsResponse} />
            </div>
            <div>
                <h1 className="title">Income from Checkins</h1>
                <IncomesFromCheckin data={formState.rawCheckinsResponse} />
            </div>
            <div className="flex flex-col gap-6">
                <h1 className="title">Booking Details</h1>
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                        <h3 className="label">Total Reservations Value</h3>
                        <h3 className="label !font-semibold">{'₹' + (parseInt(formState?.rawReservationsResponse?.monthly?.confirmedSum)).toLocaleString() }</h3>
                    </div>
                    <div className="flex justify-between items-center">
                        <h3 className="label">Average Reservation Value</h3>
                        <h3 className="label !font-semibold">{'₹' + (parseFloat(formState?.rawReservationsResponse?.monthly?.confirmedAvg)).toLocaleString() }</h3>
                    </div>
                    <div className="flex justify-between items-center">
                        <h3 className="label">Total Checkin Value</h3>
                        <h3 className="label !font-semibold">{'₹' + (parseInt(formState?.rawCheckinsResponse?.monthly?.sum)).toLocaleString() }</h3>
                    </div>
                    <div className="flex justify-between items-center">
                        <h3 className="label">Average Checkin Value</h3>
                        <h3 className="label !font-semibold">{'₹' + (parseFloat(formState?.rawCheckinsResponse?.monthly?.average)).toLocaleString() }</h3>
                    </div>


                </div>
            </div>
        </div >
    );
}