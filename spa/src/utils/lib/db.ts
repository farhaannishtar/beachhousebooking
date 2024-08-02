import { BookingDB, BookingForm, getProperties, convertPropertiesForDb } from "./bookingType";
import { query } from "./helper";

export async function createBooking(booking: BookingDB, name: string): Promise<number> {
    let resp = await query(`
        INSERT INTO bookings(email, json, client_name, client_phone_number, referred_by, status, properties, check_in, check_out, created_at, updated_at, starred, total_cost, paid, outstanding, tax, after_tax_total, client_view_id)
        VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        RETURNING id`,
        [
            name,
            [booking],
            booking.client.name,
            booking.client.phone,
            booking.refferral,
            booking.status.toLocaleLowerCase(),
            convertPropertiesForDb(getProperties(booking)),
            booking.startDateTime,
            booking.endDateTime,
            booking.createdDateTime,
            booking.updatedDateTime,
            booking.starred ?? false,
            booking.totalCost ?? 0,
            booking.paid ?? 0,
            booking.outstanding ?? 0,
            booking.tax ?? 0,
            booking.afterTaxTotal ?? 0,
            booking.clientViewId!
        ]);
    return resp[0].id;
}

export async function updateBooking(booking: BookingDB[], id: number) {
    const lastBooking = booking[booking.length - 1];

    await query(`
      UPDATE bookings 
        SET 
          json = $2,
          client_name = $3,
          client_phone_number = $4,
          referred_by = $5,
          status = $6,
          properties = $7,
          updated_at = $8,
          check_in = $9,
          check_out = $10,
          starred = $11,
          total_cost = $12,
          paid = $13,
          outstanding = $14,
          tax = $15,
          after_tax_total = $16,
          client_view_id = $17,
          created_at = $18
        WHERE id = $1`,
        [id,
            booking,
            lastBooking.client.name,
            lastBooking.client.phone,
            lastBooking.refferral,
            lastBooking.status.toLocaleLowerCase(),
            convertPropertiesForDb(getProperties(lastBooking)),
            lastBooking.updatedDateTime,
            lastBooking.startDateTime,
            lastBooking.endDateTime,
            lastBooking.starred ?? false,
            lastBooking.totalCost ?? 0,
            lastBooking.paid ?? 0,
            lastBooking.outstanding ?? 0,
            lastBooking.tax ?? 0,
            lastBooking.afterTaxTotal ?? 0,
            lastBooking.clientViewId,
            lastBooking.createdDateTime
        ])
}

export async function fetchBooking(id: number): Promise<BookingDB[]> {
    const result = await query('SELECT * FROM bookings WHERE id = $1', [id]);
    return result[0].json;
}