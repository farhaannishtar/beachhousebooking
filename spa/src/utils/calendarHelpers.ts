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
    if (availabilityMap[monthStr] == undefined ||
      availabilityMap[monthStr][dayStr] == undefined ||
      availabilityMap[monthStr][dayStr][hourStr] == undefined ||
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
export function checkIfDateIsEligible(date: Date, availabilityMap: Record<string, Record<string, Record<string, boolean>>>) {

  let month = `${date.getMonth() + 1}`;
  let day = `${date.getDate() < 10 ? '0' + date.getDate() : date.getDate()}`;
  let hour = date.getHours();
  console.log({ month, day, hour }, availabilityMap[month]?.[day]?.[hour]);

  return availabilityMap[month]?.[day]?.[hour]
}