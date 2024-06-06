
import { JwtPayload, query, verifyToken } from "../../utils/lib/helper";
import { BookingForm } from "../../utils/lib/bookingType";
import { mutateBookingState } from "../../utils/lib/booking";
import { VercelRequest, VercelResponse } from '@vercel/node';



export default (request: VercelRequest, response: VercelResponse) => {
    const header = request.headers.authorization;
    if (!header) {
      response.status(401).send('No token provided');
      return;
    }

    const bearer = header.split(' ');
    const token = bearer[1]; // Assuming the Authorization header contains "Bearer [token]"

    const verifiedToken = verifyToken(token);

    if (verifiedToken == "Invalid token") { // Check if the returned value is the error message
      response.status(403).send('Invalid token')
      return;
    }
    console.log("😈😈😈")  
    const payload = (verifiedToken as JwtPayload)
    let booking: BookingForm = JSON.parse(request.body)
    mutateBookingState(booking, payload.email).then(bookingId => {
      response.json({bookingId: bookingId})
    }).finally(() => {
      response.status(500).send('Error')
    })
}