import { Calendar, Whisper, Popover, Badge } from 'rsuite';
import "rsuite/dist/rsuite-no-reset.min.css";
import format from "date-fns/format";
import { useEffect, useRef, useState } from "react";
import { BookingDB, CalendarCell, convertDateToIndianDate, convertIndianTimeToUTC } from '@/utils/lib/bookingType';
import { title } from 'process';
import { useRouter } from 'next/router';

interface BaseCalendarProps {
    onMonthChange: (date: Date) => void
    bookingsList: CalendarCell[]
    loading?: Boolean
}
type Order = {
    order: number;
};
type DayCellEvent = {
    bookingId?: number;
    startTime: string;
    endTime: string;
    title: string;
    bookingType: 'Stay' | 'Event';
    positions: string[];
    color: string;
    order: number;
    bookingOrderNumber: number;
    numberOfGuests?: number;
    propertyName: string;
    booking: BookingDB;
}
const BaseCalendar: React.FC<BaseCalendarProps> = ({ onMonthChange, bookingsList, loading }) => {
    const router = useRouter();
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const tableOfOrders = useRef<Record<number, number>>({});
    const calendarDays = useRef<Record<string, number>>({});
    const calendarRows = useRef<number[]>([1]);
    const [monthDate, setMonthDate] = useState<Date>(new Date());
    const [maxRowsByGrid, setMaxRowsByGrid] = useState(1);
    const [showEvents, setShowEvents] = useState(false);
    const listOfAllEvents = useRef<Record<string, DayCellEvent[]>>({});
    useEffect(() => {

        tableOfOrders.current = {};
        calendarRows.current = [1]
        calendarDays.current = {}
        const calculatedMaxRows = getMaxRows();
        setSelectedDate(null)
        setMaxRowsByGrid(calculatedMaxRows);
    }, [bookingsList])
    const getMaxRows = () => {
        let maxRows = 1;
        let calendarRowMax = 0;
        const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
        while (format(firstDay, 'eee') !== 'Sun') {
            firstDay.setDate(firstDay.getDate() - 1);
            //console.log(firstDay);

        }

        for (let dayIndex = 1; dayIndex < 42; dayIndex++) {
            let date = firstDay;
            let index = 0;
            calendarDays.current = { ...calendarDays.current, [format(firstDay, 'MMM_dd')]: Math.floor(dayIndex / 7) + 1 }
            bookingsList.map(cell => {

                const bookingDate = new Date(cell.startDateTime);
                const endBookingDate = new Date(cell.endDateTime);
                if (!isNaN(endBookingDate.getTime()) && !isNaN(bookingDate.getTime()) && isDateInRange(date, bookingDate, endBookingDate)) {

                    index++;
                    maxRows < index ? maxRows++ : null;
                    calendarRowMax < index ? calendarRowMax++ : null;

                }

            })

            if (dayIndex < calendarRows.current.length * 7) {
                calendarRows.current[calendarRows.current.length - 1] = calendarRowMax
            } else {
                calendarRows.current = [...calendarRows.current, 1];
                calendarRowMax = 0
            }
            firstDay.setDate(firstDay.getDate() + 1);
        }
        calendarDays.current = { ...calendarDays.current, [format(firstDay, 'MMM_dd')]: 6 }

        //console.log({ calendarRows, calendarDays });

        return maxRows
    }

    const isDateInRange = (date: Date, rangeStart: Date, rangeEnd: Date) => {
        // Set time to 00:00:00 for date, rangeStart, and rangeEnd
        const normalizeToMidnight = (d: Date) => new Date(d.setHours(0, 0, 0, 0));
        const normalizeToLastHour = (d: Date) => new Date(d.setHours(23, 59, 0, 0));
        const normalizeTo11Am = (d: Date) => new Date(d.setHours(14, 0, 59, 0));


        const normalizedDate = normalizeToMidnight(new Date(date));
        const normalizedStart = normalizeToMidnight(new Date(rangeStart));
        const normalizedEnd = normalizeToLastHour(new Date(rangeEnd));
        const normalizedDateTo11Am = normalizeTo11Am(new Date(date));


        return normalizedDate >= normalizedStart && normalizedDate <= normalizedEnd && rangeEnd >= normalizedDateTo11Am;
    };
    const rangePositions = (date: Date, rangeStart: Date, rangeEnd: Date) => {
        let positions = [];


        const nextDay = (d: Date) => new Date(d.setDate(d.getDate() + 1))
        const normalizeTo11Am = (d: Date) => new Date(nextDay(d).setHours(14, 0, 59, 0));
        const normalizedNextDateTo11Am = normalizeTo11Am(new Date(date));
        if (format(date, 'd-MM-yyyy') == format(rangeStart, 'd-MM-yyyy')) {
            positions.unshift('start')
        }

        if (format(date, 'd-MM-yyyy') == format(rangeEnd, 'd-MM-yyyy') || (format(normalizedNextDateTo11Am, 'd-MM-yyyy') == format(rangeEnd, 'd-MM-yyyy') && normalizedNextDateTo11Am > rangeEnd)) {
            positions.push('end')
        }
        if (format(date, 'd-MM-yyyy') !== format(rangeEnd, 'd-MM-yyyy') && format(date, 'd-MM-yyyy') !== format(rangeStart, 'd-MM-yyyy')) {

            if (positions.includes('end')) {
                positions.splice(positions.length - 1, 0, 'middle')
            } else {
                positions.push('middle')

            }

        }

        return positions;
    };
    function reOrderArray(arrayOfEvents: any, date: Date) {

        return arrayOfEvents
    };
    function getTodoList(date: Date) {
        const day = date.getDate();
        let index = 1;
        let thisDayRowsIndexesByOrder = {} as Record<number, number>;


        let returnedBookings: DayCellEvent[] = bookingsList.map(cell => {
            const bookingDate = new Date(cell.startDateTime);
            const endBookingDate = new Date(cell.endDateTime);
            const startDateToShow = new Date(cell.booking.startDateTime);
            const endDateToShow = new Date(cell.booking.endDateTime);
            const bookingDay = bookingDate.getDate();
            const bookingEvent = cell.booking?.client?.name;

            if (!isNaN(startDateToShow.getTime()) && !isNaN(endDateToShow.getTime()) && !isNaN(endBookingDate.getTime()) && !isNaN(bookingDate.getTime()) && isDateInRange(date, bookingDate, endBookingDate)) {
                let positions = rangePositions(date, bookingDate, endBookingDate)
                if (!tableOfOrders.current?.[cell.order]) { //this event dosn't start before this day
                  
                    let indexAlreadyUsed: string | undefined = undefined;
                    indexAlreadyUsed = Object.keys(thisDayRowsIndexesByOrder).find(key => {

                        const t = thisDayRowsIndexesByOrder[parseInt(key)];
                        return t == index
                    });
                    while (indexAlreadyUsed) {
                        index++;
                        indexAlreadyUsed = Object.keys(thisDayRowsIndexesByOrder).find(key => {

                            const t = thisDayRowsIndexesByOrder[parseInt(key)];
                            return t == index
                        });
                    }
                    tableOfOrders.current = { ...tableOfOrders.current, [cell.order]: index };
                    thisDayRowsIndexesByOrder = { ...thisDayRowsIndexesByOrder, [cell.order]: index };
                    index++;
                } else {//this event start before this day
                   
                    let existAlready: string | undefined = undefined;


                    existAlready = Object.keys(thisDayRowsIndexesByOrder).find(key => {

                        const t = thisDayRowsIndexesByOrder[parseInt(key)];
                        return t == tableOfOrders.current?.[cell.order]
                    })

                    if (existAlready) {

                        thisDayRowsIndexesByOrder = { ...thisDayRowsIndexesByOrder, [parseInt(existAlready)]: index };
                        tableOfOrders.current = { ...tableOfOrders.current, [parseInt(existAlready)]: index };
                    }
                    thisDayRowsIndexesByOrder = { ...thisDayRowsIndexesByOrder, [cell.order]: tableOfOrders.current?.[cell.order] };

                    if (index >= tableOfOrders.current?.[cell.order]) {
                        index++
                    }
                }
               
                return { bookingId: cell.booking.bookingId, startTime: format(bookingDate, 'd-MM-yyyy hh:mm aaa'), endTime: format(endBookingDate, 'd-MM-yyyy hh:mm aaa'), title: bookingEvent, bookingType: cell.booking.bookingType, positions, color: cell.color, order: tableOfOrders.current?.[cell.order], bookingOrderNumber: cell.order, numberOfGuests: cell.booking.numberOfGuests, propertyName: cell.propertyName, booking: cell.booking }


            }

        }).filter(elem => !!elem);

        returnedBookings = returnedBookings.map(b => {

            return { ...b, order: thisDayRowsIndexesByOrder[b.bookingOrderNumber] }
        })

        listOfAllEvents.current = { ...listOfAllEvents.current, [date.getTime()]: returnedBookings }
        return returnedBookings
    };

    function renderCell(date: Date) {
        let dayMaxRow = calendarRows.current[calendarDays.current[format(date, 'MMM_dd')] - 1];
        dayMaxRow = maxRowsByGrid //dayMaxRow != 0 ? maxRowsByGrid : 1
        //console.log(dayMaxRow, calendarRows.current, calendarDays.current, format(date, 'MMM_dd'));

        if (loading) return <ul className={`calendar-todo-list grid  relative`} ><li className='flex items-center justify-center'><div className="loader-spinner "></div></li></ul>
        const list = getTodoList(date);

        const displayList = list

        if (list.length) {

            return (
                <ul className={`calendar-todo-list grid  relative`} style={{ gridTemplateRows: `repeat(${dayMaxRow}, 1fr)` }}>
                    {displayList.map((event, index) => (
                        <li key={event.title + '-' + index} className={`flex items-start my-[2px] relative w-full  min-w-0  `} style={{ gridRow: event.order }} >
                            {event.positions.map((pos, i) => {
                                switch (pos) {
                                    case 'start':
                                        return <div key={event.title + '-' + index + '-pos-' + i} id={event.title + '-' + index + '-pos-' + pos} style={{ backgroundColor: event.color }} className={`h-4 ${dayMaxRow > 3 ? 'tablet-down:h-2.5 xs-only:h-1.5' : 'mobile-down:h-3'} min-w-0 flex-1 rounded-l-lg flex items-center -mr-[6px]`}><span className={`text-white text-[8px] pl-1 overflow-hidden whitespace-nowrap text-ellipsis tablet-down:text-[6px] ${dayMaxRow > 3 ? 'xs-only:hidden' : ''}`}>{event.title}</span></div>
                                        break;

                                    case 'middle':
                                        return <div key={event.title + '-' + index + '-pos-' + i} id={event.title + '-' + index + '-pos-' + pos} style={{ backgroundColor: event.color }} className={`h-4 ${dayMaxRow > 3 ? 'tablet-down:h-2.5 xs-only:h-1.5' : 'mobile-down:h-3'} min-w-0 flex-1 flex items-center -mx-[6px]`}><span className={`text-white text-[8px] pl-1 overflow-hidden whitespace-nowrap text-ellipsis tablet-down:text-[6px] ${dayMaxRow > 3 ? 'xs-only:hiddenhidden' : ''}`}></span></div>
                                        break;

                                    case 'end':
                                        return <div key={event.title + '-' + index + '-pos-' + i} id={event.title + '-' + index + '-pos-' + pos} style={{ backgroundColor: event.color }} className={`h-4 ${dayMaxRow > 3 ? 'tablet-down:h-2.5 xs-only:h-1.5' : 'mobile-down:h-3'} min-w-0 flex-1 rounded-r-lg flex items-center -ml-[6px]`}><span className={`text-white text-[8px] pl-1 overflow-hidden whitespace-nowrap text-ellipsis tablet-down:text-[6px]${dayMaxRow > 3 ? 'xs-only:hiddenhidden' : ''}`}></span></div>
                                        break;
                                }
                            })}
                        </li>
                    ))}

                </ul>
            );
        }

        return <ul className={`calendar-todo-list grid  relative`} style={{ gridTemplateRows: `repeat(${dayMaxRow}, 1fr)` }}>
            {Array.from({ length: dayMaxRow }).map((e, i) => <li key={`empty-${i}`} className={`flex items-start  relative w-full my-[2px] min-w-0  `} style={{ gridRow: i + 1 }} >
                <div className={`h-4 ${dayMaxRow > 3 ? 'mobile-down:h-2 xs-only:h-1.5' : 'mobile-down:h-3'} min-w-0 flex-1 rounded-l-lg flex items-center -mr-[6px]`}></div>
            </li>)}

        </ul>;
    }
    return (
        <div style={{ width: selectedDate && showEvents && listOfAllEvents.current[selectedDate.getTime()]?.length ? 'calc(100% - 24rem)' : '100%' }}>
            <Calendar compact className='bg-blueShade rounded-t-xl' renderCell={renderCell} cellClassName={date => `bg-blueShade/10  [&_.rs-calendar-table-cell-content]:!h-auto  `} onChange={date => { setSelectedDate(date); setShowEvents(true) }} onMonthChange={(date) => { onMonthChange(date); setMonthDate(date); setSelectedDate(null); setShowEvents(false) }} />
            {
                selectedDate ? <div className={`event-details bg-white py-5 min-h-60 px-5 pb-5 fixed w-96 mobile-down:w-full top-0 h-full z-[999] max-h-full overflow-y-auto side-nav-shadow transition-all ${showEvents && listOfAllEvents.current[selectedDate.getTime()]?.length ? ' right-0' : '-right-full'}`}>
                    <div className='flex items-center justify-end'>
                        <button className='flex items-center justify-center w-8 h-8 rounded-full border-[1px] border-typo_dark-300 hover:border-typo_dark-100' onClick={() => setShowEvents(false)}>
                            <span className=" material-symbols-outlined cursor-pointer hover:text-typo_dark-100 text-typo_dark-300"  >close</span>
                        </button>
                    </div>
                    <div className='flex gap-4 tablet-down:flex-wrap'>
                        <div className='flex flex-col gap-2 date-details w-10 tablet-down:w-full tablet-down:flex-row'>
                            <strong>{format(selectedDate, 'iii')}</strong>
                            <div className='w-7 h-7 rounded-full bg-selectedButton text-white flex items-center justify-center' ><span>{format(selectedDate, 'd')}</span></div>
                            {/* <div className='tablet-up:hidden flex items-center gap-4'>
                                <button className='flex items-center justify-center w-8 h-8 rounded-full border-[1px] border-typo_dark-300 hover:border-typo_dark-100' onClick={() => setSelectedDate(new Date(selectedDate.getTime() - 86400000))}>
                                    <span className=" material-symbols-outlined cursor-pointer hover:text-typo_dark-100 text-typo_dark-300"  >chevron_left</span>
                                </button><button className='flex items-center justify-center w-8 h-8 rounded-full border-[1px] border-typo_dark-300 hover:border-typo_dark-100' onClick={() => setSelectedDate(new Date(selectedDate.getTime() + 86400000))}>
                                    <span className=" material-symbols-outlined cursor-pointer hover:text-typo_dark-100 text-typo_dark-300"  >chevron_right</span>
                                </button>
                            </div> */}
                        </div>
                        {
                            listOfAllEvents.current[selectedDate.getTime()]?.length && <div className='bg-white p-4 rounded-xl flex flex-col flex-1 gap-1 event-list mobile-down:px-0'>
                                {listOfAllEvents.current[selectedDate.getTime()] ? listOfAllEvents.current[selectedDate.getTime()].map((d, i) => <div key={i}>
                                    <div className='flex gap-3 cursor-pointer' onClick={() => {
                                        router.push(`/protected/booking/${d.bookingId}?returnTo=/protected/fullCalendar`)

                                    }}>
                                        <div className='w-3 h-3 rounded-full bg-selectedButton mt-2' style={{ backgroundColor: d.color }}></div>
                                        <div className='flex flex-col w-full '>
                                            <label className='title'>{d.title}</label>
                                            <div className="flex items-center gap-3"><span className="label-text text-selectedButton w-11">From</span> {d.startTime} </div>
                                            <div className="flex items-center gap-3"><span className="label-text text-selectedButton w-11">To</span> {d.endTime}</div>
                                            <div className="flex items-center gap-3"><span className="label-text text-selectedButton ">Booking Type</span> {d.bookingType}</div>
                                            <div className="flex items-center gap-3"><span className="label-text text-selectedButton ">Property</span> {d.propertyName}</div>
                                            <div className="flex items-center gap-3"><span className="label-text text-selectedButton">Number of Guests</span> {d.numberOfGuests}</div>
                                            <div className="flex items-center gap-3 label-text my-2">
                                                <label>
                                                    Rs{" "}
                                                    {d.booking.outstanding == 0
                                                        ? d.booking.paid.toLocaleString("en-IN")
                                                        : d.booking.outstanding.toLocaleString("en-IN")}
                                                </label>
                                                {d.booking.status == "Confirmed" && (
                                                    <div
                                                        className={`${d.booking.outstanding == 0 ? " bg-[#DEF8E0] text-[#09DC44]" : "bg-error/20 text-error"} px-[18px] rounded-[5px] py-1 font-semibold`}
                                                    >
                                                        {d.booking.outstanding == 0 ? "Paid" : "Unpaid"}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <hr />
                                </div>) : <div>
                                    <h3>No events</h3>
                                </div>}


                            </div>
                        }
                    </div>
                </div> : ''
            }
        </div>
    );
};
export default BaseCalendar;