import { createClient } from '@/utils/supabase/server';
import BookingFormComponent from '@/components/CreateBookingForm';
import { BookingForm } from '@/utils/lib/bookingType';

export default async function Booking({params}: {params: {id: string}}) {
  const supabase = createClient();

  const { data: bookings } = await supabase.from("bookings").select().eq('id', params.id);

  return (
    <div className='min-h-screen flex items-start justify-center mt-4 w-full'>
      <BookingFormComponent booking={(bookings ?? []).length > 0 ? bookings![0].json[0] as BookingForm : undefined} />
    </div>
  );
}