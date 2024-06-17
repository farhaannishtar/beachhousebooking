import { createClient } from '@/utils/supabase/server';
import BookingsListComponent from '@/components/ListBooking';
import { BookingDB } from '@/utils/lib/bookingType';

export default async function Booking() {



  return (
    <div className='h-full flex items-start justify-center mt-4 w-full'>
      <BookingsListComponent  />
    </div>
  );
}
