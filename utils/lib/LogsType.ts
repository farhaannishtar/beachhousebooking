import { BookingDB, Property} from '@/utils/lib/bookingType';

export interface ListLogsState {
    searchText: string | null;
    filter: {
      status: "Inquiry" | "Quotation" | "Confirmed" | null;
      updatedTime: Date | null;
      properties: Property[] | null;
      starred: boolean | null;
      paymentPending: boolean | null;
      createdBy: "Nusrat" | "Prabhu" | "Yasmeen" | "Rafica" | null
    }
    date: Date | null;
    dbBookings: BookingDB[];
  }