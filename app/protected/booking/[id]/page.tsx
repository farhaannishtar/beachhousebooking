import { createClient } from '@/utils/supabase/server';
import BookingFormComponent from '@/components/BookingForm';
import { BookingForm } from '@/utils/lib/bookingType';

export default async function Booking({params}: {params: {id: string}}) {
  const supabase = createClient();

  const { data: bookings } = await supabase.from("bookings").select().eq('id', params.id);

  console.log("bookings: ", bookings); 
  let booking: BookingForm | undefined = undefined
  if ((bookings ?? []).length > 0) {
    booking = bookings![0].json[0] as BookingForm;
    booking.bookingId = bookings![0].id;
  
  } 

  return (
    <div className='min-h-screen flex items-start justify-center mt-4 w-full'>
      <BookingFormComponent booking={booking} />
    </div>
  );
}