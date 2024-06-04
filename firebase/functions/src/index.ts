import {onRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { JwtPayload, verifyToken } from "./auth";




export const authenticate = onRequest((request, response) => {
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
  
    // Proceed with the verified JWT
    logger.info("Verified JWT:", { verifiedToken });
    response.send(`Hello from Firebase! User: ${(verifiedToken as JwtPayload).email}`);
  });