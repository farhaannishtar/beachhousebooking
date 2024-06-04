import * as jwt from 'jsonwebtoken';
export interface JwtPayload {
    email: string;
    sub: string;
}

// Function to verify JWT
export const verifyToken = (token: string): JwtPayload | string => {
    try {
        // The jwt.verify method throws an error if the token cannot be verified
        const jwt_secret: string = process.env.JWT_SECRET!;
        const decoded = jwt.verify(token, jwt_secret)
        return decoded as JwtPayload;
    } catch (error) {
        console.error("Invalid token", error);
        return "Invalid token";
    }
}


export const decodeJWT = (token: string): string => {
    const base64String = token.split('.')[1]; // Get the payload part of the JWT
    const decodedValue = Buffer.from(base64String, 'base64').toString('utf8');
    return decodedValue;
};