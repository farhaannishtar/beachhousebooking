
// enum of colors for the calendar
export enum Property {
    Bluehouse = "Bluehouse",
    Glasshouse = "Glasshouse",
    Pod = "Pod",
    LeChalet = "LeChalet",
    VillaArmati = "VillaArmati",
    Castle = "Castle"
}

export interface Employee {
    id: string
    name: string
}

export interface BookingForm {
    bookingId?: number | undefined
    client: {
        name: string
        phone: string
    }
    bookerName: string
    bookingType: "Stay" | "Event"
    notes: string
    status: "Inquiry" | "Booking"
    followUpDate?: string | undefined
    events: Event[]
    costs:  Cost[]
    finalCost: number
    payments: Payment[]
    paymentMethod: string
    refferral?: Refferal | undefined
}


export interface BookingDB extends BookingForm {
    encodingVersion: number
    createdDateTime: string
    createdBy: Employee
    updatedDateTime: string
    updatedBy: Employee
    confirmedDateTime?: string | undefined
    confirmedBy?: Employee | undefined
}

export interface Refferal {
    type: "Google" | "Facebook" | "Instagram" | "Influencer"
    id?: string | undefined
}

export interface Cost {
    name: string
    amount: number
}

export interface Payment {
    dateTime: string
    paymentMethod: string
    amount: number
    receivedBy?: Employee | undefined
}

export interface Event {
    eventName: string
    calendarIds?: { [key: string]: string } | undefined
    notes: string
    startDateTime: string
    endDateTime: string
    numberOfGuests: number
    properties: Property[]
    valetService: boolean
    djService: boolean
    kitchenService: boolean
    overNightStay: boolean
    overNightGuests: number
}