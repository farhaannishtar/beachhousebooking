import { Calendar, Whisper, Popover, Badge } from 'rsuite';
import "rsuite/dist/rsuite.css";
import format from "date-fns/format";
import { useState } from "react";
import { BookingDB } from '@/utils/lib/bookingType';
import { title } from 'process';

interface BaseCalendarProps {
    onMonthChange?: (date: Date) => void
    bookingsList: BookingDB[]
}


const BaseCalendar: React.FC<BaseCalendarProps> = ({ onMonthChange, bookingsList }) => {
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const isDateInRange = (date: Date, rangeStart: Date, rangeEnd: Date) => {
        // Set time to 00:00:00 for date, rangeStart, and rangeEnd
        const normalizeToMidnight = (d: Date) => new Date(d.setHours(0, 0, 0, 0));
        const normalizeToLastHour = (d: Date) => new Date(d.setHours(23, 59, 0, 0));

        const normalizedDate = normalizeToMidnight(new Date(date));
        const normalizedStart = normalizeToMidnight(new Date(rangeStart));
        const normalizedEnd = normalizeToLastHour(new Date(rangeEnd));
        // console.log('====================================');
        // console.log({ normalizedDate, normalizedStart, normalizedEnd });
        // console.log('====================================');
        return normalizedDate >= normalizedStart && normalizedDate <= normalizedEnd;
    };
    const rangePositions = (date: Date, rangeStart: Date, rangeEnd: Date) => {
        let positions = [];
        if (format(date, 'd-MM-yyyy') == format(rangeStart, 'd-MM-yyyy')) {
            positions.push('start')
        }

        if (format(date, 'd-MM-yyyy') == format(rangeEnd, 'd-MM-yyyy')) {
            positions.push('end')
        }
        if (format(date, 'd-MM-yyyy') !== format(rangeEnd, 'd-MM-yyyy') && format(date, 'd-MM-yyyy') !== format(rangeStart, 'd-MM-yyyy')) {
            positions.push('middle')
        }
        // console.log('====================================');
        // console.log(positions, format(date, 'd-MM-yyyy'), format(rangeStart, 'd-MM-yyyy'), format(rangeEnd, 'd-MM-yyyy'));
        // console.log('====================================');
        return positions;
    };
    function getTodoList(date: Date) {
        const day = date.getDate();

        const returnedBookings = bookingsList.map(booking => {
            const bookingDate = new Date(booking.startDateTime);
            const endBookingDate = new Date(booking.endDateTime);
            const bookingDay = bookingDate.getDate();
            const bookingEvent = booking?.client?.name;

            if (!isNaN(endBookingDate.getTime()) && !isNaN(bookingDate.getTime()) && isDateInRange(date, bookingDate, endBookingDate)) {
                let positions = rangePositions(date, bookingDate, endBookingDate)
                return { time: format(bookingDate, 'd-MM-yyyy HH:mm'), timeEnd: format(endBookingDate, 'd-MM-yyyy HH:mm'), title: bookingEvent, bookingType: booking.bookingType, positions }


            }

        }).filter(elem => !!elem);

        return returnedBookings
    };

    function renderCell(date: Date) {

        const list = getTodoList(date);
        // console.log('====================================');
        // console.log('render cell ', format(date, 'd-MM-yyyy HH:mm'), list);
        // console.log('====================================');
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
                                        <b>{item?.time}</b> - {item?.title}
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
                <ul className="calendar-todo-list">
                    {displayList.map((event, index) => (
                        <li key={event.title + '-' + index} className='flex items-start my-1'>
                            {event.positions.map(pos => {
                                switch (pos) {
                                    case 'start':
                                        return <div className='h-4 bg-selectedButton flex-1 rounded-l-lg flex items-center'><span className='text-white text-[8px] pl-1'>{event.positions.length > 1 ? event.title.substring(0, 3) : event.title.substring(0, 5)}</span></div>
                                        break;

                                    case 'middle':
                                        return <div className='h-4 bg-selectedButton flex-1 flex items-center '><span className='text-white text-[8px] pl-1'>{event.title.substring(0, 5)}</span></div>
                                        break;

                                    case 'end':
                                        return <div className='h-4 bg-selectedButton flex-1 rounded-r-lg flex items-center'><span className='text-white text-[8px] pl-1'>{event.positions.length > 1 ? event.title.substring(3, 6) : event.title.substring(0, 5)}</span></div>
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
            <Calendar compact className='bg-blueShade rounded-t-xl' renderCell={renderCell} cellClassName={date => "bg-blueShade/10 [&_.rs-calendar-table-cell-content]:!h-20"} onChange={date => setSelectedDate(date)} onMonthChange={onMonthChange} />
            {
                selectedDate && getTodoList(selectedDate).length ? <div className='event-details bg-blueShade rounded-b-xl min-h-60 px-5 pb-5 '>
                    <div className='flex gap-4'>
                        <div className='flex flex-col gap-2 date-details w-10'>
                            <strong>{format(selectedDate, 'iii')}</strong>
                            <div className='w-7 h-7 rounded-full bg-selectedButton text-white flex items-center justify-center'><span>{format(selectedDate, 'd')}</span></div>
                        </div>
                        <div className='bg-white p-4 rounded-xl flex flex-col flex-1 gap-1 event-list '>
                            {getTodoList(selectedDate) ? getTodoList(selectedDate).map((d, i) => <div key={i}>
                                <div className='flex gap-3'>
                                    <div className='w-3 h-3 rounded-full bg-selectedButton mt-2'></div>
                                    <div className='flex flex-col'>
                                        <label className='title'>{d.title}</label>
                                        <span>{d.time}h - {d.timeEnd}h</span>
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