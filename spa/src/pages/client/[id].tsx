
import { useRouter } from 'next/router';

import UserBookingDetailsComponent from "@/components/UserBookingDetails";

const ViewBookingPage = () => {
    const router = useRouter();
    const { id } = router.query;
    return (
        <div className='h-full flex items-start justify-center mt-4 w-full'>
            <UserBookingDetailsComponent bookingId={parseInt(id as string)} />
        </div>
    );
}
ViewBookingPage.useNoLayout = true;
export default ViewBookingPage;