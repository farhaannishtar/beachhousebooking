"use client";

import React, { useState, ChangeEvent, FormEvent } from 'react';
import { Event } from '@/utils/lib/bookingType';


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
    });


    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEvent((prevEvent) => ({
            ...prevEvent,
            [name]: value,
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
                    Notes:
                    <textarea
                        name="notes"
                        value={event.notes}
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
                    Number of Guests:
                    <input
                        type="number"
                        name="numberOfGuests"
                        value={event.numberOfGuests}
                        onChange={handleChange}
                    />
                </label>
            </div>
            {/* Add fields for other properties as needed */}
            <button type="submit" onClick={() => onAddEvent(event)}>
                Add
            </button>
            <button type="submit" onClick={() => cancelAddEvent()}>
                Cancel
            </button>
        </div>
    );
};

export default CreateEventComponent;
