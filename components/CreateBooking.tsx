"use client";

import { createBooking } from '@/app/api/submit';
import { BookingForm, Event } from '@/utils/lib/bookingType';
import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'
import CreateEventComponent from './CreateEventForm';
import StayFormComponent from './StayForm';
import { EventStaySwitch } from './EventStaySwitch';

enum ShowForm {
    Booking,
    Event
}


interface CreateBookingState {
    form: BookingForm;
    showForm: ShowForm;
}


const BookingFormComponent: React.FC = () => {
    const [isSwitchOn, setIsSwitchOn] = useState(false);

    const handleSwitchChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        console.log("isSwitchOn: ", isSwitchOn);

        setState((prevState) => ({
            showForm: prevState.showForm,
            form: {
                ...prevState.form,
                bookingType: isSwitchOn ? "Stay" : "Event",
            }
        }));
        setIsSwitchOn(!isSwitchOn);
    };

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

    console.log(state)

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
        console.log("name: ", name, "value: ", value);
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
                    <h1 className='text-lg font-bold w-full text-center mt-2'>Create Booking</h1>
                    <div className='flex flex-col gap-y-4 mt-6 mx-3'>
                        <label className="form-control w-full max-w-xs">
                            <input
                                type="text"
                                placeholder="Customer Name"
                                className="input w-full max-w-xs bg-inputBoxbg placeholder:text-placeHolderText placeholder:text-base placeholder:leading-6 placeholder:font-normal"
                                name="name"
                                value={state.form.client.name}
                                onChange={handleClientChange}
                            />
                        </label>
                        <label className="form-control w-full max-w-xs">
                            <input
                                type="text"
                                placeholder="Phone Number"
                                className="input w-full max-w-xs bg-inputBoxbg placeholder:text-placeHolderText placeholder:text-base placeholder:leading-6 placeholder:font-normal"
                                name="phone"
                                value={state.form.client.phone}
                                onChange={handleClientChange}
                            />
                        </label>
                        <div className='w-full mt-2'>
                            <EventStaySwitch handleToggle={handleSwitchChange} isOn={isSwitchOn} />
                        </div>
                        {/* <div>
                            <label>
                                Start Date:
                                <input
                                    type="date"
                                    name="startDateTime"
                                    value={state.form.startDateTime}
                                    onChange={handleChange}
                                />
                            </label>
                        </div> */}
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
