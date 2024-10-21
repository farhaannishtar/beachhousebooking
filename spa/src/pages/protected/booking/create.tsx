import BookingFormComponent from "@/components/BookingForm";
import BookingFormComponentDesktop from "@/components/desktop/BookingForm.desktop";

const CreateBookingPage = () => {
  return (
    <div className="h-full laptop-up:h-[calc(100%-96px)] flex items-start justify-center my-4 w-full">
      <BookingFormComponent className="laptop-up:hidden" />
      <BookingFormComponentDesktop className="tablet-down:hidden" />
    </div>
  );
}
CreateBookingPage.useNoLayout = true;
export default CreateBookingPage;