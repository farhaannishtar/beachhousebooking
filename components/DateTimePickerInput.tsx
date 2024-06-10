import 'rsuite/dist/rsuite.min.css';
import { DatePicker, Stack } from 'rsuite';
import styles from './DateTimePickerInput.module.css';


interface DateTimePickerInputProps {
  label: string;
}

export default function DateTimePickerInput({ label }: DateTimePickerInputProps) {

  return (
    <Stack spacing={10} direction="column">
      <DatePicker 
        format="dd/MM/yyyy hh:mm aa"
        showMeridian
        placeholder={`${label}`}
        className={`${styles.customDatePicker} ${styles.customDatePickerInput} ${styles.customDatePickerPlaceholderText}`}
      />
    </Stack>
  );
}