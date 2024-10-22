'use client';
import React from 'react';
import Select from 'react-select';
import { Event } from '@/utils/lib/bookingType';
import DateTimePickerInput from './DateTimePickerInput/DateTimePickerInput';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

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
      overNightGuests: 0,
      costs: [],
      finalCost: 0,
      markForDeletion: false
    }])
  };

  const deleteEvent = (index: number, e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    const newEvents = [...events];
    newEvents.splice(index, 1);
    setEvents(newEvents);
  }

  return (
    <div className='flex flex-col gap-4'>
      <Accordion type="single" collapsible className="flex flex-col gap-y-5">
        {events.map((event, index) => (
          <AccordionItem
            key={index} // Add key prop here
            value={`${index}`}
            className='border border-gray-300 rounded-lg shadow-md px-3'
          >
            <AccordionTrigger className="cursor-pointer decoration-0 focus:decoration-0">Event {index + 1} • 14/09 - 14/12 • 32</AccordionTrigger>
            <AccordionContent>
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
                <div className='text-black'>
                  <DateTimePickerInput label={'Start Time'} />
                </div>
                <div>
                  <DateTimePickerInput label={'End Time'} />
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
                  <label className="label_text cursor-pointer">
                    <span className="label-text">Valet Service</span>
                    <input type="checkbox" className="checkbox" />
                  </label>
                </div>
                <div className="form-control">
                  <label className="label_text cursor-pointer">
                    <span className="label-text">Dj Service</span>
                    <input type="checkbox" className="checkbox" />
                  </label>
                </div>
                <div className="form-control">
                  <label className="label_text cursor-pointer">
                    <span className="label-text">Kitchen Service</span>
                    <input type="checkbox" className="checkbox" />
                  </label>
                </div>
                <div className="form-control">
                  <label className="label_text cursor-pointer">
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
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <button type="button" className="btn btn-sm bg-green-500 text-black" onClick={addForm}>+ Add Event</button>
    </div>
  );
}