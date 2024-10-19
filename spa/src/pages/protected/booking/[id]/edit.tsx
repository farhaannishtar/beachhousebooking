
import { useRouter } from 'next/router';

import BookingFormComponent from "@/components/BookingForm";
import BookingFormComponentDesktop from "@/components/desktop/BookingForm.desktop";

const ViewBookingPage = () => {
  const router = useRouter();
  const { id } = router.query;
  return (
    <div className='h-full laptop-up:h-[calc(100%-96px)] flex items-start justify-center mt-4 w-full'>
      <BookingFormComponent bookingId={parseInt(id as string)} className='laptop-up:hidden' />
      <BookingFormComponentDesktop bookingId={parseInt(id as string)} className='tablet-down:hidden' />
    </div>
  );
}
ViewBookingPage.useNoLayout = true;
export default ViewBookingPage;