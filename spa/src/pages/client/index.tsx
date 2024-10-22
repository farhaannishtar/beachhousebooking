
import { useSearchParams } from 'next/navigation';

import UserBookingDetailsComponent from "@/components/UserBookingDetails";
import UserBookingDetailsDesktopComponent from "@/components/desktop/UserBookingDetails.desktop";

const ViewBookingPage = () => {
    const searchParams = useSearchParams()
    const clientId = searchParams.get('id')

    return (
      <div className="h-full flex items-start justify-center mt-4 w-full">
        <UserBookingDetailsComponent
          bookingId={parseInt(clientId as string)}
          className="laptop-up:hidden"
        />
        <UserBookingDetailsDesktopComponent
          bookingId={parseInt(clientId as string)}
          className="tablet-down:hidden"
        />
      </div>
    );
}
ViewBookingPage.useNoLayout = true;
export default ViewBookingPage;