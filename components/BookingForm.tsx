"use client";

import * as yup from 'yup';
import moment from 'moment-timezone';
import { createBooking, deleteBooking } from '@/app/api/submit';
import { Property, BookingForm, Event, defaultForm } from '@/utils/lib/bookingType';
import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'
import CreateEventComponent from './CreateEventForm';
import StayFormComponent from './StayForm';
import { EventStaySwitch } from './EventStaySwitch';
import DateTimePickerInput from './DateTimePickerInput/DateTimePickerInput';
import Properties from './Properties';
import { createClient } from '@/utils/supabase/client';
import BaseInput from './ui/BaseInput';
import BaseInput from './ui/BaseInput';

enum Page {
    BookingPage,
    EventPage
}

interface CreateBookingState {
    form: BookingForm;
    allData: BookingForm[];
    pageToShow: Page;
    currentIndex: number;
}

interface formDataToValidate {
    name: string | undefined;
    phone: string | undefined;
    startDateTime: string | undefined;
}

interface BookingFormProps {
    bookingId?: number | undefined;
}

export default function BookingFormComponent({ bookingId }: BookingFormProps) {
    const router = useRouter();
    const supabase = createClient();
    const [formDataToValidate, setFormDataToValidate] =
        useState<formDataToValidate>({} as formDataToValidate);
    const [formErrors, setFormErrors] = useState({} as formDataToValidate);
    const [isFormSubmitted, setIsFormSubmitted] = useState<boolean>(false);

    useEffect(() => {
        if (bookingId) {
            supabase
                .from("bookings")
                .select()
                .eq("id", bookingId)
                .then(({ data: bookingsData }) => {
                    if (!bookingsData) return;
                    const newData = bookingsData[0].json[bookingsData[0].json.length - 1];
                    setFormState((prevState) => ({
                        ...prevState,
                        form: newData,
                        allData: bookingsData[0].json,
                        currentIndex: bookingsData[0].json.length - 1,
                    }));
                    setIsSwitchOn(newData.bookingType === "Stay" ? false : true);
                });
        }
    }, []);

    const [formState, setFormState] = useState<CreateBookingState>(
        {
            allData: [],
            currentIndex: 0,
            form: defaultForm(),
            pageToShow: Page.BookingPage

        });
    const [EventStaySwitchValue, setIsSwitchOn] = useState<boolean>(formState.form.bookingType === "Stay" ? false : true);
    const [textareaHeight, setTextareaHeight] = useState<number>(40);

    const validateForm = async () => {
        const formDataToValidate = {
            name: formState.form.client.name,
            phone: formState.form.client.phone,
            startDateTime: formState.form.startDateTime,
        };

        try {
            await validationSchema.validate(formDataToValidate, {
                abortEarly: false,
            });
            setFormErrors({
                name: undefined,
                phone: undefined,
                startDateTime: undefined,
            });
            return true;
        } catch (err: Error | any) {
            console.log("err: in validateForm ");
            const validationErrors: any = {};
            err.inner.forEach((error: any) => {
                console.log("error message", error.message);
                validationErrors[error.path] = error.message;
            });
            setFormErrors(validationErrors);
            return false;
        }
    };

    useEffect(() => {
        // Only validate form if it has been submitted at least once
        if (isFormSubmitted) {
            validateForm();
        }
    }, [
        formState.form.client.name,
        formState.form.client.phone,
        formState.form.startDateTime,
        formState.form.endDateTime,
    ]);

    useEffect(() => {
        const newHeight = Math.min(16, formState.form.notes.length / 10 + 40);
        setTextareaHeight(newHeight);
    }, [formState.form.notes]);

    const handleSwitchChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormState((prevState) => ({
            ...prevState,
            form: {
                ...prevState.form,
                bookingType: EventStaySwitchValue ? "Stay" : "Event",
            }
        }));
        setIsSwitchOn(!EventStaySwitchValue);
    };

    const handleAddEvent = (event: Event) => {
        setFormState((prevState) => ({
            ...prevState,
            form: {
                ...prevState.form,
                events: [...prevState.form.events, event],
                finalCost: [...prevState.form.events, event].reduce(
                    (acc, event) => acc + event.finalCost,
                    0
                ),
            },
        }));
    };

    const handleChange = (
        e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        console.log("name: ", name, "value: ", value);
        setFormState((prevState) => ({
            ...prevState,
            form: {
                ...prevState.form,
                [name]: value,
            },
        }));
    };

    const handlePageChange = (showPage: Page) => {
        setFormState((prevState) => ({
            ...prevState,
            pageToShow: showPage
        }));
        console.log(formState.form.events)
    };

    const handleClientChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setFormState((prevState) => ({
            ...prevState,
            form: {
                ...prevState.form,
                client: {
                    ...prevState.form.client,
                    [name]: value,
                },
            },
        }));
    };

    const handleDateChange = (name: string, value: string | null) => {
        setFormState((prevState) => ({
            ...prevState,
            form: {
                ...prevState.form,
                [name]: value,
            },
        }));
    };

    const handlePropertyChange = (property: Property) => {
        setFormState((prevState) => {
            const propertyIndex = prevState.form.properties?.findIndex(
                (p) => p === property
            );
            let newProperties = [...(prevState.form.properties ?? [])];
            if (propertyIndex > -1) {
                newProperties.splice(propertyIndex, 1);
            } else {
                newProperties.push(property);
            }
            return {
                ...prevState,
                form: {
                    ...prevState.form,
                    properties: newProperties,
                },
            };
        });
    };

    const phoneRegExp = /^\+?(?:[0-9] ?){6,14}[0-9]$/;
    const validationSchema = yup.object().shape({
        name: yup
            .string()
            .required("Name is required")
            .min(2, "Name must be at least 2 characters"),
        phone: yup
            .string()
            .required("Phone number is required")
            .matches(phoneRegExp, "Phone number is invalid"),
        startDateTime: yup
            .string()
            .required("Start date and time is required")
            .matches(
                /^\d{4}-[01]\d-[0-3]\d[T][0-2]\d:[0-5]\d:[0-5]\d.\d+Z$/,
                "Start date and time must be in ISO format"
            )
            .test(
                "is-same-or-after-current-date",
                "Start date and time must be the same as or after the current date and time",
                (value) => {
                    if (bookingId) return true;
                    const currentDateEST = moment().tz("America/New_York"); // Get current date in EST, accounting for DST
                    const twentyFourHoursBeforeCurrentDateEST = currentDateEST
                        .clone()
                        .subtract(24, "hours"); // Subtract 24 hours from the current date in EST
                    const startDate = moment(value).tz("America/New_York"); // Convert startDateTime to EST
                    return startDate.isSameOrAfter(twentyFourHoursBeforeCurrentDateEST);
                }
            )
            .test(
                "is-before-end-date",
                "Start date and time must be before the end date and time",
                (value) => {
                    if (typeof formState.form.endDateTime === "undefined") {
                        return true;
                    }
                    const endDate = moment(formState.form.endDateTime);
                    const startDate = moment(value);
                    return startDate.isBefore(endDate);
                }
            ),
    });

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsFormSubmitted(true);
        console.log("validating")
        const isValid = await validateForm();
        if (isValid) {
            console.log("creating")
            const id = await createBooking(formState.form);
            if (!bookingId && id != null && id != "null") {
                // Assuming `id` is the success condition
                router.push(`/protected/booking/${id}`);
            }
        }
    };

    const deleteCurrentBooking = async () => {
        console.log("deleting")
        await deleteBooking(bookingId!);
        router.push('/protected/booking/list')
    }

    return (
        <div>
            <form onSubmit={handleSubmit}>
                {formState.pageToShow === Page.BookingPage && (
                    <div>
                        <div className='flex items-center pt-2'>
                            <div className='flex items-center pl-3'>
                                <button
                                    type="button"
                                    onClick={() => router.push('/protected/booking/list')}
                                >
                                    <svg width="18" height="16" viewBox="0 0 18 16" fill="#fff" xmlns="http://www.w3.org/2000/svg">
                                        <path id="Vector - 0" fillRule="evenodd" clipRule="evenodd" d="M18 8C18 8.41421 17.6642 8.75 17.25 8.75H2.56031L8.03063 14.2194C8.32368 14.5124 8.32368 14.9876 8.03063 15.2806C7.73757 15.5737 7.26243 15.5737 6.96937 15.2806L0.219375 8.53063C0.0785422 8.38995 -0.000590086 8.19906 -0.000590086 8C-0.000590086 7.80094 0.0785422 7.61005 0.219375 7.46937L6.96937 0.719375C7.26243 0.426319 7.73757 0.426319 8.03063 0.719375C8.32368 1.01243 8.32368 1.48757 8.03063 1.78062L2.56031 7.25H17.25C17.6642 7.25 18 7.58579 18 8Z" fill="#0D141C" />
                                    </svg>
                                </button>
                            </div>
                            <h1 className='text-lg font-bold leading-6 w-full text-center'>{bookingId ? formState.form.client.name : "Create Booking"}</h1>
                        </div>
                        <div className='flex flex-col gap-y-4 mt-6 mx-3'>
                            {/* Name Input */}
                            <div className='w-full'>
                                <BaseInput className="flex-1 h-14" type="text" placeholder="Name"
                                    name="name" value={formState.form.client.name}
                                    onChange={handleClientChange} />
                                {formErrors.name &&
                                    <div role="alert" className="text-red-500  p-1 mt-1">
                                        <span>Name is invalid</span>
                                    </div>
                                }
                            </div>
                            {/* Phone Input */}
                            <div className='w-full'>
                                <BaseInput className="flex-1 h-14" type="text" placeholder="Phone Number"
                                    name="phone"
                                    value={formState.form.client.phone}
                                    onChange={handleClientChange} />
                                {formErrors.phone &&
                                    <div role="alert" className="text-red-500 p-1 mt-1">
                                        <span>Phone number is invalid</span>
                                    </div>
                                }
                            </div>
                            <div className='w-full'>
                                <EventStaySwitch handleToggle={handleSwitchChange} isOn={EventStaySwitchValue} />
                            </div>
                            <div className='flex gap-x-2 w-full'>
                                <div className="w-1/2">
                                    <DateTimePickerInput label={'Start Date'} onChange={handleDateChange} name="startDateTime" value={formState.form.startDateTime} />
                                    {formErrors.startDateTime === "Start date and time is required" &&
                                        <div role="alert" className="text-red-500 p-1 mt-1">
                                            <span>Start Date is invalid</span>
                                        </div>
                                    }
                                </div>
                                <div className="w-1/2">
                                    <DateTimePickerInput label={'End Date'} onChange={handleDateChange} name="endDateTime" value={formState.form.endDateTime} />
                                    {formErrors.startDateTime === "Start date and time must be before the end date and time" &&
                                        <div role="alert" className="text-red-500 p-1 mt-1">
                                            <span>End Date is invalid</span>
                                        </div>
                                    }
                                </div>
                            </div>
                            <div className='flex gap-3 flex-wrap'>
                                {formState.form.bookingType === "Event" &&
                                    <BaseInput className="flex-1" preIcon='tag' name="numberOfEvents" placeholder="Events" value={formState.form.numberOfEvents}
                                        onChange={handleChange} />

                                }
                                <BaseInput className="flex-1" type="text" placeholder="Guests"
                                    name="numberOfGuests" preIcon='group' value={formState.form.numberOfGuests}
                                    onChange={handleChange} />

                            </div>
                            <div>
                                <label>
                                    <textarea
                                        name="notes"
                                        value={formState.form.notes}
                                        placeholder="Notes"
                                        onChange={handleChange}
                                        className={`textarea w-full text-base h-${textareaHeight} font-normal leading-normal bg-inputBoxbg rounded-xl placeholder:text-placeHolderText placeholder:text-base placeholder:leading-normal placeholder:font-normal`}
                                    />
                                </label>
                            </div>
                            <Properties properties={formState.form.properties ?? []} handlePropertyChange={handlePropertyChange} />
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
                                        value={formState.form.status}
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
                                        value={formState.form.refferral || ''}
                                        onChange={(e) =>
                                            setFormState((prevState) => ({
                                                ...prevState,
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
                            {/* Inquiry option */}
                            {formState.form.status != "Inquiry" && (
                                <div>
                                    {/* Event option */}
                                    {formState.form.bookingType == "Event" && (
                                        <div className='flex flex-col gap-4'>
                                            <p className='text-base font-bold leading-normal '>
                                                Events
                                            </p>
                                            {formState.form.events.map((event, index) => (
                                                <div key={index} className='flex items-center justify-between rounded-xl bg-typo_light-100 px-4 cursor-pointer'>
                                                    <h3 className='label p-0'>{`${event.eventName}  (${event.numberOfGuests})`}</h3>
                                                    <span className='material-symbols-outlined '>chevron_right</span>
                                                </div>
                                            ))}
                                            <div className='flex items-center justify-center w-full my-5' onClick={() => handlePageChange(Page.EventPage)}>
                                                <button type="submit" className='btn btn-wide bg-selectedButton text-center text-white text-base font-bold leading-normal '>
                                                    Add Event </button>
                                            </div>


                                            <h3 className='title text-right'> Final cost: ${formState.form.finalCost}</h3>


                                        </div>
                                    )}
                                    {/* Stay options */}
                                    {formState.form.bookingType == "Stay" && (
                                        <div>
                                            <h2>Stay form:</h2>
                                            <StayFormComponent status="inquiry" />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div >
                )
                }
                {
                    formState.pageToShow === Page.EventPage && (
                        <CreateEventComponent onAddEvent={handleAddEvent} cancelAddEvent={() => handlePageChange(Page.BookingPage)} status={formState.form.status} />
                    )
                }
                <div className='flex items-center justify-center w-full mt-6'>
                    <button type="submit" className='btn btn-wide bg-selectedButton text-center text-white text-base font-bold leading-normal flex-1'>
                        {bookingId ? "Update" : "Create"}
                    </button>
                </div>
            </form >
            {bookingId && (
                <div className='flex items-center justify-center w-full mt-6'>
                    <button
                        className='btn btn-wide bg-selectedButton text-center text-white text-base font-bold leading-normal'
                        onClick={() => deleteCurrentBooking()}
                    >
                        Delete
                    </button>
                </div>
            )}
        </div>
    );
};

