"use client";

import { BookingDB, BookingForm, Event } from '@/utils/lib/bookingType';
import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation'

interface BookingProps {
  bookingsFromParent: BookingDB[];
}

interface ListBookingsState {
  searchText: string | null;
  date: Date | null;
  bookings: BookingDB[];
}

export default function ListBooking({ bookingsFromParent }: BookingProps) {

  const router = useRouter();
  const [state, setState] = useState<ListBookingsState>({
    searchText: null,
    date: null,
    bookings: bookingsFromParent,
  });

  const handleChangeSearch = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    console.log("name: ", name, "value: ", value);
    setState((prevState) => ({
      ...prevState,
      searchText: value,
      bookings: bookingsFromParent.filter((booking) => {
        return booking.client.name.toLowerCase().includes(value.toLowerCase()) || booking.client.phone.includes(value);
      })
    }));
  };

  return (
    <div className="mx-2">
      <div className='flex'>
        <h1 className='text-lg font-bold leading-6 w-full text-center mt-3'>Bookings</h1>
        <div className='flex items-center'>
          <button
            className="btn btn-sm bg-selectedButton text-white"
            onClick={() => router.push('/protected/booking/create')}
          >+</button>
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
          {/* <FilterButtonAndModal /> */}
        </div>
      </div>
      <p className="pl-1 mt-6 text-neutral-900 text-lg font-semibold leading-6">
        Today
      </p>


      {state.bookings?.map((booking) => (
        <div className="flex mt-3 w-full justify-between">
          <div className="pl-3">
            <p>
              <span className="text-neutral-900 text-base font-medium leading-6">{booking.client.name}</span> <span className="text-slate-500 text-sm font-normal leading-5">Inquiry</span>
            </p>
            <section>
              <p className="text-slate-500 text-sm font-normal leading-5">3 days, 200 pax</p>
              <p className="text-slate-500 text-sm font-normal leading-5">Bluehouse, Le Chalet, Glasshouse</p>
              <p className="text-slate-500 text-sm font-normal leading-5">Referral: Google</p>
            </section>
          </div>
          <div className="w-[84px] flex items-center">
            <div className="w-[84px] h-9 px-5 bg-gray-100 rounded-[19px] justify-center items-center inline-flex items-center">
              <div className="w-11 left-[20px] top-[6px] text-center text-sky-500 text-base font-medium leading-normal">
                Event
              </div>
            </div>
          </div>
        </div>
      ))}

    </div>
  );
};



// <div>
//     <input
//         type="text"
//         placeholder="Search"

//     />
//     <ul>
//         {state.bookings?.map((booking) => (
//             <li key={booking.bookingId}>{booking.bookingId} {booking.client.name}</li>
//         ))}
//     </ul>
// </div>