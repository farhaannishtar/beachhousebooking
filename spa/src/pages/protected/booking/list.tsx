import BookingsListComponent from '@/components/ListBooking';
import BookingsListDesktopComponent from '@/components/desktop/ListBooking.desktop';

const BookingListPage = () => {



  return (
    <div className='h-full flex items-start justify-center  w-full '>
      <BookingsListComponent className="laptop-up:hidden" />
      <BookingsListDesktopComponent className='tablet-down:hidden' />
    </div>
  );
}
export default BookingListPage