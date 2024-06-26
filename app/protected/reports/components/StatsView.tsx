"use client"
import BarChart from "@/components/charts/BarChart";
import InquiriesVsConfirmed from "./InquiriesVsConfirmed";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import IncomeFromReservation from "./IncomeFromReservation";
import IncomesFromCheckin from "./IncomeFromCheckin";
import DateTimePickerInput from "@/components/DateTimePickerInput/DateTimePickerInput";
import LoadingButton from "@/components/ui/LoadingButton";
import { useRouter } from 'next/navigation'
import { SelectPicker, Stack } from "rsuite";
import BaseSelect from "@/components/ui/BaseSelect";

export interface StatsState {
    filter: {
        month: "June" | "July",
        employee: "Prabhu" | "Yasmeen" | "Rafica" | "Nusrath" | null
        referral: "Google" | "Instagram" | "Facebook" | "Other" | null
    }
    rawReservationsResponse: any,
    rawCheckinsResponse: any
}

const monthConvert = { "June": 6, "July": 7 }

export default function StatsView() {
    const router = useRouter();

    const supabase = createClient();

    useEffect(() => {
        fetchData()

    }, []);
    const fetchData = () => {
        setLoading(true)
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
            setLoading(false)
            console.log(' rawCheckinsResponse: ', data);

        })

    }
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

    const dayOfMonth = new Date().getDate();
    const conversionRateForMonth = (formState?.rawReservationsResponse?.monthly?.confirmedCount / formState?.rawReservationsResponse?.monthly?.inquiriesCount) * 100
    const conversionRateDaily = (formState?.rawReservationsResponse?.daily[dayOfMonth]?.confirmedCount / formState?.rawReservationsResponse?.daily[dayOfMonth]?.inquiriesCount) * 100
    //Filter modal
    //Loading data
    const [loading, setLoading] = useState<boolean>(false)
    const [filterModalOpened, setFilterModalOpened] = useState<Boolean>(false)
    const toggleFilterModal = () => {
        setFilterModalOpened(!filterModalOpened)
    }
    const filterChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormState((prevState) => ({
            ...prevState,
            filter: { ...prevState.filter, [name]: value }
        }));

    }
    const handleDateChange = (name: string, value: string | null) => {
        setFormState((prevState) => ({
            ...prevState,
            filter: { ...prevState.filter, [name]: value }
        }));
    };
    return (
        <div className='flex flex-col gap-6' >
            <div className='flex items-center h-[72px]' >
                <span className=" material-symbols-outlined cursor-pointer hover:text-selectedButton" onClick={() => router.back()}>arrow_back</span>
                <h1 className='text-lg font-bold leading-6 w-full text-center '>Report for {formState.filter.month}</h1>
                <span className="material-symbols-filled text-2xl cursor-pointer" onClick={() => toggleFilterModal()}>filter_alt</span>
            </div>
            <div >
                <h1 className="title my-4">Summary for {formState.filter.month}</h1>
                <div className="flex flex-col  gap-4">
                    <div className="flex gap-4">
                        <div className="flex-1 rounded-xl h-28 bg-typo_light-100 flex flex-col justify-end py-2 gap-4 px-6">
                            <label className="label !p-0 !font-medium">Inquiries</label>
                            <label className="title">{formState?.rawReservationsResponse?.monthly?.inquiriesCount}</label>
                        </div>
                        <div className="flex-1 rounded-xl h-28 bg-typo_light-100 flex flex-col justify-end py-2 gap-4 px-6">
                            <label className="label !p-0 !font-medium">Confirmed</label>
                            <label className="title">{formState?.rawReservationsResponse?.monthly?.confirmedCount}</label>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1 rounded-xl h-28 bg-typo_light-100 flex flex-col justify-end py-2 gap-4 px-6">
                            <label className="label !p-0 !font-medium">Conversion Rate</label>
                            <label className="title">{conversionRateForMonth ? conversionRateForMonth.toFixed(1) + '%' : 0}</label>
                        </div>
                        <div className="flex-1 rounded-xl h-28 bg-typo_light-100 flex flex-col justify-end py-2 gap-4 px-6">
                            <label className="label !p-0 !font-medium"> Total Income  reservations</label>
                            <label className="title">{'₹' + (parseInt(formState?.rawReservationsResponse?.monthly?.confirmedSum)).toLocaleString()}</label>
                        </div>
                    </div>
                </div>
            </div>

            <div >
                <h1 className="title my-4">Summary for Today</h1>
                <div className="flex flex-col  gap-4">
                    <div className="flex gap-4">
                        <div className="flex-1 rounded-xl h-28 bg-typo_light-100 flex flex-col justify-end py-2 gap-4 px-6">
                            <label className="label !p-0 !font-medium">Inquiries</label>
                            <label className="title">{formState?.rawReservationsResponse?.daily[dayOfMonth]?.inquiriesCount}</label>
                        </div>
                        <div className="flex-1 rounded-xl h-28 bg-typo_light-100 flex flex-col justify-end py-2 gap-4 px-6">
                            <label className="label !p-0 !font-medium">Confirmed</label>
                            <label className="title">{formState?.rawReservationsResponse?.daily[dayOfMonth]?.confirmedCount}</label>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1 rounded-xl h-28 bg-typo_light-100 flex flex-col justify-end py-2 gap-4 px-6">
                            <label className="label !p-0 !font-medium">Conversion Rate</label>
                            <label className="title">{conversionRateDaily ? conversionRateDaily.toFixed(1) + '%' : 0}</label>
                        </div>
                        <div className="flex-1 rounded-xl h-28 bg-typo_light-100 flex flex-col justify-end py-2 gap-4 px-6">
                            <label className="label !p-0 !font-medium"> Total Income  reservations</label>
                            <label className="title">{'₹' + (parseInt(formState?.rawReservationsResponse?.daily[dayOfMonth]?.confirmedSum)).toLocaleString()}</label>
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
                        <label className="label">Total Reservations Value</label>
                        <label className="label !font-semibold">{'₹' + (parseInt(formState?.rawReservationsResponse?.monthly?.confirmedSum)).toLocaleString()}</label>
                    </div>
                    <div className="flex justify-between items-center">
                        <label className="label">Average Reservation Value</label>
                        <label className="label !font-semibold">{'₹' + (parseFloat(formState?.rawReservationsResponse?.monthly?.confirmedAvg)).toLocaleString()}</label>
                    </div>
                    <div className="flex justify-between items-center">
                        <label className="label">Total Checkin Value</label>
                        <label className="label !font-semibold">{'₹' + (parseInt(formState?.rawCheckinsResponse?.monthly?.sum)).toLocaleString()}</label>
                    </div>
                    <div className="flex justify-between items-center">
                        <label className="label">Average Checkin Value</label>
                        <label className="label !font-semibold">{'₹' + (parseFloat(formState?.rawCheckinsResponse?.monthly?.average)).toLocaleString()}</label>
                    </div>


                </div>
            </div>
            {/* Filter modal */}

            <div className={`${filterModalOpened ? 'top-0' : 'top-[9999px]'} transition-all fixed h-full w-full z-30 top-0 left-0 flex flex-col justify-end`}>
                {/* overlay background */}
                <div className="overlay h-full w-full bg-black/40 absolute z-10" onClick={toggleFilterModal}></div>
                {/* Filter part  */}
                <div className='bg-white flex flex-col p-4 relative gap-4 z-20'>
                    {/* filters */}
                    <label className='subheading'>Filters</label>
                    <BaseSelect value={formState.filter.month} data={[{ label: 'June', value: 'June' }, { label: 'July', value: 'July' }]} onChange={filterChange} name="month" />

                    {/* Referrals */}
                    <label className='subheading'>Referrals</label>
                    <div className='flex items-center flex-wrap gap-4' >
                        <div onClick={() => filterChange({ target: { name: 'referral', value: formState.filter.referral == 'Facebook' ? null : 'Facebook' } })} className={`badge badge-lg text-center w-44 ${formState.filter.referral == 'Facebook' ? '!text-white bg-selectedButton' : 'text-black bg-inputBoxbg'
                            } text-base font-medium leading-normal p-4 text-typo_dark-100 h-12 rounded-[20px] cursor-pointer`}>Facebook</div>
                        <div onClick={() => filterChange({ target: { name: 'referral', value: formState.filter.referral == 'Google' ? null : 'Google' } })} className={`badge badge-lg text-center w-44 ${formState.filter.referral == 'Google' ? '!text-white bg-selectedButton' : 'text-black bg-inputBoxbg'
                            } text-base font-medium leading-normal p-4 text-typo_dark-100 h-12 rounded-[20px] cursor-pointer`}>Google</div>
                        <div onClick={() => filterChange({ target: { name: 'referral', value: formState.filter.referral == 'Instagram' ? null : 'Instagram' } })} className={`badge badge-lg text-center w-44 ${formState.filter.referral == 'Instagram' ? '!text-white bg-selectedButton' : 'text-black bg-inputBoxbg'
                            } text-base font-medium leading-normal p-4 text-typo_dark-100 h-12 rounded-[20px] cursor-pointer`}>Instagram</div>

                        <div onClick={() => filterChange({ target: { name: 'referral', value: formState.filter.referral == 'Other' ? null : 'Other' } })} className={`badge badge-lg text-center w-44 ${formState.filter.referral == 'Other' ? '!text-white bg-selectedButton' : 'text-black bg-inputBoxbg'
                            } text-base font-medium leading-normal p-4 text-typo_dark-100 h-12 rounded-[20px] cursor-pointer`}>Other</div>



                    </div>
                    {/* Employees */}
                    <label className='subheading'>Employees</label>
                    <div className='flex items-center flex-wrap gap-4' >
                        <div onClick={() => filterChange({ target: { name: 'employee', value: 'Nusrath' } })} className={`badge badge-lg text-center w-32 ${formState.filter.employee == 'Nusrath' ? '!text-white bg-selectedButton' : 'text-black bg-inputBoxbg'
                            } text-base font-medium leading-normal p-4 text-typo_dark-100 h-12 rounded-[20px] cursor-pointer`}>Nusrath</div>
                        <div onClick={() => filterChange({ target: { name: 'employee', value: 'Prabhu' } })} className={`badge badge-lg text-center w-32 ${formState.filter.employee == 'Prabhu' ? '!text-white bg-selectedButton' : 'text-black bg-inputBoxbg'
                            } text-base font-medium leading-normal p-4 text-typo_dark-100 h-12 rounded-[20px] cursor-pointer`}>Prabhu</div>
                        <div onClick={() => filterChange({ target: { name: 'employee', value: 'Yasmeen' } })} className={`badge badge-lg text-center w-32 ${formState.filter.employee == 'Yasmeen' ? '!text-white bg-selectedButton' : 'text-black bg-inputBoxbg'
                            } text-base font-medium leading-normal p-4 text-typo_dark-100 h-12 rounded-[20px] cursor-pointer`}>Yasmeen</div>
                        <div onClick={() => filterChange({ target: { name: 'employee', value: 'Rafica' } })} className={`badge badge-lg text-center w-32 ${formState.filter.employee == 'Rafica' ? '!text-white bg-selectedButton' : 'text-black bg-inputBoxbg'
                            } text-base font-medium leading-normal p-4 text-typo_dark-100 h-12 rounded-[20px] cursor-pointer`}>Rafica</div>
                    </div>
                    {/* Apply filters */}
                    <LoadingButton
                        className=" border-[1px] border-selectedButton text-selectedButton my-4 w-full py-2 px-4 rounded-xl"
                        loading={loading}
                        onClick={() => { fetchData(); toggleFilterModal() }}
                    >Apply filters</LoadingButton>
                </div>

            </div>
        </div >
    );
}