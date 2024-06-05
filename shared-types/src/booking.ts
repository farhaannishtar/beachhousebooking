
export interface Booking {
    bookingId?: number | undefined
    calendarId?: string | undefined
    encodingVersion: number
    client: {
        name: string
        email: string
        phone: string
    }
    bookingName: string
    bookingType: "Stay" | "Event"
    paymentMethod: string
    notes: string
    status: "Pending" | "Confirmed" | "Cancelled" | "Completed"
    createdDateTime: string
    createdBy: string
    updatedDateTime: string
    updatedBy: string
    followUpDate: string
    events: Event[]
    costs:  Cost[]
    finalCost: number
    payments: Payments[]
    refferral?: Refferal | undefined
}

export interface Refferal {
    type: "Google" | "Facebook" | "Instagram" | "Influencer"
    id?: string | undefined
}

export interface Cost {
    name: string
    amount: number
}

export interface Payments {
    date: string
    paymentMethod: string
    amount: number
    receivedBy: string
}

export interface Event {
    eventName: string
    notes: string
    startDateTime: string
    endDateTime: string
    numberOfGuests: number
    properties: string[]
    valetService: boolean
    djService: boolean
    kitchenService: boolean
    overNightStay: boolean
    overNightGuests: number
}