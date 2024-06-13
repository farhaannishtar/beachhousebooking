import { createClient } from '@/utils/supabase/server';
import BookingFormComponent from '@/components/BookingForm';
import { BookingForm } from '@/utils/lib/bookingType';

export default async function Booking({params}: {params: {id: string}}) {

  return (
    <div className='min-h-screen flex items-start justify-center mt-4 w-full'>
      <BookingFormComponent bookingId={parseInt(params.id)} />
    </div>
  );
}