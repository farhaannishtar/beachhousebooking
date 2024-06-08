import { createClient } from '@/utils/supabase/server';
import { BookingForm, Property } from "@/utils/lib/bookingType";
import Form from '@/components/Form';
import BookingFormComponent from '@/components/CreateBooking';

export default async function Booking() {
  const supabase = createClient();
  const { data: bookings } = await supabase.from("bookings").select();



  return (
    <div className='min-h-screen flex items-start justify-center mt-4 w-full'>
      <div>
        <BookingFormComponent />
      </div>
    </div>
  );
}