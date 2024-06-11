import BookingFormComponent from '@/components/CreateBookingForm';

export default async function Booking() {
  return (
    <div className='min-h-screen flex items-start justify-center mt-4 w-full'>
      <BookingFormComponent />
    </div>
  );
}