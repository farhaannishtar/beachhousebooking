import 'rsuite/dist/rsuite.min.css';
import { DatePicker, Stack } from 'rsuite';

interface DateTimePickerInputProps {
  label: string;
}

export default function DateTimePickerInput({ label }: DateTimePickerInputProps) {
  return (
    <Stack spacing={10} direction="column">
      <DatePicker 
        format="dd/MM/yyyy hh:mm aa"
        showMeridian
        label={label}
        className='text-black'
        />
    </Stack>
  );
}