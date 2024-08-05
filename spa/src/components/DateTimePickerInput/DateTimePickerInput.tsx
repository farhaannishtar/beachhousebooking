import 'rsuite/dist/rsuite.min.css';
import { DatePicker, Stack, } from 'rsuite';
import format from 'date-fns/format';
import styles from './DateTimePickerInput.module.css';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import moment from 'moment-timezone';
import { getDateAvailability } from '@/utils/serverCommunicator';


interface DateTimePickerInputProps {
  label: string;
  onChange?: (name: string, value: string | null) => void;
  name?: string;
  value?: string | null;
  defaultValue?: Date | null;
  className?: string;
  cleanable?: boolean;
  showTime?: boolean;
  bottomEnd?: boolean;
  readOnly?: boolean;
  minDate?: number | Date;
  maxDate?: number | Date;
  properties?: string;
  checkAvailability?: string;
  onConfirmed?: () => void;
  bookingId?: number
}

const DateTimePickerInput = forwardRef<any, DateTimePickerInputProps>(
  ({ properties, checkAvailability, label, onChange, name, value, className, cleanable, showTime, bottomEnd, minDate, maxDate, readOnly, defaultValue, onConfirmed, bookingId }, ref) => {
    useImperativeHandle(ref, () => ({
      fetchAvailabilities,
      setavailabilityMap,
      availabilityMap
    }));
    const [loading, setLoading] = useState<boolean>(false);
    const [date, setDate] = useState<Date | null>(null);
    const [monthDate, setMonth] = useState<Date>(new Date());
    const [availabilityMap, setavailabilityMap] = useState<Record<string, Record<string, Record<string, boolean>>>>({});
    const fetchAvailabilities = () => {

      if (checkAvailability && properties) {
        setLoading(true)
        const fetchDateAvailability = async () => {
          const data = await getDateAvailability(properties, monthDate?.getMonth() + 1, monthDate?.getFullYear(), bookingId);
          setavailabilityMap(data)
          setLoading(false)
        }
        fetchDateAvailability().catch(err => { console.log({ err }); setLoading(false) })

      } else if (!properties) {

        setavailabilityMap({})
      }
    }
    useEffect(() => {
      fetchAvailabilities()
    }, [monthDate?.getMonth()])
    if (value && date === null) {
      setDate(new Date(value))
    }
    const [showOnlyTime, setShowOnlyTime] = useState<boolean>(false)
    let timeFormat = (showTime === false) ? "" : " hh:mmaa";
    let dateTimeformat = !showOnlyTime ? `dd/MM/yy${timeFormat}` : timeFormat;
    return (
      <Stack spacing={10} direction="column" className={`${className}`}>
        <DatePicker
          renderCell={(date) => {
            const day = date.getDate();
            const month = date.getMonth() + 1;
            let dayString = day < 10 ? `0${day}` : day.toString();
            if (availabilityMap && Object.entries(availabilityMap).length) {
              const availableDay = availabilityMap[month]?.[dayString];
              if (availableDay) {
                let availablehours = Object.values(availableDay).filter(
                  (h) => !!h
                );

                if (!availablehours.length) {
                  return (
                    <div className="flex flex-col items-center !line-through">
                      <span>{day}</span>
                    </div>
                  );
                } else if (availablehours.length < 24) {
                  return (
                    <div className="flex flex-col items-center">
                      <span>{day}</span>{" "}
                      <span className="h-[6px] w-[6px] rounded-full bg-orange-400"></span>
                    </div>
                  );
                } else {
                  return (
                    <div className="flex flex-col items-center">
                      <span>{day}</span>{" "}
                      <span className="h-[6px] w-[6px] rounded-full bg-success"></span>
                    </div>
                  );
                }
              }
            }
            return day;
          }}
          onSelect={(date) => { showTime == false ? null : setShowOnlyTime(!showOnlyTime); console.log({ showTime, showOnlyTime }) }}
          onPrevMonth={(date) => setMonth(date)}
          onNextMonth={(date) => setMonth(date)}
          format={dateTimeformat}
          shouldDisableHour={(hour, date) => {
            const dayNumber = date.getDate();

            if (availabilityMap && Object.entries(availabilityMap).length) {
              let dayString =
                dayNumber < 10 ? `0${dayNumber}` : dayNumber.toString();
              let monthString = `${monthDate?.getMonth() + 1}`;
              let hourString = `${hour}`;
              let availableHour =
                availabilityMap[monthString]?.[dayString]?.[hourString];
              return !availableHour;
            }
            return false;
          }}
          renderValue={(value) => {
            const currentYear = new Date().getFullYear();
            const year = value.getFullYear();
            if (year === currentYear) {
              return format(value, `MMM d${timeFormat}`);
            }
            return format(value, `dd/MM/yy${timeFormat}`);
          }}
          block
          // onSelect={(date) => {
          //   setDate(new Date(date));
          //   onChange!(name!, date ? date.toISOString() : null)
          // }}
          onOpen={() => {
            setMonth(date ? date : new Date());
            fetchAvailabilities()
          }}
          value={date}
          appearance="subtle"
          placeholder={`${label}`}
          caretAs={date === null ? undefined : "div"}
          onChange={(value) => {
            setDate(value);
            onChange!(name!, value ? value.toISOString() : null);
          }}
          cleanable={cleanable ? true : false}
          placement={
            label === "End Date" || !!bottomEnd ? "bottomEnd" : "bottomStart"
          }
          preventOverflow
          className={`${styles.customDatePicker} ${styles.customDatePickerInput} ${styles.customDatePickerPlaceholderText}  h-14 `}
          readOnly={readOnly}
          defaultValue={defaultValue}
          loading={loading}
          onOk={() => {
            onConfirmed && onConfirmed();
          }}
        />
      </Stack>
    );
  });
DateTimePickerInput.displayName = "DateTimePickerInput";

export default DateTimePickerInput;