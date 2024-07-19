"use client";

import { BookingDB, Property, convertDateToIndianDate, convertPropertiesForDb, numOfDays, organizedByStartDate } from '@/utils/lib/bookingType';
import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/router'
import { supabase } from '@/utils/supabase/client';
import SearchInput from './ui/SearchInput';
import BookingFilter, { Filter } from './BookingFilter';
import LoadingButton from './ui/LoadingButton';

// interface BookingProps {
//   bookingsFromParent: BookingDB[];
// }

interface ListBookingsState {
  searchText: string | null;
  date: Date | null;
  dbBookings: BookingDB[];
}
let numOfBookingsForward = 7;
let numOfBookingsBackward = 0;
export default function ListBooking() {

  const router = useRouter();
  const [state, setState] = useState<ListBookingsState>({
    searchText: null,
    date: null,
    dbBookings: [],
  });

  const [filterState, setFilterState] = useState<Filter>({
    checkIn: null,
    properties: null,
    starred: null,
    paymentPending: null
  });

  const [loading, setLoading] = useState<boolean>(false)
  async function fetchData() {
    setLoading(true)
    console.log("Fetching Data")
    let bookingsData = supabase.from("bookings").select()



    if (state.searchText) {
      bookingsData = bookingsData
        .or(`client_name.ilike.%${state.searchText}%,client_phone_number.ilike.%${state.searchText}%`)
    } else if (filterState.checkIn || filterState.properties || filterState.starred || filterState.paymentPending) {
      if (filterState.checkIn) {
        console.log("Filtering by checkIn: ", filterState.checkIn)
        bookingsData = bookingsData
          .gte('check_in', convertDateToIndianDate({ date: new Date(filterState.checkIn) }))
          .lte('check_in', convertDateToIndianDate({ date: new Date(filterState.checkIn), addDays: 1 }))
      }
      if (filterState.properties) {
        bookingsData = bookingsData.contains('properties', convertPropertiesForDb(filterState.properties))
      }
      if (filterState.starred) {
        bookingsData = bookingsData.eq('starred', filterState.starred)
      }
      if (filterState.paymentPending) {
        bookingsData = bookingsData.gt('outstanding', 0)
      }
    } else {
      bookingsData = bookingsData.gte('check_in', new Date(new Date().setDate(new Date().getDate() - 2)).toISOString())
    }

    let bookingsDataBackward = bookingsData.eq('status', 'confirmed').order('check_in', { ascending: false }).range(0, numOfBookingsForward)
    let bookingsDataForward = bookingsData.eq('status', 'confirmed').order('check_in', { ascending: true }).range(0, numOfBookingsBackward)
    Promise.all([bookingsDataBackward, bookingsDataForward])
    .then(results => {
      // .then(({ data: bookingsData }) => {
        
        console.log("RESULTS ", results[0].data?.length, results[1].data?.length)
        let bookings: BookingDB[] = []
        results[0].data?.forEach((booking) => {
          const lastIndex = booking.json.length - 1
          const lastBooking = booking.json[lastIndex]
          bookings.unshift({
            ...lastBooking,
            bookingId: booking.id,
          })
        })
        results[1].data?.forEach((booking) => {
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
        //Scroll smoothely to page section
        if (router.asPath.includes('#')) {
          const id = router.asPath.split('#')[1];
          document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        }
        setLoading(false);
        setFilterModalOpened(false)
      })
  };


  useEffect(() => {
    numOfBookingsForward = 7
    setState((prevState) => ({
      ...prevState,
      searchText: null,
      filter: {
        checkIn: null,
        properties: null,
        starred: null,
        paymentPending: null
      }
    }));
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
  //Filter modal
  const [filterModalOpened, setFilterModalOpened] = useState<boolean>(false)
  const toggleFilterDisplay = () => {
    setFilterModalOpened(!filterModalOpened)
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
        onChange={handleChangeSearch}
        onFilterClick={toggleFilterDisplay} />
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

      <LoadingButton
        className=" border-[1px] border-selectedButton text-selectedButton my-4 w-full py-2 px-4 rounded-xl"
        onClick={
          () => {
            numOfBookingsBackward = numOfBookingsBackward + 7;
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
              id={`${booking.bookingId}-id`}
              onClick={() => router.push(`/protected/booking/${booking.bookingId}?returnTo=/protected/booking/list`)}
            >
              {/* Booking details */}
              <div className="pl-3 flex flex-col gap-0">
                <label className='flex items-center gap-1'>
                  <span className="text-neutral-900 text-base font-medium leading-6">{booking.client.name}</span> <span className="text-slate-500 text-sm font-normal leading-5">{booking.status}</span>{booking?.starred && <span className='material-symbols-filled text-2xl'>star_rate</span>}
                </label>
                <label className="text-slate-500 text-sm font-normal ">{numOfDays(booking)} days, {booking.numberOfGuests} pax</label>
                {booking.properties?.length > 0 && (
                  <label className="text-slate-500 text-sm font-normal ">{booking.properties.join(", ")}</label>
                )}
                {
                  <div className='flex items-center gap-4 text-sm'>
                    <label >Rs {booking.outstanding == 0 ? booking.paid.toLocaleString('en-IN') : booking.outstanding.toLocaleString('en-IN')}</label>
                    {booking.status == 'Confirmed' && <div className={`${booking.outstanding == 0 ? ' bg-green-500/30' : 'bg-error/20'} px-3 rounded-xl`}>{booking.outstanding == 0 ? 'Paid' : 'Unpaid'}</div>}
                  </div>
                }
                {booking.refferral && (
                  <label className="text-slate-500 text-sm font-normal ">Referral: {booking.refferral}</label>
                )}
              </div>
              {/* Booking type */}
              <div className="w-[84px] flex items-center">
                <div className="w-[74px] h-8 px-5 bg-gray-100 rounded-[19px] justify-center items-center inline-flex items-center">
                  <div className="w-11 label_text !font-medium left-[20px] top-[6px] text-center text-sky-500 text-base font-medium leading-normal">
                    {booking.bookingType}
                  </div>
                </div>
              </div>
            </div>

          ))}
        </React.Fragment>
      ))}
      {/* Filter modal */}

      <BookingFilter
        isFiltersOpened={filterModalOpened}
        toggleFilterDisplay={toggleFilterDisplay}
        filtersFor='Bookings'
        filterState={filterState}
        setFilterState={setFilterState}
        loading={loading}
        applyFilters={fetchData}
      />


    </div>
  );
};