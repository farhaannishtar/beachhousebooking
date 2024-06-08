"use client";

import { createBooking } from '@/app/api/submit';
import { BookingForm, Event } from '@/utils/lib/bookingType';
import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'
import CreateEventComponent from './CreateEventForm';
import StayFormComponent from './StayForm';

enum ShowForm {
    Booking,
    Event
}


interface CreateBookingState {
    form: BookingForm;
    showForm: ShowForm;
}


const BookingFormComponent: React.FC = () => {
    const [state, setState] = useState<CreateBookingState>(
        {
            form: {
                client: {
                    name: '',
                    phone: '',
                },
                numberOfGuests: 2,
                numberOfEvents: 1,
                paymentMethod: "Cash",
                bookingType: 'Stay',
                notes: '',
                status: 'Inquiry',
                startDateTime: (new Date()).toUTCString(),
                endDateTime: (new Date()).toUTCString(),
                events: [],
                finalCost: 0,
                payments: [],
                refferral: undefined,
            },
            showForm: ShowForm.Booking
        });

    const router = useRouter();
    const searchParams = useSearchParams();


    const handleAddEvent = (event: Event) => {
        setState((prevState) => ({
            showForm: ShowForm.Booking,
            form: {
                ...prevState.form,
                events: [...prevState.form.events, event],
                finalCost: [...prevState.form.events, event].reduce((acc, event) => acc + event.finalCost, 0)
            }
        }));
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setState((prevState) => ({
            showForm: prevState.showForm,
            form: {
                ...prevState.form,
                [name]: value,
            }
        }));
    };

    const handleStateChange = (showForm: ShowForm) => {
        setState((prevState) => ({
            showForm,
            form: prevState.form,
        }));
    };

    const handleClientChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setState((prevState) => ({
            showForm: prevState.showForm,
            form: {
                ...prevState.form,
                client: {
                    ...prevState.form.client,
                    [name]: value,
                }
            }
        }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        await createBooking(state.form);
    };

    return (
        <form onSubmit={handleSubmit}>
            {state.showForm === ShowForm.Booking && (
                <div>
                    <h1 className='text-xl font-bold w-full text-center'>Create Booking</h1>
                    <label className="form-control w-full max-w-xs">
                        <input
                            type="text"
                            placeholder="Customer Name"
                            className="input input-bordered w-full max-w-xs"
                            name="name"
                            value={state.form.client.name}
                            onChange={handleClientChange} 
                        />
                    </label>
                    <label className="form-control w-full max-w-xs">
                        <input
                            type="text"
                            placeholder="Phone Number"
                            className="input input-bordered w-full max-w-xs"
                            name="phone"
                            value={state.form.client.phone}
                            onChange={handleClientChange}
                        />
                    </label>
                    <div>
                        <label>
                            Booking Type:
                            <select
                                name="bookingType"
                                value={state.form.bookingType}
                                onChange={handleChange}
                            >
                                <option value="Stay">Stay</option>
                                <option value="Event">Event</option>
                            </select>
                        </label>
                    </div>

                    <div>
                        <label>
                            Start Date:
                            <input
                                type="date"
                                name="startDateTime"
                                value={state.form.startDateTime}
                                onChange={handleChange}
                            />
                        </label>
                    </div>

                    <div>
                        <label>
                            End Date:
                            <input
                                type="date"
                                name="endDateTime"
                                value={state.form.endDateTime}
                                onChange={handleChange}
                            />
                        </label>
                    </div>


                    <div>
                        <label>
                            Number of events:
                            <input
                                type="text"
                                name="numberOfEvents"
                                value={state.form.numberOfEvents}
                                onChange={handleChange}
                            />
                        </label>
                    </div>
                    <div>
                        <label>
                            Number of guests:
                            <input
                                type="text"
                                name="numberOfGuests"
                                value={state.form.numberOfGuests}
                                onChange={handleChange}
                            />
                        </label>
                    </div>

                    <div>
                        <label>
                            Notes:
                            <textarea
                                name="notes"
                                value={state.form.notes}
                                onChange={handleChange}
                            />
                        </label>
                    </div>
                    <div>
                        <label>
                            Status:
                            <select
                                name="status"
                                value={state.form.status}
                                onChange={handleChange}
                            >
                                <option value="Inquiry">Inquiry</option>
                                <option value="Quotation">Quotation</option>
                                <option value="Booking">Booking</option>
                            </select>
                        </label>
                    </div>

                    <div>
                        <label>
                            Referral:
                            <select
                                name="refferral"
                                value={state.form.refferral || ''}
                                onChange={(e) =>
                                    setState((prevState) => ({
                                        showForm: prevState.showForm,
                                        form: {
                                            ...prevState.form,
                                            refferral: e.target.value,
                                        }
                                    }))
                                }
                            >
                                <option value="">Select</option>
                                <option value="Google">Google</option>
                                <option value="Facebook">Facebook</option>
                                <option value="Instagram">Instagram</option>
                                <option value="Influencer">Influencer</option>
                            </select>
                        </label>
                    </div>

                    {state.form.status != "Inquiry" && (
                        <div>
                            {state.form.bookingType == "Event" && (
                                <div>
                                    <h2>Events:</h2>
                                    {state.form.events.map((event, index) => (
                                        <div key={index}>{event.eventName}</div>
                                    ))}

                                    <button onClick={() => handleStateChange(ShowForm.Event)}>
                                        Add Event
                                    </button>

                                    <label> Final cost: ${state.form.finalCost}</label>


                                </div>
                            )}
                            {state.form.bookingType == "Stay" && (
                                <div>
                                    <h2>Stay form:</h2>
                                    <StayFormComponent />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
            {state.showForm === ShowForm.Event && (
                <CreateEventComponent onAddEvent={handleAddEvent} cancelAddEvent={() => handleStateChange(ShowForm.Booking)} />
            )}
            <button type="submit">Submit</button>
        </form>
    );
};

export default BookingFormComponent;
