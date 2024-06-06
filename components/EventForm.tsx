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
            <label className="flex items-center gap-2">
              Name of Event/Stay:
            </label>
            <input type="text" value={event.eventName} className="mb-3 input input-bordered input-md w-full max-w-xs" placeholder=""
              onChange={(e) => {
                const newEvents = [...events];
                newEvents[index].eventName = e.target.value;
                setEvents(newEvents);
              }}
            />
          </div>
          <label className="flex items-start gap-2">
            Notes:
            <textarea className="grow" placeholder="" />
          </label>
          <label className="flex items-center gap-2">
            Start Time:
            <input type="text" className="w-1/2 input input-bordered input-md w-full max-w-xs" placeholder="" />
          </label>
          <label className="flex items-center gap-2">
            End Time:
            <input type="text" className="input input-bordered input-md w-full max-w-xs w-1/2" placeholder="" />
          </label>
          <label className="flex items-center gap-2">
            Number of Guests:
            <input type="text" className="input input-bordered input-md w-full max-w-xs w-1/2" placeholder="" />
          </label>
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
          <label className="flex items-center gap-2">
            Valet Service
            <select className="grow py-1">
              <option value="">Select</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </label>
          <label className="flex items-center gap-2">
            DJ Service
            <select className="grow py-1">
              <option value="">Select</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </label>
          <label className="flex items-center gap-2">
            Kitchen Service
            <select className="grow py-1">
              <option value="">Select</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </label>
          <label className="flex items-center gap-2">
            Overnight stay
            <select className="grow py-1">
              <option value="">Select</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </label>
          <label className="flex items-center gap-2">
            Number of Overnight Guests:
            <input type="text" className="input input-bordered input-md w-full w-1/6" placeholder="" />
          </label>
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