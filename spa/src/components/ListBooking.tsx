"use client";

import { BookingDB, Property, convertDateToIndianDate, convertPropertiesForDb, numOfDays, organizedByStartDate } from '@/utils/lib/bookingType';
import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase/client';
import SearchInput from './ui/SearchInput';
import LoadingButton from './ui/LoadingButton';

// interface BookingProps {
//   bookingsFromParent: BookingDB[];
// }

interface ListBookingsState {
  searchText: string | null;
  filter: {
    checkIn: Date | null;
    properties: Property[] | null;
    starred: boolean | null;
    paymentPending: boolean | null;
  }
  date: Date | null;
  dbBookings: BookingDB[];
}
let numOfBookings = 7;
export default function ListBooking() {

  const router = useRouter();
  const [state, setState] = useState<ListBookingsState>({
    searchText: null,
    date: null,
    dbBookings: [],
    filter: {
      checkIn: null,
      properties: null,
      starred: null,
      paymentPending: null
    }
  });

  async function fetchData() {
    console.log("Fetching Data")
    let bookingsData = supabase.from("bookings").select()



    if (state.searchText) {
      bookingsData = bookingsData
        .or(`client_name.ilike.%${state.searchText}%,client_phone_number.ilike.%${state.searchText}%`)
    } else if (state.filter.checkIn || state.filter.properties || state.filter.starred || state.filter.paymentPending) {
      if (state.filter.checkIn) {
        bookingsData = bookingsData
          .gte('check_in', convertDateToIndianDate({date: new Date(state.filter.checkIn)}))
          .lte('check_in', convertDateToIndianDate({date: new Date(state.filter.checkIn), addDays: 1}))
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
    } else {
      bookingsData = bookingsData.gte('check_in', new Date(new Date().setDate(new Date().getDate() - 30)).toISOString())
    }

    bookingsData = bookingsData.eq('status', 'confirmed').order('check_in', { ascending: false }).range(0, numOfBookings)
    bookingsData
      .then(({ data: bookingsData }) => {
        console.log(bookingsData)
        let bookings: BookingDB[] = []
        bookingsData?.forEach((booking) => {
          const lastIndex = booking.json.length - 1
          const lastBooking = booking.json[lastIndex]
          bookings.unshift({
            ...lastBooking,
            bookingId: booking.id,
          })
        })
        setState((prevState) => ({
          ...prevState,
          dbBookings: bookings,
        }));
      })
  };


  useEffect(() => {
    numOfBookings = 7
    fetchData()
  }, []);

  useEffect(() => {
    console.log('State has changed:', state);
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
    return Object.keys(organizedByStartDate(state.dbBookings)).sort((a, b) => {
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

  return (
    <div className="w-full  ">
      {/* Top Nav */}
      <div className='flex items-center h-[72px]' >
        <h1 className='text-lg font-bold leading-6 w-full text-center '>Bookings</h1>

        <span className=" material-symbols-outlined cursor-pointer hover:text-selectedButton" onClick={() => router.push('/protected/booking/create')}>add_circle</span>
      </div>
      {/* Top Nav */}
      <SearchInput value={state.searchText || undefined}
        onChange={handleChangeSearch} />
      <LoadingButton
        className=" border-[1px] border-selectedButton text-selectedButton my-4 w-full py-2 px-4 rounded-xl"
        onClick={
          () => {
            numOfBookings = numOfBookings + 7;
            fetchData()
          }
        } >Load More</LoadingButton>
      {dates().map((date) => (
        <React.Fragment key={date}>
          <p className="pl-1 mt-6 text-neutral-900 text-lg font-semibold leading-6">
            {convertDate(date)}
          </p>
          {organizedByStartDate(state.dbBookings)[date].map((booking, index) => (
            <div
              className="flex mt-3 w-full justify-between"
              key={booking.bookingId}
              onClick={() => router.push(`/protected/booking/${booking.bookingId}`)}
            >
              {/* Booking details */}
              <div className="pl-3 flex flex-col gap-1">
                <label>
                  <span className="text-neutral-900 text-base font-medium leading-6">{booking.client.name}</span> <span className="text-slate-500 text-sm font-normal leading-5">{booking.status}</span>{booking?.starred && <span className='material-symbols-filled text-2xl'>star_rate</span>}
                </label>
                <label className="text-slate-500 text-sm font-normal ">{numOfDays(booking)} days, {booking.numberOfGuests} pax</label>
                {booking.properties?.length > 0 && (
                  <label className="text-slate-500 text-sm font-normal ">{booking.properties.join(", ")}</label>
                )}
                <div className='flex items-center gap-4 text-sm'>
                  <label >Rs {booking.outstanding == 0 ? booking.paid : booking.outstanding}</label>
                  <div className={`${booking.outstanding == 0 ? ' bg-green-500/30' : 'bg-error/20'} px-3 rounded-xl`}>{booking.outstanding == 0 ? 'Paid' : 'Unpaid'}</div>
                </div>
                {booking.refferral && (
                  <label className="text-slate-500 text-sm font-normal ">Referral: {booking.refferral}</label>
                )}
              </div>
              {/* Booking type */}
              <div className="w-[84px] flex items-center">
                <div className="w-[74px] h-8 px-5 bg-gray-100 rounded-[19px] justify-center items-center inline-flex items-center">
                  <div className="w-11 label !font-medium left-[20px] top-[6px] text-center text-sky-500 text-base font-medium leading-normal">
                    {booking.bookingType}
                  </div>
                </div>
              </div>
            </div>

          ))}
        </React.Fragment>
      ))}


    </div>
  );
};