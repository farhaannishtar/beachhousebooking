
// enum of colors for the calendar
export enum Property {
    Bluehouse = "Bluehouse",
    Glasshouse = "Glasshouse",
    MeadowLane = "Meadow Lane",
    LeChalet = "Le Chalet",
    VillaArmati = "Villa Armati",
    Castle = "Castle"
}

export interface Employee {
    id: string
    name: string
}

export function defaultForm(): BookingForm {
    return {
        client: {
            name: '',
            phone: '',
        },
        numberOfGuests: 2,
        numberOfEvents: 1,
        paymentMethod: "Cash",
        bookingType: 'Stay',
        notes: '',
        properties: [],
        status: 'Inquiry',
        startDateTime: undefined,
        endDateTime: undefined,
        events: [],
        costs: [],
        totalCost: 0,
        payments: [],
        refferral: undefined,
        starred: false,
        outstanding: 0,
        paid: 0
    }
}

export interface BookingForm {
    bookingId?: number | undefined
    client: {
        name: string
        phone: string
    }
    bookingType: "Stay" | "Event"
    numberOfEvents?: number | undefined
    numberOfGuests: number
    startDateTime: string | undefined
    endDateTime: string | undefined
    notes: string
    properties: Property[]
    status: "Inquiry" | "Quotation" | "Confirmed"
    followUpDate?: string | undefined
    events: Event[]
    costs:  Cost[]
    totalCost: number
    payments: Payment[]
    refferral?: string | undefined
    otherRefferal?: string | undefined
    paymentMethod: "Cash" | "Card" | "GPay"
    starred: boolean
    paid:number
    outstanding:number
}

export function numOfDays(bookingForm: BookingForm): number {
    if(bookingForm.startDateTime && bookingForm.endDateTime) {
        let start = new Date(bookingForm.startDateTime)
        let end = new Date(bookingForm.endDateTime)
        return Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24))
    } else {
        return 0
    }
}

export function getProperties(bookingForm: BookingForm): Property[] {
    let properties: Property[] = []
    for (let event of bookingForm.events) {
        for (let property of event.properties) {
            properties.push(property)
        }
    }
    for (let property of bookingForm.properties) {
        properties.push(property)
    }
    // remove duplicates
    return properties.filter((value, index, self) => self.indexOf(value) === index)
}

export function convertPropertiesForDb(properties: Property[]): string[] {
    return properties.map(property => property.toLocaleLowerCase().replace(" ", ""))
}

export function organizedByStartDate(bookings: BookingDB[]): { [key: string]: BookingDB[] } {
    let organizedBookings: { [key: string]: BookingDB[] } = {}
    
    for (let booking of bookings) {
        let date = new Date(booking.startDateTime).toLocaleDateString("en-IN", {
            timeZone: "Asia/Kolkata"
        });
        if (organizedBookings[date]) {
            organizedBookings[date].push(booking)
        } else {
            organizedBookings[date] = [booking]
        }
    }
    return organizedBookings
}

export function organizedByCreatedDate(bookings: BookingDB[]): { [key: string]: BookingDB[] } {
    let organizedBookings: { [key: string]: BookingDB[] } = {}
    
    for (let booking of bookings) {
        // date in indian format
        let date = new Date(booking.createdDateTime).toLocaleDateString("en-IN", {
            timeZone: "Asia/Kolkata"
        });

        if (organizedBookings[date]) {
            organizedBookings[date].push(booking)
        } else {
            organizedBookings[date] = [booking]
        }
    }
    return organizedBookings
}

export function printInIndianTime(utcDateTimeString: string | undefined, onlyTime: boolean = false) {
    if (!utcDateTimeString) return "";
    const utcDate = new Date(utcDateTimeString!);
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata'
    };
    let ret = new Intl.DateTimeFormat('en-US', options).format(utcDate);
    if (onlyTime) {
        ret = ret.split(',')[1];
        let ampm = ret.split(' ')[2];
        ret = ret.split(':').slice(0, 2).join(':')
        ret = ret + ' ' + ampm
    } 
    return ret
}

export function convertDateToIndianDate({date, addDays}: {date?: Date | undefined, addDays?: number | undefined}) {
    let indianDate = new Date()
    if (date) {
      indianDate = new Date(date)
    }
    if (addDays) {
      indianDate.setDate(indianDate.getDate() + addDays);
    }
    indianDate.setUTCHours(0, 0, 0, 0);
    // set to midnight in indian time
    indianDate.setHours(indianDate.getHours() - 5, indianDate.getMinutes() - 30, indianDate.getSeconds(), indianDate.getMilliseconds());
    return indianDate.toISOString()
  }



export interface BookingDB extends BookingForm {
    startDateTime: string
    endDateTime: string
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
    costId?: number | undefined
    name: string
    amount: number
}

export interface Payment {
    paymentId?: number | undefined
    dateTime: string
    paymentMethod: "Cash" | "Card" | "GPay",
    amount: number
    receivedBy?: Employee | undefined
}

export interface Event {
    eventId?: number | undefined
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
    costs:  Cost[]
    finalCost: number
}