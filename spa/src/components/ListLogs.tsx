"use client"
import { BookingDB, Property, convertDateToIndianDate, convertPropertiesForDb, printInIndianTime, numOfDays, organizedByCreatedDate } from '@/utils/lib/bookingType';
import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/router'

import SearchInput from './ui/SearchInput';
import LoadingButton from './ui/LoadingButton';
import DateTimePickerInput from './DateTimePickerInput/DateTimePickerInput';
import Properties from './Properties';
import { supabase } from '@/utils/supabase/client';
import BookingFilter from './BookingFilter';


export interface ListLogsState {
  searchText: string | null;
  filter: {
    status: "Inquiry" | "Quotation" | "Confirmed" | null;
    createdTime: string | null;
    properties: Property[];
    starred: boolean | null;
    paymentPending: boolean | null;
    createdBy: "Nusrat" | "Prabhu" | "Yasmeen" | "Rafica" | null
  }
  date: Date | null;
  dbBookings: BookingDB[];
}

let lastNumOfDays = 0;

export default function ListLogs() {

  const router = useRouter();
  //Scroll smoothely to page section

  const [state, setState] = useState<ListLogsState>({
    searchText: null,
    date: null,
    dbBookings: [],
    filter: {
      status: null,
      createdTime: null,
      properties: [],
      starred: null,
      paymentPending: null,
      createdBy: null
    }
  });
  //Loading data
  const [loading, setLoading] = useState<boolean>(false)
  async function fetchData() {
    setLoading(true)
    let bookingsData = supabase.from("bookings").select()

    if (state.searchText) {
      bookingsData = bookingsData
        .or(`client_name.ilike.%${state.searchText}%,client_phone_number.ilike.%${state.searchText}%`)
    } else if (state.filter.createdTime || state.filter.status || state.filter.properties.length > 0 || state.filter.starred || state.filter.paymentPending || state.filter.createdBy) {

      if (state.filter.createdTime) {
        bookingsData = bookingsData.gte('created_at', convertDateToIndianDate({ date: new Date(state.filter.createdTime) }))
      }
      if (state.filter.status) {

        bookingsData = bookingsData.eq('status', state.filter.status.toLocaleLowerCase())
      }
      if (state.filter.properties) {
        bookingsData = bookingsData.contains('properties', convertPropertiesForDb(state.filter.properties))
      }
      if (state.filter.starred) {
        bookingsData = bookingsData.eq('starred', state.filter.starred)
      }
      if (state.filter.paymentPending) {
        bookingsData = bookingsData.gt('outstanding', 0)
      }
      if (state.filter.createdBy) {
        bookingsData = bookingsData.eq('email', state.filter.createdBy).gte('updated_at', convertDateToIndianDate({ subtractDays: lastNumOfDays }))
      }
    } else {
      bookingsData = bookingsData.gte('created_at', convertDateToIndianDate({ subtractDays: lastNumOfDays }))
    }

    bookingsData = bookingsData.order('created_at', { ascending: true })
    let { data: result } = await bookingsData
    let bookings: BookingDB[] = []
    result?.forEach((booking: any) => {
      const lastIndex = booking.json.length - 1
      const lastBooking: BookingDB = booking.json[lastIndex]
      bookings.push({
        ...lastBooking,
        bookingId: booking.id,
      })
    })
    setState((prevState) => ({
      ...prevState,
      dbBookings: bookings,
    }));
    //Scroll smoothely to page section
    if (router.asPath.includes('#')) {
      const id = router.asPath.split('#')[1];
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
    setLoading(false);
    setFilterModalOpened(false)

  };


  useEffect(() => {
    lastNumOfDays = 0
    fetchData()
  }, []);

  useEffect(() => {
    fetchData()
  }, [state.searchText])


  const handleChangeSearch = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setState((prevState) => ({
      ...prevState,
      searchText: value.length > 0 ? value : null,
    }));
  };

  const dates = (): string[] => {
    return Object.keys(organizedByCreatedDate(state.dbBookings)).sort((a, b) => {
      if (a == "Invalid Date") return 1
      if (b == "Invalid Date") return -1
      return new Date(a).getTime() - new Date(b).getTime()
    })
  }

  const convertDate = (date: string) => {
    if (new Date(date).toDateString() === new Date().toDateString()) {
      return "Today"
    }
    else if (new Date(date).toDateString() === new Date(new Date().setDate(new Date().getDate() - 1)).toDateString()) {
      return "Yesterday"
    }
    else if (new Date(date).toDateString() === new Date(new Date().setDate(new Date().getDate() + 1)).toDateString()) {
      return "Tomorrow"
    } else {
      return date
    }
  }

  const convertTimeToDateTime = (time: string) => {
    // 2024-06-28T18:30:00.000Z to Jun 28, 24
    const date = new Date(time)
    return date.toDateString().slice(4, 10) + ", " + date.toDateString().slice(11, 15)
  }
  //Filter modal
  const [filterModalOpened, setFilterModalOpened] = useState<Boolean>(false)
  const showFilterModal = () => {
    setFilterModalOpened(!filterModalOpened)
  }
  const filterChange = ({ name, value }: { name: string, value: string | null | boolean }) => {
    setState((prevState) => ({
      ...prevState,
      filter: {
        ...prevState.filter,
        [name]: prevState.filter[name as keyof typeof prevState.filter] == value ? null : value
      }
    }));
  }

  const handleDateChange = (name: string, value: string | null) => {
    setState((prevState) => ({
      ...prevState,
      filter: { ...prevState.filter, [name]: value }
    }));
  };
  return (
    <div className="w-full  ">
      {/* Top Nav */}
      <div className='flex items-center h-[72px]' >
        <h1 className='text-lg font-bold leading-6 w-full text-center '>Logs</h1>

        <span className=" material-symbols-outlined cursor-pointer hover:text-selectedButton" onClick={() => router.push('/protected/booking/create')}>add_circle</span>
      </div>
      {/* Top Nav */}
      <SearchInput value={state.searchText || undefined}
        onChange={handleChangeSearch}
        onFilterClick={showFilterModal} />
      <LoadingButton
        className=" border-[1px] border-selectedButton text-selectedButton my-4 w-full py-2 px-4 rounded-xl"
        onClick={
          () => {
            lastNumOfDays = lastNumOfDays + 1;
            fetchData()
          }
        } >Load More</LoadingButton>

      {dates().map((date) => (
        <React.Fragment key={date}>
          <p className="pl-1 mt-6 text-neutral-900 text-lg font-semibold leading-6">
            {convertDate(date)}
          </p>
          {organizedByCreatedDate(state.dbBookings)[date].map((booking, index) => (
            <div
              className="flex mt-3 w-full justify-between"
              key={booking.bookingId}
              id={`${booking.bookingId}-id`}
              onClick={() => router.push(`/protected/booking/${booking.bookingId}?returnTo=/protected/logs`)}
            >
              <div className="pl-3 flex flex-col gap-0">
                <label className='flex items-center gap-1'>
                  <span className="text-neutral-900 text-base font-medium ">{booking.client.name}</span> <span className="text-slate-500 text-sm font-normal ">{booking.status}</span>{booking?.starred && <span className='material-symbols-filled text-2xl'>star_rate</span>}
                </label>
                <label>
                  <span className="text-slate-500 text-sm font-normal ">{convertTimeToDateTime(booking.startDateTime)} - {convertTimeToDateTime(booking.endDateTime)}</span>
                </label>

                <label className="text-slate-500 text-sm font-normal ">{numOfDays(booking)} days, {booking.numberOfGuests} pax</label>
                {booking.properties?.length > 0 && (
                  <label className="text-slate-500 text-sm font-normal ">{booking.properties.join(", ")}</label>
                )}

                {booking.refferral && (
                  <label className="text-slate-500 text-sm font-normal ">Referral: {booking.refferral}</label>
                )}
                {booking.totalCost > 0 && (
                  <div className='flex items-center gap-4 text-sm'>
                    <label >Rs {booking.outstanding == 0 ? booking.paid : booking.outstanding}</label>
                    <div className={`${booking.outstanding == 0 ? ' bg-green-500/30' : 'bg-error/20'} px-3 rounded-xl`}>{booking.outstanding == 0 ? 'Paid' : 'Unpaid'}</div>
                  </div>
                )}
                {booking.updatedBy.name && (
                  <label className="text-slate-500 text-sm font-normal ">@{booking.createdBy.name} {printInIndianTime(booking.createdDateTime, true)}</label>
                )}

              </div>
              <div className="w-[84px] flex items-center">
                <div className="w-[74px] h-6 px-5 bg-gray-100 rounded-[19px] justify-center items-center inline-flex items-center">
                  <div className="w-11 left-[20px] top-[6px] text-center text-sky-500 text-base font-medium leading-normal">
                    {booking.bookingType}
                  </div>
                </div>
              </div>
            </div>

          ))}
        </React.Fragment>
      ))}
      {/* Filter modal */}

      <BookingFilter filterModalOpened={filterModalOpened}
        showFilterModal={showFilterModal}
        handleDateChange={handleDateChange}
        filterChange={filterChange}
        state={state}
        setState={setState}
        loading={loading}
        onClick={fetchData} />

    </div>
  );
};