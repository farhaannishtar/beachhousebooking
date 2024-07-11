"use client";

import * as yup from 'yup';
import moment from 'moment-timezone';
import { BookingForm, Event, defaultForm, BookingDB, printInIndianTime } from '@/utils/lib/bookingType';
import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import EventDetailsComponent from './EventDetails';
import CreateEventComponent from './CreateEventForm';

import { supabase } from '@/utils/supabase/client';
import Link from 'next/link';

enum Page {
    BookingPage,
    EventPage,
    EventEdit
}

export interface CreateBookingState {
    form: BookingForm;
    bookingDB?: BookingDB | undefined;
    allData: BookingDB[];
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
    const searchParams = useSearchParams()
    const returnTo = searchParams.get('returnTo')
    const [formErrors, setFormErrors] = useState({} as formDataToValidate);
    const [isFormSubmitted, setIsFormSubmitted] = useState<boolean>(false);
    const pathname = usePathname()
    useEffect(() => {
        if (bookingId) {
            supabase
                .from("bookings")
                .select()
                .eq("id", bookingId)
                .then(({ data: bookingsData }) => {
                    if (!bookingsData) return;
                    const currentIndex = bookingsData[0].json.length - 1;
                    const newData = bookingsData[0].json[currentIndex];
                    setFormState((prevState) => ({
                        ...prevState,
                        form: newData,
                        bookingDB: newData,
                        allData: bookingsData[0].json,
                        currentIndex: currentIndex,
                    }));
                    setIsSwitchOn(newData.bookingType === "Stay" ? false : true);
                });
        }
    }, []);

    function moveFormState(direction: "next" | "previous") {
        if (direction === "next") {
            if (formState.currentIndex === formState.allData.length - 1) return;
            console.log("next ", "index: ", formState.currentIndex + 1)
            setFormState((prevState) => ({
                ...prevState,
                form: prevState.allData[prevState.currentIndex + 1],
                bookingDB: prevState.allData[prevState.currentIndex + 1],
                currentIndex: prevState.currentIndex + 1,
            }));
        } else {
            if (formState.currentIndex === 0) return;
            console.log("prev ", "index: ", formState.currentIndex - 1)
            setFormState((prevState) => ({
                ...prevState,
                form: prevState.allData[prevState.currentIndex - 1],
                bookingDB: prevState.allData[prevState.currentIndex - 1],
                currentIndex: prevState.currentIndex - 1,
            }));
        }
    }

    const [formState, setFormState] = useState<CreateBookingState>(
        {
            allData: [],
            currentIndex: 0,
            form: defaultForm(),
            pageToShow: Page.BookingPage

        });
    const [EventStaySwitchValue, setIsSwitchOn] = useState<boolean>(formState.form.bookingType === "Stay" ? false : true);
    const [textareaHeight, setTextareaHeight] = useState<number>(120);

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
        let numberOfNewlines = (formState.form.notes.match(/\n/g) || []).length + 1;
        const newHeight = Math.ceil(numberOfNewlines * 26); //formState.form.notes.length / 41) * 28 +
        setTextareaHeight(Math.max(120, newHeight));

    }, [formState.form.notes]);


    //********************** Event Params and methods **********************
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

    const handleAddEvent = (event: Event) => {
        setFormState((prevState) => {
            let events = [...prevState.form.events];
            if (event.eventId == null) {
                event.eventId = Math.floor(Math.random() * 1000000);
                events.push(event);
            } else {
                events = events.map((e) => e.eventId === event.eventId ? event : e);
            }
            let totalCost = events.reduce(
                (acc, event) => acc + event.finalCost,
                0
            )
            return (
                {
                    ...prevState,
                    form: {
                        ...prevState.form,
                        events: events,
                        totalCost: totalCost,
                        outstanding: totalCost - prevState.form.paid
                    },
                }
            )
        }
        );
    };
    //**********************End Events settings **********************


    const handlePageChange = (showPage: Page) => {
        setFormState((prevState) => ({
            ...prevState,
            pageToShow: showPage
        }));
        console.log(formState.form.events)
    };


    const phoneRegExp = /^\+?(?:[0-9]\s?){6,14}[0-9]$/;
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




    return (
        <div>
            <div className='mb-6'>
                {formState.pageToShow === Page.BookingPage && (
                    <div>
                        <div className='flex items-center pt-2 justify-between'>
                            <div className='flex items-center '>
                                <button
                                    type="button"
                                    onClick={() => {
                                        console.log(searchParams);

                                        if (returnTo) {
                                            bookingId ? router.push(`${returnTo}#${bookingId}-id`) : router.push(`${returnTo}`)
                                        } else {
                                            router.back()
                                        }

                                    }}
                                >
                                    <svg width="18" height="16" viewBox="0 0 18 16" fill="#fff" xmlns="http://www.w3.org/2000/svg">
                                        <path id="Vector - 0" fillRule="evenodd" clipRule="evenodd" d="M18 8C18 8.41421 17.6642 8.75 17.25 8.75H2.56031L8.03063 14.2194C8.32368 14.5124 8.32368 14.9876 8.03063 15.2806C7.73757 15.5737 7.26243 15.5737 6.96937 15.2806L0.219375 8.53063C0.0785422 8.38995 -0.000590086 8.19906 -0.000590086 8C-0.000590086 7.80094 0.0785422 7.61005 0.219375 7.46937L6.96937 0.719375C7.26243 0.426319 7.73757 0.426319 8.03063 0.719375C8.32368 1.01243 8.32368 1.48757 8.03063 1.78062L2.56031 7.25H17.25C17.6642 7.25 18 7.58579 18 8Z" fill="#0D141C" />
                                    </svg>
                                </button>
                            </div>
                            <h1 className='text-lg font-bold leading-6 w-full text-center'>{bookingId ? formState.form.client.name : "Create Booking"}</h1>
                            <Link href={`${pathname}/edit`} className='material-symbols-outlined text-2xl !no-underline !text-typo_dark-300'>edit</Link>
                        </div>
                        <div className='flex flex-col gap-y-4 mt-6 '>
                            {/* Name  */}
                            <div className='w-full'>
                                <label className='title'> {formState.form.client.name}</label>
                            </div>
                            {/* Phone  */}
                            <div className='w-full'>
                                <label className='label'>{formState.form.client.phone}</label>
                            </div>
                            {/* Dates  */}
                            <div className='flex flex-col gap-3 w-full'>
                                <label className='label !font-semibold'>Dates</label>
                                <label className='label '>{formState.form.startDateTime} -</label>
                                <label className='label '>{formState.form.startDateTime}</label>
                            </div>
                            {/* Numbers  */}
                            <div className='flex gap-3 flex-wrap'>

                                {formState.form.bookingType === "Event" &&
                                    <label className='label'><span className='!font-semibold'>Number of Events: </span> {formState.form.numberOfEvents}</label>
                                }
                                <label className='label'><span className='!font-semibold'>Number of Guests: </span> {formState.form.numberOfGuests}</label>
                            </div>
                            {/* Notes  */}
                            <div className='flex-col gap-3'>
                                <label className='label !font-semibold'>Notes: </label>
                                <label className='label'>

                                    {formState.form.notes}
                                </label>
                            </div>
                            {/* Properties  */}
                            <div className='flex-col gap-3'>
                                <label className='label !font-semibold'>Properties: </label>
                                <div className='flex flex-col gap-2'>

                                    {formState.form.properties && formState.form.properties.map(p => <label className='label'>{p}</label>)}
                                </div>
                            </div>
                            {/* Status  */}
                            <div className='flex-col gap-3'>
                                <label className='label !font-semibold'>Status: </label>
                                <label className='label'>

                                    {formState.form.status}
                                </label>
                            </div>

                            {/* Referral  */}
                            <div className='flex-col gap-3'>
                                <label className='label !font-semibold'>Referral: </label>
                                <label className='label'>

                                    {formState.form.refferral}
                                </label>
                            </div>




                            {formState.form.status != "Inquiry" && (
                                <div>
                                    {/* Event option */}
                                    {formState.form.bookingType == "Event" && (
                                        <div className='flex flex-col gap-4'>
                                            <p className='text-base font-bold leading-normal '>
                                                Events
                                            </p>
                                            {formState.form.events.map((event, index) => (
                                                <div key={index} className='flex items-center justify-between rounded-xl bg-typo_light-100 px-4 cursor-pointer' onClick={() => {
                                                    setSelectedEvent(event)
                                                    handlePageChange(Page.EventPage)
                                                }}>
                                                    <h3 className='label p-0'>{`${event.eventName}  (${event.numberOfGuests})`}</h3>
                                                    <span className='material-symbols-outlined '>chevron_right</span>
                                                </div>
                                            ))}



                                            <h3 className='subheading text-right'> Final cost: ₹{formState.form.totalCost}</h3>


                                        </div>
                                    )}
                                    {/* Stay options */}
                                    {formState.form.bookingType == "Stay" && (<div className='flex flex-col gap-4'>
                                        <p className='text-base font-bold leading-normal my-4'>
                                            Costs
                                        </p>
                                        <div className='cost-list flex flex-col gap-4'>
                                            {formState.form.costs && formState.form.costs.map((cost, index) => (
                                                <div className='flex items-center gap-4 ' key={index}>
                                                    <label className='label !font-semibold'>{cost.name}: </label>
                                                    <label className='label'>

                                                        {cost.amount}
                                                    </label>

                                                </div>
                                            ))}

                                        </div>

                                        <h3 className='title w-full text-right'>Total : {formState.form.totalCost ? `₹ ${formState.form.totalCost}` : '₹ 0'} </h3>

                                        <div />

                                    </div>)}
                                </div>)}
                            {/*Confirmed option */}
                            {formState.form.status == "Confirmed" && (
                                <div>
                                    <div className='flex flex-col gap-4'>
                                        <p className='text-base font-bold leading-normal '>
                                            Payments
                                        </p>
                                        <div className='cost-list flex flex-col gap-2'>
                                            {formState.form.payments.map((payment, index) => (
                                                <div className='flex items-center gap-4 justify-between' key={index}>
                                                    <label className='label !font-semibold'>{payment.dateTime}: </label>
                                                    <div className='flex items-center w-full justify-start label'>
                                                        <label >
                                                            {payment.amount}-</label>
                                                        <label >{payment.paymentMethod}</label>

                                                    </div>
                                                </div>
                                            ))}

                                        </div>



                                        <h3 className='subheading text-right'> Paid: ₹{formState.form.paid}</h3>
                                        <h3 className='title text-right'> Outstanding: ₹{formState.form.outstanding}</h3>


                                    </div>
                                </div>
                            )}
                        </div>
                    </div >
                )
                }
                {
                    formState.pageToShow === Page.EventPage && (
                        <EventDetailsComponent onEditEvent={() => handlePageChange(Page.EventEdit)} cancelAddEvent={() => handlePageChange(Page.BookingPage)} status={formState.form.status} selectedEvent={selectedEvent} />
                    )
                }
                {
                    formState.pageToShow === Page.EventEdit && (
                        <CreateEventComponent onAddEvent={handleAddEvent} cancelAddEvent={() => handlePageChange(Page.BookingPage)} status={formState.form.status} selectedEvent={selectedEvent} />
                    )
                }
                {/* Version History  */}
                {
                    bookingId && formState.pageToShow === Page.BookingPage && (
                        <div className='my-4'>

                            <div className='flex items-center justify-between '>
                                {formState.currentIndex != 0 && (
                                    <button
                                        className={`${formState.currentIndex !== 0 && 'text-selectedButton'} bg-transparent flex items-center justify-center`}
                                        onClick={() => moveFormState("previous")}
                                        disabled={formState.currentIndex === 0}
                                        type='button'
                                    >
                                        <span className="material-symbols-outlined cursor-pointer">
                                            arrow_back
                                        </span>
                                    </button>)}
                                {formState.currentIndex == 0 && (
                                    <p></p>
                                )}
                                <div className='small-text'> <p>Created by <strong>{formState.bookingDB?.createdBy.name}</strong> on <strong>{printInIndianTime(formState.bookingDB?.createdDateTime)}</strong></p>
                                    <p>Updated by <strong>{formState.bookingDB?.updatedBy.name}</strong> on <strong>{printInIndianTime(formState.bookingDB?.updatedDateTime)}</strong> </p></div>
                                {formState.currentIndex != formState.allData.length - 1 && (
                                    <button
                                        className={`${formState.currentIndex !== formState.allData.length - 1 && 'text-selectedButton'} bg-transparent flex items-center justify-center`}
                                        onClick={() => moveFormState("next")}
                                        disabled={formState.currentIndex === formState.allData.length - 1}
                                        type='button'
                                    >
                                        <span className="material-symbols-outlined cursor-pointer">
                                            arrow_forward
                                        </span>
                                    </button>)}
                                {formState.currentIndex == formState.allData.length - 1 && (
                                    <p></p>
                                )}
                            </div>

                        </div>
                    )
                }
                {/* End Version History */}

            </div >



        </div >
    );
};