import BaseCalendar from "@/components/BaseCalendar";
import Properties from "@/components/Properties";
import { BookingDB, convertPropertiesForDb, convertStringToProperty, Property } from "@/utils/lib/bookingType";
import { supabase } from "@/utils/supabase/client";
import format from "date-fns/format";
import { useEffect, useState } from "react";
interface ListBookingsState {
    date: Date | null;
    dbBookings: BookingDB[];
}
const FullCalendar = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [state, setState] = useState<ListBookingsState>({
        date: null,
        dbBookings: [],
    });
    const [selectedProperty, setSelectedProperty] = useState<Property>(Property.Bluehouse);
    const [monthDate, setMonthDate] = useState<Date>(new Date())
    useEffect(() => {
        fetchData(monthDate)
    }, [selectedProperty])
    async function fetchData(date: Date) {

        setLoading(true);
        setMonthDate(date);//to save the date when changing the month to keep fetching data for same month when changing property 
        let month = format(date, 'yyyy-MM');
        let nextMonth = format(new Date(new Date().setMonth(date.getMonth() + 1)), 'yyyy-MM');
        let bookingsData = await supabase.from("bookings").select().gte('check_in', `${month}-01T00:00:00.000Z`)  // Start of the month
            .lt('check_in', `${nextMonth}-01T00:00:00.000Z`).contains(
                "properties",
                convertPropertiesForDb([selectedProperty])
            ).eq("status", "confirmed");   // Start of the next month
        if (bookingsData.data) {
            let bookings: BookingDB[] = [];
            for (const booking of bookingsData.data ?? []) {
                const lastIndex = booking.json.length - 1;
                const lastBooking = booking.json[lastIndex];
                bookings.unshift({
                    ...lastBooking,
                    bookingId: booking.id,
                });
            }
            setState((prevState) => ({
                ...prevState,
                date: date,
                dbBookings: bookings,
            }));
        }

        console.log('====================================');
        console.log({ bookingsData: bookingsData.data });
        console.log('====================================');
    }

    return (
        <div className='h-full flex items-start justify-center  w-full'>
            <div className="w-full  ">
                {/* Top Nav */}
                <div className="flex items-center h-[72px]">
                    <h1 className="text-lg font-bold leading-6 w-full text-center ">
                        Calendar
                    </h1>
                </div>
                <div>
                    <select name="properties" id="properties" className="my-2 w-full h-10 border-[1px] border-typo_dark-100 rounded-sm px-3" value={selectedProperty} onChange={(e) => setSelectedProperty(convertStringToProperty(e.target.value))}>
                        <option value={Property.Bluehouse}>{Property.Bluehouse}</option>
                        <option value={Property.MeadowLane}>{Property.MeadowLane}</option>
                        <option value={Property.Glasshouse}>{Property.Glasshouse}</option>
                        <option value={Property.VillaArmati}>{Property.VillaArmati}</option>
                        <option value={Property.LeChalet}>{Property.LeChalet}</option>
                        <option value={Property.Castle}>{Property.Castle}</option>
                    </select>
                </div>
                <BaseCalendar onMonthChange={(date: Date) => fetchData(date)} bookingsList={state.dbBookings} />

            </div>

        </div>
    );
}
export default FullCalendar 