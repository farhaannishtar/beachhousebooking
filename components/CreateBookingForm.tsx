"use client";

import { createBooking, deleteBooking } from '@/app/api/submit';
import { BookingDB, BookingForm, Event } from '@/utils/lib/bookingType';
import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'
import CreateEventComponent from './CreateEventForm';
import StayFormComponent from './StayForm';
import { EventStaySwitch } from './EventStaySwitch';
import DateTimePickerInput from './DateTimePickerInput/DateTimePickerInput';

enum ShowForm {
    Booking,
    Event
}

interface CreateBookingState {
    form: BookingForm;
    showForm: ShowForm;
}

interface BookingFormProps {
    booking?: BookingForm | undefined;
}

export default function BookingFormComponent({ booking }: BookingFormProps) {
    const [state, setState] = useState<CreateBookingState>(
        {
            form: booking || {
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
                startDateTime: undefined,
                endDateTime: undefined,
                events: [],
                finalCost: 0,
                payments: [],
                refferral: undefined,
            },
            showForm: ShowForm.Booking
        });
    const [isSwitchOn, setIsSwitchOn] = useState<boolean>(false);
    const [textareaHeight, setTextareaHeight] = useState<number>(40);

    useEffect(() => {
        // Calculate the new height based on the length of state.form.notes
        // This is a simplistic calculation: adjust it based on your needs
        const newHeight = Math.min(16, state.form.notes.length / 10 + 40);
        setTextareaHeight(newHeight);
    }, [state.form.notes]);


    const handleSwitchChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setState((prevState) => ({
            showForm: prevState.showForm,
            form: {
                ...prevState.form,
                bookingType: isSwitchOn ? "Stay" : "Event",
            }
        }));
        setIsSwitchOn(!isSwitchOn);
    };


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

    const handleDateChange = (name: string, value: string | null) => {
        setState((prevState) => ({
            showForm: prevState.showForm,
            form: {
                ...prevState.form,
                [name]: value,
            }
        }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const id = await createBooking(state.form);
        router.push(`/protected/booking/${id}`);
    }

    const deleteThis = async () => {
        console.log("deleting")
        await deleteBooking(booking!.bookingId!);
    }

    return (
        <div>
        <form onSubmit={handleSubmit}>
            {state.showForm === ShowForm.Booking && (
                <div>
                    <div className='flex items-center pt-2'>
                        <div className='flex items-center pl-3'>
                            <button
                                className=""
                                onClick={() => router.push('/protected/booking/list')}
                            >
                                <svg width="18" height="16" viewBox="0 0 18 16" fill="#fff" xmlns="http://www.w3.org/2000/svg">
                                    <path id="Vector - 0" fill-rule="evenodd" clip-rule="evenodd" d="M18 8C18 8.41421 17.6642 8.75 17.25 8.75H2.56031L8.03063 14.2194C8.32368 14.5124 8.32368 14.9876 8.03063 15.2806C7.73757 15.5737 7.26243 15.5737 6.96937 15.2806L0.219375 8.53063C0.0785422 8.38995 -0.000590086 8.19906 -0.000590086 8C-0.000590086 7.80094 0.0785422 7.61005 0.219375 7.46937L6.96937 0.719375C7.26243 0.426319 7.73757 0.426319 8.03063 0.719375C8.32368 1.01243 8.32368 1.48757 8.03063 1.78062L2.56031 7.25H17.25C17.6642 7.25 18 7.58579 18 8Z" fill="#0D141C" />
                                </svg>
                            </button>
                        </div>
                        <h1 className='text-lg font-bold leading-6 w-full text-center'>{booking ? booking.client.name : "Create Booking"}</h1>
                    </div>
                    <div className='flex flex-col gap-y-4 mt-6 mx-3'>
                        <label className="form-control w-full max-w-xs">
                            <input
                                type="text"
                                placeholder="Customer Name"
                                className="input w-full max-w-xs bg-inputBoxbg text-black text-base font-normal placeholder:text-placeHolderText placeholder:text-base placeholder:leading-normal placeholder:font-normal"
                                name="name"
                                value={state.form.client.name}
                                onChange={handleClientChange}
                            />
                        </label>
                        <label className="form-control w-full max-w-xs">
                            <input
                                type="text"
                                placeholder="Phone Number"
                                className="input w-full max-w-xs bg-inputBoxbg text-base font-normal placeholder:text-placeHolderText placeholder:text-base placeholder:leading-normal placeholder:font-normal"
                                name="phone"
                                value={state.form.client.phone}
                                onChange={handleClientChange}
                            />
                        </label>
                        <div className='w-full'>
                            <EventStaySwitch handleToggle={handleSwitchChange} isOn={isSwitchOn} />
                        </div>
                        <div className='flex gap-x-3 w-full'>
                            <DateTimePickerInput label={'Start Date'} onChange={handleDateChange} name="startDateTime" value={state.form.startDateTime} />
                            <DateTimePickerInput label={'End Date'} onChange={handleDateChange} name="endDateTime" value={state.form.endDateTime} />
                        </div>
                        <div className='flex gap-x-3'>
                            <div className="w-1/2">
                                <label className="w-full">
                                    {state.form.bookingType === "Event" &&
                                        <div className="relative flex items-center">
                                            <input
                                                type="text"
                                                placeholder="Events"
                                                className="pl-10 pr-3 py-2 w-full border rounded-lg text-base text-center font-normal font-normal placeholder:text-placeHolderText placeholder:text-base placeholder:leading-normal placeholder:font-normal"
                                                name="numberOfEvents"
                                                value={state.form.numberOfEvents}
                                                onChange={handleChange}
                                            />
                                            <svg width="86" height="50" viewBox="0 0 96 56" fill="none" className="absolute left-2 text-gray-700" xmlns="http://www.w3.org/2000/svg">
                                                <g id="Nubers">
                                                    <path id="Vector" d="M11.9107 32L11.0857 35.275C11.0357 35.4917 10.9274 35.6667 10.7607 35.8C10.594 35.9333 10.394 36 10.1607 36C9.84405 36 9.58571 35.875 9.38571 35.625C9.18571 35.375 9.12738 35.1 9.21072 34.8L9.91071 32H7.18572C6.85238 32 6.58571 31.871 6.38571 31.613C6.18571 31.3543 6.12738 31.0667 6.21071 30.75C6.26071 30.5167 6.37738 30.3333 6.56072 30.2C6.74405 30.0667 6.95238 30 7.18572 30H10.4107L11.4107 26H8.68571C8.35238 26 8.08571 25.871 7.88571 25.613C7.68571 25.3543 7.62738 25.0667 7.71072 24.75C7.76072 24.5167 7.87738 24.3333 8.06072 24.2C8.24405 24.0667 8.45238 24 8.68571 24H11.9107L12.7357 20.725C12.7857 20.5083 12.894 20.3333 13.0607 20.2C13.2274 20.0667 13.4274 20 13.6607 20C13.9774 20 14.2357 20.125 14.4357 20.375C14.6357 20.625 14.694 20.9 14.6107 21.2L13.9107 24H17.9107L18.7357 20.725C18.7857 20.5083 18.894 20.3333 19.0607 20.2C19.2274 20.0667 19.4274 20 19.6607 20C19.9774 20 20.2357 20.125 20.4357 20.375C20.6357 20.625 20.694 20.9 20.6107 21.2L19.9107 24H22.6357C22.969 24 23.2357 24.129 23.4357 24.387C23.6357 24.6457 23.694 24.9333 23.6107 25.25C23.5607 25.4833 23.444 25.6667 23.2607 25.8C23.0774 25.9333 22.869 26 22.6357 26H19.4107L18.4107 30H21.1357C21.469 30 21.7357 30.129 21.9357 30.387C22.1357 30.6457 22.194 30.9333 22.1107 31.25C22.0607 31.4833 21.944 31.6667 21.7607 31.8C21.5774 31.9333 21.369 32 21.1357 32H17.9107L17.0857 35.275C17.0357 35.4917 16.9274 35.6667 16.7607 35.8C16.594 35.9333 16.394 36 16.1607 36C15.844 36 15.5857 35.875 15.3857 35.625C15.1857 35.375 15.1274 35.1 15.2107 34.8L15.9107 32H11.9107ZM12.4107 30H16.4107L17.4107 26H13.4107L12.4107 30Z" fill="#676A6C" />
                                                    <path id="Vector_2" d="M41.8647 29H36.913V34H41.8647V29ZM40.8744 18V20H32.9517V18H30.971V20H29.9807C28.8814 20 28.0099 20.9 28.0099 22L28 36C28 37.1 28.8814 38 29.9807 38H43.8454C44.9348 38 45.8261 37.1 45.8261 36V22C45.8261 20.9 44.9348 20 43.8454 20H42.8551V18H40.8744ZM43.8454 36H29.9807V25H43.8454V36Z" fill="#676A6C" />
                                                </g>
                                            </svg>
                                        </div>
                                    }
                                </label>
                            </div>
                            <div className="w-1/2">
                                <label className="w-full">
                                    <div className="relative flex items-center">
                                        <input
                                            type="text"
                                            className="pl-10 pr-3 py-2 w-full border rounded-lg text-base text-center font-normal font-normal placeholder:text-placeHolderText placeholder:text-base placeholder:leading-normal placeholder:font-normal"
                                            placeholder="Guests"
                                            name="numberOfGuests"
                                            value={state.form.numberOfGuests}
                                            onChange={handleChange}
                                        />
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="absolute left-2 h-5 w-5 text-gray-700"
                                            fill="none"
                                            viewBox="0 0 30 20"
                                            stroke="currentColor"
                                        >
                                            <path
                                                d="M20.5146 8.57143C22.7097 8.57143 24.4684 6.65714 24.4684 4.28571C24.4684 1.91429 22.7097 0 20.5146 0C18.3196 0 16.5477 1.91429 16.5477 4.28571C16.5477 6.65714 18.3196 8.57143 20.5146 8.57143ZM9.93613 8.57143C12.1312 8.57143 13.8898 6.65714 13.8898 4.28571C13.8898 1.91429 12.1312 0 9.93613 0C7.74109 0 5.96919 1.91429 5.96919 4.28571C5.96919 6.65714 7.74109 8.57143 9.93613 8.57143ZM9.93613 11.4286C6.85514 11.4286 0.679932 13.1 0.679932 16.4286V20H19.1923V16.4286C19.1923 13.1 13.0171 11.4286 9.93613 11.4286ZM20.5146 11.4286C20.1312 11.4286 19.6948 11.4571 19.232 11.5C20.7659 12.7 21.837 14.3143 21.837 16.4286V20H29.7708V16.4286C29.7708 13.1 23.5956 11.4286 20.5146 11.4286Z"
                                                fill="#676A6C"
                                            />
                                        </svg>
                                    </div>
                                </label>
                            </div>
                        </div>
                        <div>
                            <label>
                                <textarea
                                    name="notes"
                                    value={state.form.notes}
                                    placeholder="Notes"
                                    onChange={handleChange}
                                    className={`textarea w-full text-base h-${textareaHeight} font-normal leading-normal bg-inputBoxbg rounded-xl placeholder:text-placeHolderText placeholder:text-base placeholder:leading-normal placeholder:font-normal`}
                                />
                            </label>
                        </div>
                        <div>
                            <label className='flex pl-20 gap-x-4'>
                                <div className='flex items-center'>
                                    <p className='text-base font-bold leading-normal'>
                                        Status
                                    </p>
                                </div>
                                <select
                                    className="select select-bordered w-full bg-inputBoxbg"
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
                            <label className='flex pl-16 gap-x-4'>
                                <div className='flex items-center'>
                                    <p className='text-base font-bold leading-normal'>
                                        Referral
                                    </p>
                                </div>
                                <select
                                    className="select select-bordered w-full bg-inputBoxbg"
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
                </div >
            )
            }
            {
                state.showForm === ShowForm.Event && (
                    <CreateEventComponent onAddEvent={handleAddEvent} cancelAddEvent={() => handleStateChange(ShowForm.Booking)} />
                )
            }
            <div className='flex items-center justify-center w-full mt-6'>
                <button type="submit" className='btn btn-wide bg-selectedButton text-center text-white text-base font-bold leading-normal'>
                    {booking ? "Update" : "Create"}
                </button>
            </div>
        </form >
            {booking && (
                <div className='flex items-center justify-center w-full mt-6'>
                    <button
                        className='btn btn-wide bg-selectedButton text-center text-white text-base font-bold leading-normal'
                        onClick={() => deleteThis()}
                    >
                        Delete
                    </button>
                </div>
            )}
        </div>
    );
};

