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
                bookingType: 'Stay',
                notes: '',
                status: 'Inquiry',
                followUpDate: '',
                events: [],
                costs: [],
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
                    <div>
                        <label>
                            Client Name:
                            <input
                                type="text"
                                name="name"
                                value={state.form.client.name}
                                onChange={handleClientChange}
                            />
                        </label>
                    </div>
                    <div>
                        <label>
                            Client Phone:
                            <input
                                type="text"
                                name="phone"
                                value={state.form.client.phone}
                                onChange={handleClientChange}
                            />
                        </label>
                    </div>
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
                            Follow Up Date:
                            <input
                                type="date"
                                name="followUpDate"
                                value={state.form.followUpDate}
                                onChange={handleChange}
                            />
                        </label>
                    </div>
                    {/* Add fields for events, costs, payments, etc. as needed */}
                    <div>
                        <label>
                            Final Cost:
                            <input
                                type="number"
                                name="finalCost"
                                value={state.form.finalCost}
                                onChange={handleChange}
                            />
                        </label>
                    </div>
                    <div>
                <label>
                    Referral:
                    <select
                        name="refferral"
                        // value={form.refferral?.type || ''}
                        // onChange={(e) =>
                        //     setForm((prevForm) => ({
                        //         ...prevForm,
                        //         refferral: { type: e.target.value },
                        //     }))
                        // }
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
