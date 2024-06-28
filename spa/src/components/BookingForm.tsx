"use client";

import * as yup from 'yup';
import moment from 'moment-timezone';
import { BookingForm, Event, defaultForm, BookingDB, printInIndianTime } from '@/utils/lib/bookingType';
import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'
import CreateEventComponent from './CreateEventForm';
import StayFormComponent from './StayForm';
import { EventStaySwitch } from './EventStaySwitch';
import DateTimePickerInput from './DateTimePickerInput/DateTimePickerInput';
import Properties from './Properties';
import BaseInput from './ui/BaseInput';
import LoadingButton from './ui/LoadingButton';
import { supabase } from '@/utils/supabase/client';
import { createBooking, deleteBooking } from '@/utils/serverCommunicator';

enum Page {
    BookingPage,
    EventPage
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
    //********************** Global Params and methods **********************
    const [loading, setLoading] = useState<boolean>(false)
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

    //********************** Stay Params and methods **********************
    const handleCostsChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const updatedCosts = [...formState.form.costs];
        updatedCosts[index] = {
            ...updatedCosts[index],
            [name]: name === 'amount' ? parseFloat(value) : value,
        };
        setFormState((prevState) => ({
            ...prevState,
            form: {
                ...prevState.form,
                costs: updatedCosts,
                totalCost: updatedCosts.reduce((acc, cost) => acc + cost.amount, 0)
            }

        }));
    };

    const addCost = () => {
        let newCosts = formState.form.costs
        newCosts.push({ name: "", amount: 0 })
        setFormState((prevState) => ({
            ...prevState,
            form: {
                ...prevState.form,
                costs: newCosts
            }
        }));
    };



    const removeEventCost = (costIndex: number) => {
        const updatedCosts = formState.form.costs.filter((_, i) => i !== costIndex)
        setFormState((prevState) => ({
            ...prevState,
            form: {
                ...prevState.form,
                costs: updatedCosts,
                totalCost: updatedCosts.reduce((acc, cost) => acc + cost.amount, 0)
            }

        }));
    }
    //**********************End Stay settings **********************


    //********************** Payment Params and methods **********************
    const addPayment = () => {
        let newPayments = formState.form.payments
        newPayments.push({ paymentMethod: "Cash", amount: 0, dateTime: '' });
        setFormState((prevState) => ({
            ...prevState,
            form: {
                ...prevState.form,
                payments: [...newPayments],
            },
        }));
    }
    const removePayment = (index: Number) => {
        const updatedPayments = formState.form.payments.filter((p, i) => i != index);
        const updatedPaid = [...updatedPayments].reduce(
            (acc, payment) => acc + payment.amount,
            0
        )
        setFormState((prevState) => ({
            ...prevState,
            form: {
                ...prevState.form,
                payments: updatedPayments,
                paid: updatedPaid,
                outstanding: prevState.form.totalCost - updatedPaid
            },
        }));
    }
    const handlePaymentChange = (name: string, value: string, index: number) => {
        const updatedPayments = [...formState.form.payments];
        updatedPayments[index] = {
            ...updatedPayments[index],
            [name]: name === 'amount' ? (value ? parseFloat(value) : 0) : value,
        };
        const updatedPaid = name === 'amount' ? ([...updatedPayments].reduce(
            (acc, payment) => acc + payment.amount,
            0
        )) : formState.form.paid

        setFormState((prevState) => ({
            ...prevState,
            form: {
                ...prevState.form,
                payments: updatedPayments,
                paid: updatedPaid,
                outstanding: prevState.form.totalCost - updatedPaid
            },

        }));
    }

    //********************** End Payment settings **********************
    const handleChange = (
        e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
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
            //     .test(
            //         "is-same-or-after-current-date",
            //         "Start date and time must be the same as or after the current date and time",
            //         (value) => {
            //             if (bookingId) return true;
            //             const currentDateEST = moment().tz("America/New_York"); // Get current date in EST, accounting for DST
            //             const twentyFourHoursBeforeCurrentDateEST = currentDateEST
            //                 .clone()
            //                 .subtract(24, "hours"); // Subtract 24 hours from the current date in EST
            //             const startDate = moment(value).tz("America/New_York"); // Convert startDateTime to EST
            //             return startDate.isSameOrAfter(twentyFourHoursBeforeCurrentDateEST);
            //         }
            //     )
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
        setLoading(true)
        e.preventDefault();
        setIsFormSubmitted(true);
        console.log("validating")
        const isValid = await validateForm();
        if (isValid) {
            console.log("creating")
            let form = formState.form;
            form.bookingId = bookingId;
            const id = await createBooking(formState.form);
            if (!bookingId && id != null && id != "null") {
                // Assuming `id` is the success condition
                router.push(`/protected/booking/${id}`);
            }
        }
        setLoading(false)
    };

    const deleteCurrentBooking = async () => {
        setLoading(true)
        console.log("deleting")
        await deleteBooking(bookingId!);
        setLoading(false)

        router.push('/protected/booking/list')
    }

    return (
        <div>
            <form onSubmit={handleSubmit}>
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
                            {bookingId && formState.pageToShow === Page.BookingPage &&
                                <span className={`${formState.form.starred ? 'material-symbols-filled ' : 'material-symbols-outlined'}  cursor-pointer text-2xl `}
                                    onClick={() =>
                                        setFormState((prevState) => ({
                                            ...prevState,
                                            form: {
                                                ...prevState.form,
                                                starred: !prevState.form.starred
                                            }
                                        }))
                                    }>
                                    star_rate
                                </span>}
                        </div>
                        <div className='flex flex-col gap-y-4 mt-6 '>
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
                                    <BaseInput className="flex-1" preIcon='tag' name="numberOfEvents" placeholder="Events" value={formState.form.numberOfEvents ?? 0}
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
                            <Properties properties={formState.form.properties ?? []} setFormState={setFormState} />
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
                                        <option value="Confirmed">Confirmed</option>
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
                                        <option value="Other">Other</option>
                                    </select>
                                </label>
                            </div>

                            {formState.form.refferral == "Other" && (
                                <div className='flex w-full'>
                                    <div className='w-1/2'>
                                    </div>
                                    <div className="w-1/2">
                                        <BaseInput type="text" name="otherRefferal" placeholder="Referral Name" value={formState.form.otherRefferal ?? ''} onChange={handleChange} />
                                    </div>
                                </div>
                            )}
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
                                            <div className='flex items-center justify-center w-full my-5' onClick={() => {
                                                setSelectedEvent(null)
                                                handlePageChange(Page.EventPage)
                                            }
                                            }>
                                                <button type='button' className='btn btn-wide bg-selectedButton text-center text-white text-base font-bold leading-normal '>
                                                    Add Event </button>
                                            </div>


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
                                            <button onClick={addCost} type='button' className='bg-typo_light-100 text-center rounded-xl py-2 px-6 title w-20'>+</button>
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
                                        <div className='cost-list flex flex-col gap-4'>
                                            {formState.form.payments.map((payment, index) => (
                                                <div className='flex items-center gap-4 justify-between' key={index}>
                                                    <div className='flex flex-wrap items-center gap-2'>
                                                        <DateTimePickerInput label="Date"
                                                            name="dateTime"
                                                            value={payment.dateTime}
                                                            onChange={(name, newDateTime) => {
                                                                handlePaymentChange(name, newDateTime!, index)
                                                            }}
                                                        />
                                                        <div className='flex items-center gap-2 w-full'>
                                                            <BaseInput type="number"
                                                                name="amount"
                                                                value={payment.amount}
                                                                className='!flex-1'
                                                                placeholder="Amount"
                                                                onChange={(e) => {
                                                                    handlePaymentChange('amount', e.target.value, index)
                                                                }}
                                                            />
                                                            <BaseInput type="text"
                                                                name="paymentMethod"
                                                                value={payment.paymentMethod}
                                                                className='!flex-1'
                                                                placeholder="Method"
                                                                onChange={(e) => {
                                                                    handlePaymentChange('paymentMethod', e.target.value, index)
                                                                }}
                                                            />
                                                        </div>

                                                    </div>
                                                    <span className=" material-symbols-outlined cursor-pointer hover:text-red-500" onClick={() => { removePayment(index) }} >delete</span>
                                                </div>
                                            ))}
                                            <div className='flex items-center justify-end'>
                                                <button onClick={addPayment} type='button' className='bg-typo_light-100 text-center rounded-xl py-2 px-6 title w-20'>+</button>
                                            </div>
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
                {
                    formState.pageToShow === Page.BookingPage && (<div className='flex items-center justify-center w-full mt-6'>
                        <LoadingButton loading={loading} type="submit" className='btn btn-wide bg-selectedButton text-center text-white text-base font-bold leading-normal flex-1'>
                            {bookingId ? "Update" : "Create"}
                        </LoadingButton>
                    </div>)
                }
            </form >
            {bookingId && formState.pageToShow === Page.BookingPage && (
                <div className='flex items-center justify-center w-full my-6'>
                    <LoadingButton
                        className='btn btn-wide bg-error text-center text-white text-base font-bold leading-normal w-full'
                        onClick={() => deleteCurrentBooking()}
                        loading={loading}
                    >
                        Delete
                    </LoadingButton>
                </div>
            )}


        </div >
    );
};