import 'rsuite/dist/rsuite.min.css';
import { DatePicker, Stack, } from 'rsuite';
import format from 'date-fns/format';
import styles from './DateTimePickerInput.module.css';
import { useState } from 'react';


interface DateTimePickerInputProps {
  label: string;
  onChange?: (name: string, value: string | null) => void;
  name?: string;
  value?: string | null;
  className?: string;
  cleanable?: boolean;
  showTime?: boolean;
}

export default function DateTimePickerInput({ label, onChange, name, value, className, cleanable, showTime }: DateTimePickerInputProps) {
  const [date, setDate] = useState<Date | null>(null);
  if (value && date === null) {
    setDate(new Date(value))
  }
  let timeFormat = (showTime === false) ? "" : " hh:mmaa";

  return (
    <Stack spacing={10} direction="column" className={`${className}`}>
      <DatePicker
        format={`dd/MM/yy${timeFormat}`}
        renderValue={value => {
          const currentYear = new Date().getFullYear();
          const year = value.getFullYear();
          if (year === currentYear) {
            return format(value, `MMM d${timeFormat}`);
          }
          return format(value, `dd/MM/yy${timeFormat}`);
        }}
        block
        onSelect={(date) => {
          setDate(new Date(date));
          onChange!(name!, date ? date.toISOString() : null)
        }}
        value={date}
        appearance="subtle"
        showMeridian
        placeholder={`${label}`}
        caretAs={date === null ? undefined : "div"}
        onChange={(value) => {
          setDate(value)
          onChange!(name!, value ? value.toISOString() : null)
        }}
        cleanable={cleanable ? true : false}
        placement={label === "End Date" ? "bottomEnd" : "bottomStart"}
        className={`${styles.customDatePicker} ${styles.customDatePickerInput} ${styles.customDatePickerPlaceholderText}  h-14 `}
      />
    </Stack>
  );
}