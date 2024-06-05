import {onRequest} from "firebase-functions/v2/https";
import * as cors from 'cors';
import * as logger from "firebase-functions/logger";
import { JwtPayload, query, verifyToken } from "./helper";
import { BookingForm } from "../../../shared-types/src/booking";
import { mutateBookingState } from "./booking";

const corsHandler = cors({origin: true});


export const submitBooking = onRequest((request, response) => {
  corsHandler(request, response, () => {
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
    logger.info("😈😈😈")  
    const payload = (verifiedToken as JwtPayload)
    let booking: BookingForm = JSON.parse(request.body)
    mutateBookingState(booking, payload.email).then(bookingId => {
      response.json({bookingId: bookingId})
    }).finally(() => {
      response.status(500).send('Error')
    })
  });
});