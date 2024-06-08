"use client";

import React, { useState, ChangeEvent, FormEvent } from 'react';
import { Event, Property } from '@/utils/lib/bookingType';

const properties = Object.values(Property)

interface CreateEventFormProps {
    onAddEvent: (event: Event) => void;
    cancelAddEvent: () => void;
}

const CreateEventComponent: React.FC<CreateEventFormProps> = ({ onAddEvent, cancelAddEvent }) => {
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
        newCosts.push({name: "", amount: 0})
        setEvent((prevEvent) => ({
            ...prevEvent,
            costs: newCosts
        }));
        
    };

    return (
        <div>
            <h1 className='text-xl font-bold w-full text-center'>Create Event</h1>
            <div>
                <label>
                    Event Name:
                    <input
                        type="text"
                        name="eventName"
                        value={event.eventName}
                        onChange={handleChange}
                    />
                </label>
            </div>
            <div>
                <label>
                    Number of Guests:
                    <input
                        type="number"
                        name="numberOfGuests"
                        value={event.numberOfGuests}
                        onChange={handleChange}
                    />
                </label>
            </div>
            <div>
                <label>
                    Start DateTime:
                    <input
                        type="datetime-local"
                        name="startDateTime"
                        value={event.startDateTime}
                        onChange={handleChange}
                    />
                </label>
            </div>
            <div>
                <label>
                    End DateTime:
                    <input
                        type="datetime-local"
                        name="endDateTime"
                        value={event.endDateTime}
                        onChange={handleChange}
                    />
                </label>
            </div>
            <div>
                <label>
                    Notes:
                    <textarea
                        name="notes"
                        value={event.notes}
                        onChange={handleChange}
                    />
                </label>
            </div>

            <div>
                <label>Select properties:</label>
                {properties.map((property) => (
                    <div key={property}>
                        <input
                            type="checkbox"
                            id={property}
                            value={property}
                            checked={event.properties.includes(property)}
                            onChange={() => handleCheckboxChange(property)}
                        />
                        <label htmlFor={property}>{property}</label>
                    </div>
                ))}
            </div>

            <div>
                <label>
                    DJ:
                    <input
                        type="checkbox"
                        name="djService"
                        checked={event.djService}
                        onChange={handleChange}
                    />
                </label>
            </div>

            <div>
                <label>
                    Kitchen:
                    <input
                        type="checkbox"
                        name="kitchenService"
                        checked={event.kitchenService}
                        onChange={handleChange}
                    />
                </label>
            </div>

            <div>
                <label>
                    Valet:
                    <input
                        type="checkbox"
                        name="valetService"
                        checked={event.valetService}
                        onChange={handleChange}
                    />
                </label>
            </div>

            <div>
                <label>
                    Overnight:
                    <input
                        type="checkbox"
                        name="overNightStay"
                        checked={event.overNightStay}
                        onChange={handleChange}
                    />
                </label>

                {event.overNightStay && (
                    <input
                        type="number"
                        name="overNightGuests"
                        value={event.overNightGuests}
                        onChange={handleChange}
                    />
                )}
            </div>

            <div>
                <h1>Costs</h1>
                <ul>
                    {event.costs.map((cost, index) => (
                        <li key={index}>
                            <input
                                type="text"
                                name="name"
                                value={cost.name}
                                onChange={(e) => handleCostsChange(index, e)}
                                placeholder="Name"
                            />
                            <input
                                type="number"
                                name="amount"
                                value={cost.amount}
                                onChange={(e) => handleCostsChange(index, e)}
                                placeholder="Amount"
                            />
                        </li>
                    ))}
                </ul>
                <button onClick={addCost}>+</button>
                <label> Final cost: ${event.finalCost}</label>
            </div>

            <button onClick={() => onAddEvent(event)}>
                Add
            </button>
            <button onClick={() => cancelAddEvent()}>
                Cancel
            </button>
        </div>
    );
};

export default CreateEventComponent;
