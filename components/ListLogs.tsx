"use client";

import { BookingDB, Property, convertPropertiesForDb, numOfDays, organizedByUpdateDate } from '@/utils/lib/bookingType';
import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client';
import SearchInput from './ui/SearchInput';

// interface BookingProps {
//   bookingsFromParent: BookingDB[];
// }

interface ListLogsState {
  searchText: string | null;
  filter: {
    status: "Inquiry" | "Quotation" | "Confirmed" | null;
    updatedTime: Date | null;
    properties: Property[] | null;
    starred: boolean | null;
    paymentPending: boolean | null;
    createdBy: "Nusrat" | "Prabhu" | "Yasmeen" | "Rafica" | null
  }
  date: Date | null;
  dbBookings: BookingDB[];
}

let lastScrollToCeilingTime = Date.now();

export default function ListLogs() {

  let lastNumOfDays = 1;
  let scrollLock = false;
  const [lastScrollY, setLastScrollY] = useState(0);

  const handleScroll = () => {
    const currentScrollY = window.scrollY;

    if (currentScrollY < lastScrollY && currentScrollY === 0 && !scrollLock) {

      console.log(`User has hit ceiling ${Date.now()}, ${lastScrollToCeilingTime}, ${Date.now() - lastScrollToCeilingTime}`);

      if (Date.now() - lastScrollToCeilingTime < 2000) {
        console.log('User has hit ceiling twice in less than 1 second');
        scrollLock = true;
        lastNumOfDays = lastNumOfDays + 3;
        fetchData()
        setTimeout(() => {
          scrollLock = false;
        }, 1000);
      }
      lastScrollToCeilingTime = Date.now();

    }

    setLastScrollY(currentScrollY);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Only add the event listener in the browser environment
      window.addEventListener('scroll', handleScroll);

      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    }
  }, [lastScrollY]);

  const router = useRouter();
  const [state, setState] = useState<ListLogsState>({
    searchText: null,
    date: null,
    dbBookings: [],
    filter: {
      status: null,
      updatedTime: null,
      properties: null,
      starred: null,
      paymentPending: null,
      createdBy: null
    }
  });

  async function fetchData() {
    const supabase = createClient();
    let bookingsData = supabase.from("bookings").select()

    if (state.searchText) {
      bookingsData = bookingsData
        .or(`client_name.ilike.%${state.searchText}%,client_phone_number.ilike.%${state.searchText}%`)
    } else if (state.filter.updatedTime || state.filter.status || state.filter.properties || state.filter.starred || state.filter.paymentPending || state.filter.createdBy) {
      if (state.filter.updatedTime) {
        bookingsData = bookingsData.gte('updated_at', state.filter.updatedTime.toISOString())
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
        bookingsData = bookingsData.eq('email', state.filter.createdBy)
      }
    } else {
      bookingsData = bookingsData.gte('updated_at', new Date(new Date().setDate(new Date().getDate() - lastNumOfDays)).toISOString())
    }

    bookingsData = bookingsData.order('updated_at', { ascending: true })
    bookingsData
      .then(({ data: bookingsData }) => {
        let bookings: BookingDB[] = []
        bookingsData?.forEach((booking) => {
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
      })
  };


  useEffect(() => {
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
    return Object.keys(organizedByUpdateDate(state.dbBookings)).sort((a, b) => {
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

  return (
    <div className="w-full  ">
      {/* Top Nav */}
      <div className='flex items-center h-[72px]' >
        <h1 className='text-lg font-bold leading-6 w-full text-center '>Logs</h1>
        {/* <div className='flex items-center'>
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

        </div> */}
        <span className=" material-symbols-outlined cursor-pointer hover:text-selectedButton" onClick={() => router.push('/protected/booking/create')}>add_circle</span>
      </div>
      {/* Top Nav */}
      <SearchInput value={state.searchText || undefined}
        onChange={handleChangeSearch} />
      {/* <div className="relative my-3 mb-4 flex w-full flex-wrap items-stretch bg-inputBoxbg rounded-xl">
       
         <div className="relative flex items-center m-0 block w-full rounded-xl border border-solid border-neutral-300 bg-transparent px-3 text-base font-normal leading-[1.6] outline-none transition duration-200 ease-in-out focus-within:border-primary dark:border-neutral-600">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#617A8A" className="h-5 w-5 absolute z-50 left-3 pointer-events-none">
            <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
          </svg>
          <input type="search" className="relative flex-auto w-full px-10 py-[0.25rem] placeholder:text-placeHolderText bg-inputBoxbg text-neutral-700 outline-none" placeholder="Search" aria-label="Search"
            name="searchText"
            value={state.searchText || undefined}
            onChange={handleChangeSearch}
          />
         
        </div> 
      </div> */}
      {dates().map((date) => (
        <React.Fragment key={date}>
          <p className="pl-1 mt-6 text-neutral-900 text-lg font-semibold leading-6">
            {convertDate(date)}
          </p>
          {organizedByUpdateDate(state.dbBookings)[date].map((booking, index) => (
            <div
              className="flex mt-3 w-full justify-between"
              key={booking.bookingId}
              onClick={() => router.push(`/protected/booking/${booking.bookingId}`)}
            >
              <div className="pl-3 flex flex-col gap-1">
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
                <div className='flex items-center gap-4 text-sm'>
                  <label >Rs {booking.outstanding == 0 ? booking.paid : booking.outstanding}</label>
                  <div className={`${booking.outstanding == 0 ? ' bg-green-500/30' : 'bg-error/20'} px-3 rounded-xl`}>{booking.outstanding == 0 ? 'Paid' : 'Unpaid'}</div>
                </div>
                {booking.updatedBy.name && (
                  <label className="text-slate-500 text-sm font-normal ">@{booking.createdBy.name}</label>
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


    </div>
  );
};