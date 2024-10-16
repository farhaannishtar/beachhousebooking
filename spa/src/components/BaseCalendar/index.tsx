import { Calendar, Whisper, Popover, Badge } from 'rsuite';
import "rsuite/dist/rsuite-no-reset.min.css";
import format from "date-fns/format";
import { useEffect, useRef, useState } from "react";
import { BookingDB, CalendarCell } from '@/utils/lib/bookingType';
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
    bookingOrderNumber: number
}
const BaseCalendar: React.FC<BaseCalendarProps> = ({ onMonthChange, bookingsList, loading }) => {
    const router = useRouter();
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const tableOfOrders = useRef<Record<number, number>>({});
    const [monthDate, setMonthDate] = useState<Date>(new Date());
    const [maxRowsByGrid, setMaxRowsByGrid] = useState(2);
    const listOfAllEvents = useRef<Record<string, DayCellEvent[]>>({});
    useEffect(() => {

        tableOfOrders.current = {};
        const calculatedMaxRows = getMaxRows();

        setMaxRowsByGrid(calculatedMaxRows);
    }, [bookingsList])
    const getMaxRows = () => {
        let maxRows = 2;
        const nbrOfDaysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 0).getDate();

        for (let dayIndex = 1; dayIndex <= nbrOfDaysInMonth; dayIndex++) {
            let date = new Date(monthDate.getFullYear(), monthDate.getMonth(), dayIndex);
            let index = 0;
            bookingsList.map(cell => {

                const bookingDate = new Date(cell.startDateTime);
                const endBookingDate = new Date(cell.endDateTime);
                if (!isNaN(endBookingDate.getTime()) && !isNaN(bookingDate.getTime()) && isDateInRange(date, bookingDate, endBookingDate)) {

                    index++;
                    maxRows <= index ? maxRows++ : null;

                }

            })
        }
        return maxRows
    }
    const isDateInRange = (date: Date, rangeStart: Date, rangeEnd: Date) => {
        // Set time to 00:00:00 for date, rangeStart, and rangeEnd
        const normalizeToMidnight = (d: Date) => new Date(d.setHours(0, 0, 0, 0));
        const normalizeToLastHour = (d: Date) => new Date(d.setHours(23, 59, 0, 0));
        const normalizeTo11Am = (d: Date) => new Date(d.setHours(11, 0, 0, 0));


        const normalizedDate = normalizeToMidnight(new Date(date));
        const normalizedStart = normalizeToMidnight(new Date(rangeStart));
        const normalizedEnd = normalizeToLastHour(new Date(rangeEnd));
        const normalizedDateTo11Am = normalizeTo11Am(new Date(date));


        return normalizedDate >= normalizedStart && normalizedDate <= normalizedEnd && rangeEnd >= normalizedDateTo11Am;
    };
    const rangePositions = (date: Date, rangeStart: Date, rangeEnd: Date) => {
        let positions = [];


        const nextDay = (d: Date) => new Date(d.setDate(d.getDate() + 1))
        const normalizeTo11Am = (d: Date) => new Date(nextDay(d).setHours(11, 0, 0, 0));
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

                    index++
                }

                return { bookingId: cell.booking.bookingId, startTime: format(startDateToShow, 'd-MM-yyyy hh:mm aaa'), endTime: format(endDateToShow, 'd-MM-yyyy hh:mm aaa'), title: bookingEvent, bookingType: cell.booking.bookingType, positions, color: cell.color, order: tableOfOrders.current?.[cell.order], bookingOrderNumber: cell.order }


            }

        }).filter(elem => !!elem);

        returnedBookings = returnedBookings.map(b => {

            return { ...b, order: thisDayRowsIndexesByOrder[b.bookingOrderNumber] }
        })

        listOfAllEvents.current = { ...listOfAllEvents.current, [date.getTime()]: returnedBookings }
        return returnedBookings
    };

    function renderCell(date: Date) {
        if (loading) return <ul className={`calendar-todo-list grid  relative`} ><li className='flex items-center justify-center'><div className="loader-spinner "></div></li></ul>
        const list = getTodoList(date);

        const displayList = list

        if (list.length) {
            const moreCount = list.length - displayList.length;
            const moreItem = (
                <li>
                    <Whisper
                        placement="top"
                        trigger="click"
                        speaker={
                            <Popover>
                                {list.map((item, index) => (
                                    <p key={index}>
                                        <b>{item?.startTime}</b> - {item?.title}
                                    </p>
                                ))}
                            </Popover>
                        }
                    >
                        <a>{moreCount} more</a>
                    </Whisper>
                </li>
            );

            return (
                <ul className={`calendar-todo-list grid  relative`} style={{ gridTemplateRows: `repeat(${maxRowsByGrid}, 1fr)` }}>
                    {displayList.map((event, index) => (
                        <li key={event.title + '-' + index} className={`flex items-start my-1 relative w-full `} style={{ gridRow: event.order }} >
                            {event.positions.map((pos, i) => {
                                switch (pos) {
                                    case 'start':
                                        return <div key={event.title + '-' + index + '-pos-' + i} id={event.title + '-' + index + '-pos-' + pos} style={{ backgroundColor: event.color }} className={`h-4 flex-1 rounded-l-lg flex items-center -mr-[6px]`}><span className='text-white text-[8px] pl-1'>{event.positions.length > 1 ? event.title.substring(0, 3) : event.title.substring(0, 5)}</span></div>
                                        break;

                                    case 'middle':
                                        return <div key={event.title + '-' + index + '-pos-' + i} id={event.title + '-' + index + '-pos-' + pos} style={{ backgroundColor: event.color }} className={`h-4 flex-1 flex items-center -mx-[6px]`}><span className='text-white text-[8px] pl-1'>{event.title.substring(0, 5)}</span></div>
                                        break;

                                    case 'end':
                                        return <div key={event.title + '-' + index + '-pos-' + i} id={event.title + '-' + index + '-pos-' + pos} style={{ backgroundColor: event.color }} className={`h-4 flex-1 rounded-r-lg flex items-center -ml-[6px]`}><span className='text-white text-[8px] pl-1'>{event.positions.length > 1 ? event.title.substring(3, 6) : event.title.substring(0, 5)}</span></div>
                                        break;
                                }
                            })}
                        </li>
                    ))}

                </ul>
            );
        }

        return null;
    }
    return (
        <div style={{ width: '100%' }}>
            <Calendar compact className='bg-blueShade rounded-t-xl' renderCell={renderCell} cellClassName={date => "bg-blueShade/10 [&_.rs-calendar-table-cell-content]:!h-auto laptop-up:[&_.rs-calendar-table-cell-content]:!h-auto laptop-up:[&_.rs-calendar-table-cell-content]:!min-h-20"} onChange={date => setSelectedDate(date)} onMonthChange={(date) => { onMonthChange(date); setMonthDate(date) }} />
            {
                selectedDate && listOfAllEvents.current[selectedDate.getTime()]?.length ? <div className='event-details bg-blueShade rounded-b-xl min-h-60 px-5 pb-5 '>
                    <div className='flex gap-4'>
                        <div className='flex flex-col gap-2 date-details w-10'>
                            <strong>{format(selectedDate, 'iii')}</strong>
                            <div className='w-7 h-7 rounded-full bg-selectedButton text-white flex items-center justify-center'><span>{format(selectedDate, 'd')}</span></div>
                        </div>
                        <div className='bg-white p-4 rounded-xl flex flex-col flex-1 gap-1 event-list '>
                            {listOfAllEvents.current[selectedDate.getTime()] ? listOfAllEvents.current[selectedDate.getTime()].map((d, i) => <div key={i}>
                                <div className='flex gap-3 cursor-pointer' onClick={() => {
                                    let host = window.location.host;
                                    host = !host.includes("http") ? `http://${host}` : host;
                                    window.open(`${host}/protected/booking/${d.bookingId}?returnTo=/protected/fullCalendar`, '_blank')
                                }}>
                                    <div className='w-3 h-3 rounded-full bg-selectedButton mt-2'></div>
                                    <div className='flex flex-col w-full'>
                                        <label className='title'>{d.title}</label>
                                        <div className="flex items-center gap-3"><span className="label-text text-selectedButton w-11">From</span> {d.startTime} </div>
                                        <div className="flex items-center gap-3"><span className="label-text text-selectedButton w-11">To</span> {d.endTime}</div>
                                    </div>
                                </div>
                                <hr />
                            </div>) : <div>
                                <h3>No events</h3>
                            </div>}


                        </div>
                    </div>
                </div> : ''
            }
        </div>
    );
};
export default BaseCalendar;