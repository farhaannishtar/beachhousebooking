
import { useRouter } from 'next/router';

import BookingDetailsComponent from "@/components/BookingDetails";
import BookingDetailsComponentDesktop from "@/components/desktop/BookingDetails.desktop";

const ViewBookingPage = () => {
  const router = useRouter();
  const { id } = router.query;
  return (
    <div className="h-full laptop-up:h-[calc(100%-96px)] flex items-start justify-center mt-4 w-full">
      <BookingDetailsComponent
        bookingId={parseInt(id as string)}
        className="laptop-up:hidden"
      />
      <BookingDetailsComponentDesktop
        bookingId={parseInt(id as string)}
        className="tablet-down:hidden"
      />
    </div>
  );
};
ViewBookingPage.useNoLayout = true;
export default ViewBookingPage;