
import { useSearchParams } from 'next/navigation';

import UserBookingDetailsComponent from "@/components/UserBookingDetails";

const ViewBookingPage = () => {
    const searchParams = useSearchParams()
    const clientId = searchParams.get('id')

    return (
        <div className='h-full flex items-start justify-center mt-4 w-full'>
            <UserBookingDetailsComponent bookingId={parseInt(clientId as string)} />
        </div>
    );
}
ViewBookingPage.useNoLayout = true;
export default ViewBookingPage;