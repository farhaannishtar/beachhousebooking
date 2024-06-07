'use client';
import { SubmitButton } from '@/app/login/submit-button';
import React, { useState } from 'react';
import EventForm from './EventForm';
import { BookingForm, Event, Cost, Payment } from '@/utils/lib/bookingType';

// const initialFormState: BookingForm = {
//   client: {
//     name: '',
//     phone: ''
//   },
//   bookerName: '',
//   bookingType: 'Stay',
//   paymentMethod: '',
//   notes: '',
//   status: 'Pending',
//   followUpDate: '',
//   events: [],
//   costs: [],
//   finalCost: 0,
//   payments: []
// };


export default function Form({ onSubmit }: any) {
  const [events, setEvents] = useState<Event[]>([]);
  
  // new functiom 
  // append event data to the form
  // and then call onSubmit
  const handleSubmit = (formData: FormData) => {

  }

  return (
    <form>
      <div className='flex flex-col gap-3 mb-6 w-full'>
        <label className="flex items-center gap-2">
          Client Name:
          <input type="text" name="clientName" className="grow" placeholder="" />
        </label>
        <label className="flex items-center gap-2">
          Phone Number:
          <input type="text" name="clientPhoneNumber" className="grow" placeholder="" />
        </label>
        <label className="flex items-center gap-2">
          Name of Booker:
          <input type="text" name="bookerName" className="w-1/2" placeholder="" />
        </label>
        <label className="flex items-center gap-2">
          Type of Booking:
          <select className="grow py-1" name="bookingType">
            <option value="">Select...</option>
            <option value="Stay">Stay</option>
            <option value="Event">Event</option>
          </select>
        </label>
        <label className="flex items-start gap-2">
          Notes:
          <textarea name="notes" className="grow" placeholder="" />
        </label>
        <label className="flex items-center gap-2">
          Status:
          <select name="bookingStatus" className="grow py-1">
            <option value="">Select...</option>
            <option value="Inquiry">Inquiry</option>
            <option value="Booking">Booking</option>
          </select>
        </label>
        <label className="flex items-center gap-2 mb-2">
          Follow up Date:
          <input type="text" name="followUpDate" className="w-1/2" placeholder="" />
        </label>
        <label className="flex items-center gap-2">
          Event Details
        </label>
        <div className='flex flex-col gap-3 mx-1'>
          <EventForm events={events} setEvents={setEvents} />
        </div>
      </div>
      <label className="flex items-center gap-2">
        Payment Method:
        <input type="text" name="paymentMethod" className="w-1/2" placeholder="" />
      </label>
      <div className='flex w-full justify-center'>
        <SubmitButton
          formAction={handleSubmit}
          className="border border-foreground/20 rounded-md px-4 py-2 text-foreground mb-2 w-1/2 px-4 "
          pendingText="Creating Booking..."
        >
          Create Booking
        </SubmitButton>
      </div>
    </form>)
}