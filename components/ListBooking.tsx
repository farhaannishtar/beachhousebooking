"use client";

import { BookingDB, Property, convertPropertiesForDb, numOfDays, organizedByDate } from '@/utils/lib/bookingType';
import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client';
import AuthButton from './AuthButton';

// interface BookingProps {
//   bookingsFromParent: BookingDB[];
// }

interface ListBookingsState {
  searchText: string | null;
  filter: {
    status: "Inquiry" | "Quotation" | "Confirmed" | null;
    checkIn: Date | null;
    properties: Property[] | null;
  }
  date: Date | null;
  dbBookings: BookingDB[];
}

export default function ListBooking() {

  const router = useRouter();
  const [state, setState] = useState<ListBookingsState>({
    searchText: null,
    date: null,
    dbBookings: [],
    filter: {
      status: null,
      checkIn: null,
      properties: null,
    }
  });
  
  async function fetchData()   {
    console.log("Fetching Data")
    const supabase = createClient();
    let bookingsData = supabase.from("bookings").select()
    
    

    if(state.searchText) {
      bookingsData = bookingsData
      .or(`client_name.ilike.%${state.searchText}%,client_phone_number.ilike.%${state.searchText}%`)
    } else if (state.filter.checkIn || state.filter.status || state.filter.properties) {
      if(state.filter.checkIn) {
        bookingsData = bookingsData.gte('check_in', state.filter.checkIn.toISOString())
      } 
      if(state.filter.status) {
        bookingsData = bookingsData.eq('status', state.filter.status.toLocaleLowerCase())
      }
      if(state.filter.properties) {
        bookingsData = bookingsData.contains('properties', convertPropertiesForDb(state.filter.properties))
      }
    } else {
      bookingsData = bookingsData.gte('check_in', new Date(new Date().setDate(new Date().getDate() - 2)).toISOString())
    }

    bookingsData = bookingsData.order('check_in', { ascending: true }).range(0, 10)
    bookingsData
    .then(( { data: bookingsData }) => {
      console.log(bookingsData)
      let bookings: BookingDB[] = []
      bookingsData?.forEach((booking) => {
        const lastIndex = booking.json.length - 1
        const lastBooking = booking.json[lastIndex]
        bookings.push({
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

  const dates = () : string[] => {
    return Object.keys(organizedByDate(state.dbBookings)).sort((a, b) => {
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
    <div className="mx-2 w-full px-4">
      <div className='flex'>
        <h1 className='text-lg font-bold leading-6 w-full text-center mt-3'>Bookings</h1>
        <div className='flex items-center'>
          <button
            className="btn btn-sm bg-selectedButton text-white"
            onClick={() => router.push('/protected/booking/create')}
          >+</button>
          <button
            className="btn btn-sm bg-selectedButton text-white"
            onClick={() => {
              const supabase = createClient();
              supabase.auth.signOut();
              router.push('/login')
            }}
          >Logout</button>

        </div>
      </div>
      <div className="relative my-3 mb-4 flex w-full flex-wrap items-stretch bg-inputBoxbg rounded-xl">
        <div className="relative flex items-center m-0 block w-full rounded-xl border border-solid border-neutral-300 bg-transparent px-3 text-base font-normal leading-[1.6] outline-none transition duration-200 ease-in-out focus-within:border-primary dark:border-neutral-600">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#617A8A" className="h-5 w-5 absolute z-50 left-3 pointer-events-none">
            <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
          </svg>
          <input type="search" className="relative flex-auto w-full px-10 py-[0.25rem] placeholder:text-placeHolderText bg-inputBoxbg text-neutral-700 outline-none" placeholder="Search" aria-label="Search"
            name="searchText"
            value={state.searchText || undefined}
            onChange={handleChangeSearch}
          />
          {/* <FilterModal /> */}
        </div>
      </div>
      {dates().map((date) => (
        <React.Fragment key={date}>
        <p className="pl-1 mt-6 text-neutral-900 text-lg font-semibold leading-6">
          {convertDate(date)}
        </p>
        {organizedByDate(state.dbBookings)[date].map((booking, index) => (
          <div 
            className="flex mt-3 w-full justify-between"
            key={booking.bookingId}
            onClick={() => router.push(`/protected/booking/${booking.bookingId}`)}
          >
            <div className="pl-3">
              <p>
                <span className="text-neutral-900 text-base font-medium leading-6">{booking.client.name}</span> <span className="text-slate-500 text-sm font-normal leading-5">{booking.status}</span>
              </p>
              <div>
                <p className="text-slate-500 text-sm font-normal leading-5">{numOfDays(booking)} days, {booking.numberOfGuests} pax</p>
                { booking.properties?.length > 0 && (
                  <p className="text-slate-500 text-sm font-normal leading-5">{booking.properties.join(", ")}</p>
                )}
                
                {booking.refferral && (
                  <p className="text-slate-500 text-sm font-normal leading-5">Referral: {booking.refferral}</p>
                )}
              </div>
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
      

    </div>
  );
};