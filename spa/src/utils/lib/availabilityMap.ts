import { Property } from "./bookingType";
import { listEvents } from "./calendar";

export interface TimeSlot {
    start: string;
    end: string;
}

export type Month = "june" | "july" | "august" | "september" | "october" | "november" | "december" | "january" | "february" | "march" | "april" | "may";
export const monthConvert: {
  [key in Month]: number;
} = { "june": 6, "july": 7, "august": 8, "september": 9, "october": 10, "november": 11, "december": 12, "january": 1, "february": 2, "march": 3, "april": 4, "may": 5 };
const numOfDaysInMonth: {
  [key in Month]: number;
} = { "june": 30, "july": 31, "august": 31, "september": 30, "october": 31, "november": 30, "december": 31, "january": 31, "february": 28, "march": 31, "april": 30, "may": 31 };

export async function getTimeSlots(month: Month, propertiesInternal: Property[], year: string, bookingCalendarIdsToOmit: String[] = []): Promise<TimeSlot[]> {
  let monthNumber = monthConvert[month];
  let monthString = monthNumber < 10 ? `0${monthNumber}` : monthNumber;
  console.log('====================================');
  console.log({month,year,monthNumber});
  console.log('====================================');
  let timeSlots: TimeSlot[] = [];
  for (let property of propertiesInternal) {
    let events = await listEvents(property, `${year}-${monthString}-01T00:00:00Z`, `${year}-${monthString}-${numOfDaysInMonth[month]}T23:59:59Z`);
    events = events.filter((event) => !bookingCalendarIdsToOmit.includes(event.id as string));
    timeSlots.push(...events.map((event) => {
    //   console.log(event)
      //   "start: ", event.start?.dateTime, "end: ", event.end?.dateTime);
      return {
        start: event.start?.dateTime as string,
        end: event.end?.dateTime as string
      };
    }));
  }
  return timeSlots;
}

export function generateHourAvailabilityMapGivenStartDate(
    availabilityMap: Record<string, Record<string, Record<string, boolean>>>,
    year: number,
    month: number,
    day: number,
    startHour: number
): Record<string, Record<string, Record<string, boolean>>> {
    let currentMonth = month;
    let currentDay = day;
    let currentHour = startHour;
    const hourAvailabilityMap: Record<string, Record<string, Record<string, boolean>>> = initializeHourAvailabilityMap(currentMonth, year, false);
    while (true) {
        const monthStr = currentMonth.toString();
        const dayStr = currentDay.toString().padStart(2, '0');
        const hourStr = currentHour.toString() //.padStart(2, '0');
        console.log(`[${monthStr}][${dayStr}][${hourStr}]`, availabilityMap[monthStr][dayStr][hourStr] ?? "undefined");
        if (availabilityMap[monthStr] != undefined ||
            availabilityMap[monthStr][dayStr] != undefined||
            availabilityMap[monthStr][dayStr][hourStr] != undefined ||
            availabilityMap[monthStr][dayStr][hourStr] === false) {
            // We've found the next unavailable hour, so return the previous hour
            return hourAvailabilityMap;
        }

        // Move to the next hour
        currentHour++;
        if (currentHour >= 24) {
            currentHour = 0;
            currentDay++;
            // Check if we need to move to the next month
            if (!availabilityMap[monthStr][currentDay.toString().padStart(2, '0')]) {
                currentDay = 1;
                currentMonth++;
                if (currentMonth > 12) {
                    // We've reached the end of the year, stop here
                    return hourAvailabilityMap;
                }
            }
        }
        hourAvailabilityMap[monthStr][dayStr][hourStr] = true;
    }
}

export function initializeHourAvailabilityMap(month: number, year: number, defaultValue: boolean = true): Record<string, Record<string, Record<string, boolean>>> {
    const hourAvailabilityMap: Record<string, Record<string, Record<string, boolean>>> = {};

    // Ensure month is between 1 and 12
    if (month < 1 || month > 12) {
        throw new Error("Month must be between 1 and 12");
    }

    const daysInMonth = new Date(year, month, 0).getDate();
    const monthString = month.toString();

    hourAvailabilityMap[monthString] = {};

    for (let day = 1; day <= daysInMonth; day++) {
        const dayString = day.toString().padStart(2, '0');
        hourAvailabilityMap[monthString][dayString] = {};

        for (let hour = 0; hour < 24; hour++) {
            hourAvailabilityMap[monthString][dayString][hour.toString()] = defaultValue;
        }
    }

    return hourAvailabilityMap;
}

export function generateHourAvailabilityMap(timeSlots: TimeSlot[], month: number, year: number): Record<string, Record<string, Record<string, boolean>>> {
    ;

    // Find min start and max end dates
    const allSlots = timeSlots.flat();
    const minStart = new Date(Math.min(...allSlots.map(slot => new Date(slot.start).getTime())));
    const maxEnd = new Date(Math.max(...allSlots.map(slot => new Date(slot.end).getTime())));
    const hourAvailabilityMap: Record<string, Record<string, Record<string, boolean>>> = initializeHourAvailabilityMap(month, year);


    // Mark occupied hours
    allSlots.forEach(slot => {

        const start = new Date(slot.start);
        start.setUTCHours(start.getUTCHours() + 6);
        start.setUTCMinutes((start.getUTCMinutes() + 30) % 60);
        const end = new Date(slot.end);
        end.setUTCHours(end.getUTCHours() + 6);
        end.setUTCMinutes((end.getUTCMinutes() + 30) % 60);

        let current = new Date(start);

        while (current <= end) {
            const iMonth = (current.getUTCMonth() + 1).toString();
            const day = current.getUTCDate().toString().padStart(2, '0');
            const hour = current.getUTCHours().toString();

            if (current.getMonth() == month - 1) {
                hourAvailabilityMap[month][day][hour] = false;
            }


            current.setHours(current.getHours() + 1);
        }

    });
    return hourAvailabilityMap;
}