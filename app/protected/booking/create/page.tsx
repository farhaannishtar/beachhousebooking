import BookingFormComponent from '@/components/BookingForm';

export default async function Booking() {
    return (
        <div className='h-full flex items-start justify-center mt-4 w-full'>
            <BookingFormComponent />
        </div>
    );
}