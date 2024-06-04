import Image from "next/image";
import BookingForm from "@/components/BookingForm";

export default function Home() {
  return (
    <div className="flex w-full items-center min-h-screen">
      <BookingForm />
    </div>
  );
}
