import BookingsListComponent from '@/components/ListBooking';
import LoadingButton from '@/components/ui/LoadingButton';
import { createBooking } from '@/utils/serverCommunicator';
import { supabase } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';

const BookingListPage = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [currentId, setCurrentId] = useState<string | number | null>(0)
    //Update all bookings
    const startUpdating = async () => {
        setLoading(true)
        let { data } = await supabase.from("bookings").select().eq('status', 'confirmed');
        if (!data) {
            return;
        }
        for (let index = 0; index < data.length; index++) {
            const booking = data[index];

            const lastIndex = booking.json.length - 1
            let lastBooking = booking.json[lastIndex]
            lastBooking = { bookingId: booking.id, ...lastBooking };
            console.log('====================================');
            console.log('all booking lastBooking', lastBooking, booking);
            console.log('====================================');
            setCurrentId(booking.id)
            const id = await createBooking({ bookingId: booking.id, ...lastBooking });


        }
        setLoading(false)

    }
    //*************** */

    return (
        <div className='h-full flex items-start justify-center  w-full'>
            <div className='w-full flex flex-col gap-4'>
                <h3 className='titlle'>Booking updating Id: {currentId}</h3>
                <LoadingButton
                    loading={loading}
                    className=" border-[1px] border-selectedButton text-selectedButton my-4 w-full py-2 px-4 rounded-xl"
                    onClick={
                        () => {
                            startUpdating()
                        }
                    } >Start</LoadingButton>
            </div>
        </div>
    );
}
export default BookingListPage