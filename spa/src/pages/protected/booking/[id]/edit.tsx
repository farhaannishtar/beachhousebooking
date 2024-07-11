
import { useRouter } from 'next/router';

import BookingFormComponent from "@/components/BookingForm";

const ViewBookingPage = () => {
  const router = useRouter();
  const { id } = router.query;
  return (
    <div className='h-full flex items-start justify-center mt-4 w-full'>
      <BookingFormComponent bookingId={parseInt(id as string)} />
    </div>
  );
}
ViewBookingPage.useNoLayout = true;
export default ViewBookingPage;