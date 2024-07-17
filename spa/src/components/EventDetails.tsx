"use client";

import React, { useState, ChangeEvent, useEffect } from 'react';
import { Event, Property } from '@/utils/lib/bookingType';
import format from 'date-fns/format';



interface EditEventFormProps {
    cancelAddEvent: () => void;
    onEditEvent: () => void;
    status?: string,
    selectedEvent?: Event | null
}

const EditEventComponent: React.FC<EditEventFormProps> = ({ cancelAddEvent, onEditEvent, status, selectedEvent }) => {
    const [event, setEvent] = useState<Event>({
        eventName: '',
        calendarIds: {},
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
        deleted: "none"
    });
    useEffect(() => {
        console.log({ selectedEvent });

        selectedEvent ? setEvent(selectedEvent) : null
    }, [])



    return (
        <div className='flex flex-col gap-4'>
            <div className='flex items-center h-[72px]' >
                <span className=" material-symbols-outlined cursor-pointer hover:text-selectedButton" onClick={cancelAddEvent} >arrow_back</span>
                <h1 className='text-lg font-bold leading-6 w-full text-center '>{selectedEvent?.eventId == undefined ? "Create Event" : selectedEvent.eventName}</h1>
                <label onClick={onEditEvent} className='material-symbols-outlined text-2xl !no-underline !text-typo_dark-300 cursor-pointer'>edit</label>

            </div>
            {/* Name  */}
            <div className='w-full'>
                <label className='title'> {event.eventName}</label>
            </div>

            {/* Dates  */}
            <div className='flex flex-col  w-full gap-2'>
                <label className='label_text !font-medium'>Dates</label>
                <div className='flex  items-center pl-4'>
                    {event.startDateTime && <label className='label_text '> {format(new Date(`${event.startDateTime || ''}`), "iii LLL d, hh:mmaa")}  </label>}
                    <span className='label_text'>-</span>
                    {event.endDateTime && <label className='label_text '>{format(new Date(`${event.endDateTime || ''}`), "iii LLL d, hh:mmaa")}  </label>}
                </div>
            </div>
            {/* Numbers  */}
            <div className='flex  flex-wrap'>


                <label className='label_text'><span className='!font-medium'>Number of Guests: </span> {event.numberOfGuests}</label>
            </div>
            {/* Notes  */}
            {event.notes && <div className='flex-col flex gap-2'>
                <label className='label_text !font-medium'>Notes: </label>
                <label className='label_text pl-4'>

                    {event.notes}
                </label>
            </div>}
            {/* Properties  */}
            <div className='flex-col flex gap-2 '>
                <label className='label_text !font-medium'>Properties: </label>
                <div className='flex flex-col gap-2 pl-4'>

                    {event.properties && event.properties.map((p, i) => <label className='label_text' key={`prop-${i}`}>{p}</label>)}
                </div>
            </div>

            {/* Additional services  */}
            <div className='flex-col flex gap-2'>
                <label className='label_text !font-medium'>Additional services: </label>
                <div className='flex flex-col gap-2 pl-4'>
                    {event.djService && <label className='label'>DJ</label>}
                    {event.kitchenService && <label className='label_text'>Kitchen</label>}
                    {event.valetService && <label className='label_text'>Valet</label>}
                    {event.overNightStay && <label className='label_text'>Overnight: {event.overNightGuests}</label>}
                </div>
            </div>

            {/* Costs part */}
            <div className='flex flex-col  gap-2'>
                <label className='label_text  !font-medium '>
                    Costs
                </label>
                <div className='cost-list flex flex-col '>
                    {event.costs.map((cost, index) => (
                        <div className='flex items-center pl-4 justify-between' key={`cost-${index}`}>
                            <label className='label_text !font-medium'>{cost.name}: </label>
                            <label className='label_text'>

                                {cost.amount}
                            </label>

                        </div>
                    ))}

                </div>


            </div>
            {/* Total cost */}
            <div>
                <h3 className='title w-full text-right'>Total : {event.finalCost ? `₹ ${event.finalCost.toLocaleString('en-IN')}` : '₹ 0'} </h3>

            </div>

        </div >
    );
};

export default EditEventComponent;