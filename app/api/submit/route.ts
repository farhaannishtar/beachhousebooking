
import { JwtPayload, query, verifyToken } from "@/utils/lib/helper";
import { BookingForm } from "@/utils/lib/bookingType";
import { deleteBooking, mutateBookingState } from "@/utils/lib/booking";
import { NextRequest, NextResponse } from "next/server";
import { headers } from 'next/headers'
import { fetchUser, verifyAndGetPayload } from "@/utils/lib/auth";


export async function POST(request: NextRequest): Promise<NextResponse> {
  console.log('Post request')
    const payload = verifyAndGetPayload(request)
    if (payload instanceof NextResponse) {
      return payload as NextResponse;
    }
    let booking: BookingForm = await request.json()
    let user = await fetchUser(payload.sub)
    let bookingId = await mutateBookingState(booking, user)
    try {
      return new NextResponse(JSON.stringify({bookingId: bookingId}), {
        status: 200,
      });
    } catch (error) {
      return new NextResponse(JSON.stringify({error: "Error creating booking"}), {
        status: 500,
      });
    }
}


export async function DELETE(request: NextRequest): Promise<NextResponse> {
  console.log('Delete request')
  const payload = verifyAndGetPayload(request)
  if (payload instanceof NextResponse) {
    return payload as NextResponse;
  }
  let {bookingId} = await request.json()
  console.log('Booking id: ', bookingId)
  await deleteBooking(bookingId)
  try {
    return new NextResponse(JSON.stringify({bookingId: bookingId}), {
      status: 200,
    });
  } catch (error) {
    return new NextResponse(JSON.stringify({error: "Error deleting booking"}), {
      status: 500,
    });
  }
}