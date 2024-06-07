'use client';
import React from 'react';
import Select from 'react-select';
import { Event } from '@/utils/lib/bookingType';
import { deleteEvent } from '@/utils/lib/calendar';

export default function EventForm({ events, setEvents }: { events: Event[], setEvents: React.Dispatch<React.SetStateAction<Event[]>> }) {
  const propertyOptions = [
    { value: 'Bluehouse', label: 'Blue House' },
    { value: 'Meadowlane', label: 'Meadowlane' },
    { value: 'LeChalet', label: 'Le Chalet' },
    { value: 'ArmatiVilla', label: 'ArmatiVilla' },
  ];

  const addForm = () => {
    setEvents([...events, {
      eventName: '',
      notes: '',
      startDateTime: '',
      endDateTime: '',
      numberOfGuests: 0,
      properties: [],
      valetService: false,
      djService: false,
      kitchenService: false,
      overNightStay: false,
      overNightGuests: 0
    }])
  };

  const deleteEvent = (index: number, e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    console.log('index', index)
    console.log('event name', events[index].eventName)
    e.preventDefault();
    const newEvents = [...events];
    newEvents.splice(index, 1);
    setEvents(newEvents);
  }

  return (
    <div className='flex flex-col gap-4'>
      {events.map((event, index) => (
        <div className='flex flex-col gap-y-6' key={index}>
          <div className='flex flex-col gap-y-6'>
            <input
              type="text" value={event.eventName}
              className="input input-bordered input-md w-full max-w-xs"
              placeholder="Event Name"
              onChange={(e) => {
                const newEvents = [...events];
                newEvents[index].eventName = e.target.value;
                setEvents(newEvents);
              }}
            />
          </div>
          <textarea className="textarea textarea-bordered" placeholder="Notes" />
          <div className="relative w-1/2 max-w-xs">
            <input
              type="text"
              className="w-1/2 input input-bordered input-md w-full max-w-xs"
              placeholder="Start Time" />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
              </svg>
            </div>
          </div>
          <div className="relative w-1/2 max-w-xs">
            <input
              type="text"
              className="w-1/2 input input-bordered input-md w-full max-w-xs"
              placeholder="End Time" />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
              </svg>
            </div>
          </div>
          <input
            type="text"
            className="input input-bordered input-md w-full max-w-xs w-1/2"
            placeholder="Number of Guests" />
          <div>
            <label className="flex items-center gap-2">
              Properties: (Select all that apply)
            </label>
            <Select
              isMulti
              name="properties"
              options={propertyOptions}
              className="basic-multi-select text-black"
              classNamePrefix="select"
            />
          </div>
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Valet Service</span>
              <input type="checkbox" className="checkbox" />
            </label>
          </div>
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Dj Service</span>
              <input type="checkbox" className="checkbox" />
            </label>
          </div>
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Kitchen Service</span>
              <input type="checkbox" className="checkbox" />
            </label>
          </div>
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Overnight stay</span>
              <input type="checkbox" className="checkbox" />
            </label>
          </div>
          <input
            type="text"
            className="input input-bordered input-md w-full max-w-xs w-1/2"
            placeholder="Number of Overnight Guests" />
          <button
            onClick={(e) => deleteEvent(index, e)}
            className="btn btn-sm bg-red-500 text-black">
            Delete Event
          </button>
        </div>
      ))}
      <button type="button" className="btn btn-sm bg-green-500 text-black" onClick={addForm}>+ Add Event</button>
    </div>
  );
}