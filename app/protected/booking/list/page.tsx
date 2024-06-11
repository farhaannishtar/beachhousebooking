import { createClient } from '@/utils/supabase/server';
import BookingsListComponent from '@/components/ListBooking';
import { BookingDB } from '@/utils/lib/bookingType';



export default async function Booking() {
  const supabase = createClient();
  let { data: bookingsData } = await supabase.from("bookings").select()


          let bookings: BookingDB[] = []
    
        bookingsData?.forEach((booking) => {
          const lastIndex = booking.json.length - 1
          const lastBooking = booking.json[lastIndex]
          bookings.push({
            ...lastBooking,
            bookingId: booking.id,
          })
        })

  
  return (
    <div className='min-h-screen flex items-start justify-center mt-4 w-full'> 
      <BookingsListComponent bookingsFromParent={bookings} />
    </div>
  );
}
