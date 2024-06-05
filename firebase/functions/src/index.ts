import {onRequest} from "firebase-functions/v2/https";
import * as cors from 'cors';
import * as logger from "firebase-functions/logger";
import { JwtPayload, query, verifyToken } from "./helper";
import { Booking } from "../../../shared-types/src/booking";

const corsHandler = cors({origin: true});


export const authenticate = onRequest((request, response) => {
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
    const payload = (verifiedToken as JwtPayload)
    let booking: Booking = JSON.parse(request.body)

    createBooking(booking, payload.email);  
    logger.info("😈😈😈😈")  
    response.send(`Hello from Firebase! User: ${payload.email}`);
  });
});

export function createBooking(booking: Booking, email: string) {
    query('INSERT INTO bookings(email, json) VALUES($1, $2)', [email, [booking]]);
}