
import { useRouter } from 'next/router';

import BookingDetailsComponent from "@/components/BookingDetails";

const ViewBookingPage = () => {
  const router = useRouter();
  const { id } = router.query;
  return (
    <div className='h-full flex items-start justify-center mt-4 w-full'>
      <BookingDetailsComponent bookingId={parseInt(id as string)} />
    </div>
  );
}
ViewBookingPage.useNoLayout = true;
export default ViewBookingPage;