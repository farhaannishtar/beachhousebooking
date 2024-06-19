"use client";

import React, { useState, ChangeEvent, FormEvent } from 'react';
import { Event, Property } from '@/utils/lib/bookingType';
import BaseInput from './ui/BaseInput';
import DateTimePickerInput from './DateTimePickerInput/DateTimePickerInput';
import Properties from './Properties';
import ToggleButton from './ui/ToggleButton';

const properties = Object.values(Property)

interface CreateEventFormProps {
    onAddEvent: (event: Event) => void;
    cancelAddEvent: () => void;
    status?: string
}

const CreateEventComponent: React.FC<CreateEventFormProps> = ({ onAddEvent, cancelAddEvent, status }) => {
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


    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, type, checked, value } = e.target as HTMLInputElement;
        console.log({ name, type, checked, value })
        if (["djService", "kitchenService", "valetService", "overNightStay"].includes(name)) {
            setEvent((prevEvent) => ({
                ...prevEvent,
                [name]: checked,
            }));
        } else {
            setEvent((prevEvent) => ({
                ...prevEvent,
                [name]: value,
            }));
        }
    };

    const handleCheckboxChange = (property: Property) => {
        let updatedValues = [...event.properties];
        if (updatedValues.includes(property)) {
            updatedValues = updatedValues.filter((item) => item !== property);
        } else {
            updatedValues.push(property);
        }
        setEvent((prevEvent) => ({
            ...prevEvent,
            properties: updatedValues
        }));
    };

    const handleCostsChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const updatedCosts = [...event.costs];
        updatedCosts[index] = {
            ...updatedCosts[index],
            [name]: name === 'amount' ? parseFloat(value) : value,
        };
        setEvent((prevEvent) => ({
            ...prevEvent,
            costs: updatedCosts,
            finalCost: updatedCosts.reduce((acc, cost) => acc + cost.amount, 0)
        }));
    };

    const addCost = () => {
        let newCosts = event.costs
        newCosts.push({ name: "", amount: 0 })
        setEvent((prevEvent) => ({
            ...prevEvent,
            costs: newCosts
        }));  
    };

    const handleDateChange = (name: string, value: string | null) => {
        setEvent((prevEvent) => ({
            ...prevEvent,
            [name]: value,
        }));
    };

    const removeEventCost = (costIndex: number) => {
        const updatedCosts = event.costs.filter((_, i) => i !== costIndex)
        setEvent((prevEvent) => ({
            ...prevEvent,
            costs: updatedCosts,
            finalCost: updatedCosts.reduce((acc, cost) => acc + cost.amount, 0)
        }));
    }
    return (
        <div className='flex flex-col gap-4'>
            <div className='flex items-center h-[72px]' >
                <span className=" material-symbols-outlined cursor-pointer hover:text-selectedButton" onClick={cancelAddEvent} >arrow_back</span>
                <h1 className='text-lg font-bold leading-6 w-full text-center '>Create Event</h1>
            </div>
            {/* name and number */}
            <div className='flex items-center gap-3'>
                <BaseInput type="text"
                    name="eventName"
                    value={event.eventName}
                    onChange={handleChange} className='flex-1'
                    placeholder='Event Name'
                />
                <BaseInput
                    preIcon='group'
                    type="number"
                    name="numberOfGuests"
                    value={event.numberOfGuests}
                    onChange={handleChange}
                    className='w-28' />
            </div>
            {/* Start and End  Date */}
            <div className='flex gap-x-2 w-full'>
                <div className="w-1/2">
                    <DateTimePickerInput label={'Start Date'} 
                        name="startDateTime"
                        value={event.startDateTime}
                        onChange={handleDateChange} />

                </div>
                <div className="w-1/2">
                    <DateTimePickerInput label={'End Date'} 
                        name="endDateTime"
                        value={event.endDateTime}
                        onChange={handleDateChange} />

                </div>
            </div>
            {/* Notes input */}
            <div>
                <label>
                    <textarea
                        name="notes"
                        value={event.notes}
                        onChange={handleChange}
                        placeholder="Notes"

                        className={`textarea w-full text-base h-28 font-normal leading-normal bg-inputBoxbg rounded-xl placeholder:text-placeHolderText placeholder:text-base placeholder:leading-normal placeholder:font-normal`}
                    />
                </label>
            </div>

            <Properties properties={event.properties ?? []} handlePropertyChange={handleCheckboxChange} />
            {/* Toggle buttons group */}
            <p className='text-base font-bold leading-normal my-4'>
                Additional services
            </p>
            <div className='flex gap-4 flex-wrap items-center'>
                <ToggleButton name="djService"
                    checked={event.djService}
                    onChange={handleChange}
                    label="DJ" />
                <ToggleButton
                    name="kitchenService"
                    checked={event.kitchenService}
                    onChange={handleChange}
                    label="Kitchen" />
                <ToggleButton
                    name="valetService"
                    checked={event.valetService}
                    onChange={handleChange}
                    label="Valet" />
                <ToggleButton
                    name="overNightStay"
                    checked={event.overNightStay}
                    onChange={handleChange}
                    label="Overnight" />
                {event.overNightStay && (
                    <BaseInput
                        type="number"
                        name="overNightGuests"
                        value={event.overNightGuests}
                        onChange={handleChange}
                        preIcon='group'
                        className='w-24 h-10 pr-2'
                    />
                )}

            </div>
            {/* Costs part */}
            <div className='flex flex-col gap-4'>
                <p className='text-base font-bold leading-normal my-4'>
                    Costs
                </p>
                <div className='cost-list flex flex-col gap-4'>
                    {event.costs.map((cost, index) => (
                        <div className='flex items-center gap-4 ' key={index}>
                            <BaseInput type="text"
                                name="name"
                                value={cost.name}
                                onChange={(e) => handleCostsChange(index, e)}
                                placeholder="Type of Expense"
                                className='flex-1'
                            />
                            <BaseInput type="number"
                                name="amount"
                                value={cost.amount}
                                onChange={(e) => handleCostsChange(index, e)}
                                placeholder="Cost"
                                className='flex-1 pr-3' />
                            <span className=" material-symbols-outlined cursor-pointer hover:text-red-500" onClick={() => { removeEventCost(index) }} >delete</span>
                        </div>
                    ))}

                </div>
                <div className='flex items-center justify-end'>
                    <button onClick={addCost} className='bg-typo_light-100 text-center rounded-xl py-2 px-6 title w-20'>+</button>
                </div>
                <h3 className='title w-full text-right'>Total : {event.finalCost ? `$ ${event.finalCost}` : '$ 0'} </h3>

            </div>
            <div className='flex items-center justify-end gap-4 flex-wrap'>

                <button className='border-2 border-typo_dark-100 rounded-xl h-12 px-6 text-typo_dark-100 w-full title' onClick={() => cancelAddEvent()}>
                    Cancel
                </button>
                <button className='border-2 rounded-xl h-12 px-6 text-white bg-selectedButton w-full title' onClick={() => { onAddEvent(event); cancelAddEvent() }}>
                    Create event
                </button>
            </div>

        </div >
    );
};

export default CreateEventComponent;
