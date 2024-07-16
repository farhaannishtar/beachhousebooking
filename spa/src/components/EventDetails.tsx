"use client";

import React, { useState, ChangeEvent, useEffect } from 'react';
import { Event, Property } from '@/utils/lib/bookingType';



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
        finalCost: 0
    });
    useEffect(() => {
        console.log({ selectedEvent });

        selectedEvent ? setEvent(selectedEvent) : null
    }, [])



    return (
        <div className='flex flex-col gap-2'>
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
            <div className='flex flex-col  w-full'>
                <label className='label !font-semibold'>Dates</label>
                <label className='label pl-4'>{event.startDateTime} -</label>
                <label className='label pl-4'>{event.endDateTime}</label>
            </div>
            {/* Numbers  */}
            <div className='flex  flex-wrap'>


                <label className='label'><span className='!font-semibold'>Number of Guests: </span> {event.numberOfGuests}</label>
            </div>
            {/* Notes  */}
            <div className='flex-col '>
                <label className='label !font-semibold'>Notes: </label>
                <label className='label pl-4'>

                    {event.notes}
                </label>
            </div>
            {/* Properties  */}
            <div className='flex-col '>
                <label className='label !font-semibold'>Properties: </label>
                <div className='flex flex-col gap-2 pl-4'>

                    {event.properties && event.properties.map((p,i) => <label className='label' key={`prop-${i}`}>{p}</label>)}
                </div>
            </div>

            {/* Additional services  */}
            <div className='flex-col '>
                <label className='label !font-semibold'>Additional services: </label>
                <div className='flex flex-col gap-2 pl-4'>
                    {event.djService && <label className='label'>DJ</label>}
                    {event.kitchenService && <label className='label'>Kitchen</label>}
                    {event.valetService && <label className='label'>Valet</label>}
                    {event.overNightStay && <label className='label'>Overnight: {event.overNightGuests}</label>}
                </div>
            </div>

            {/* Costs part */}
            <div className='flex flex-col '>
                <label className='label  !font-semibold '>
                    Costs
                </label>
                <div className='cost-list flex flex-col '>
                    {event.costs.map((cost, index) => (
                        <div className='flex items-center pl-4 ' key={`cost-${index}`}>
                            <label className='label !font-semibold'>{cost.name}: </label>
                            <label className='label'>

                                {cost.amount}
                            </label>

                        </div>
                    ))}

                </div>

                <h3 className='title w-full text-right'>Total : {event.finalCost ? `₹ ${event.finalCost.toLocaleString('en-IN')}` : '₹ 0'} </h3>

            </div>


        </div >
    );
};

export default EditEventComponent;