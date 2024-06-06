import { createClient } from '@/utils/supabase/server';
import { SubmitButton } from '../../login/submit-button';

export default async function Notes() {
  const supabase = createClient();
  const { data: bookings } = await supabase.from("bookings").select();


  const createBooking = async (formData: FormData) => {
    // const testFunction = (event: React.FormEvent) => {
    "use server";
    console.log('Test Function');

    const url = 'https://authenticate-snss73hxzq-uc.a.run.app'; // Your Firebase function URL
    const supabase = createClient();
    let sesh = await supabase.auth.getSession()

    //   console.log("session ", sesh.data.session?.access_token);
    let token = sesh.data.session?.access_token;
    const content = formData.get("content") as string;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: content
        })
      });
      const data = await response.json();
      console.log('Response from Firebase function:', data);
      // You might want to handle the data further or redirect the user based on the response
    } catch (error) {
      console.error('Error calling Firebase function:', error);
    }
  }

  return (
    <div>
      {/* <ul>
        {bookings?.map(note => (
          <li key={note.id}>
            <strong>ID:</strong> {note.id} <br />
            <strong>Text:</strong> {note.text}
          </li>
        ))}
      </ul> */}
      <div className='min-h-screen flex items-center justify-center'>
        <form>
          <div className='flex flex-col gap-3 mb-6'>
            <label className="flex items-center gap-2">
              Client Name:
              <input type="text" className="grow" placeholder="" />
            </label>
            <label className="flex items-center gap-2">
              Email:
              <input type="text" className="grow" placeholder="" />
            </label>
            <label className="flex items-center gap-2">
              Phone Number:
              <input type="text" className="grow" placeholder="" />
            </label>
            <label className="flex items-center gap-2">
              Name of Booking:
              <input type="text" className="w-1/2" placeholder="" />
            </label>
            <label className="flex items-center gap-2">
              Type of Booking:
              <select className="grow py-1">
                <option value="">Select...</option>
                <option value="Stay">Stay</option>
                <option value="Event">Event</option>
              </select>
            </label>
            <label className="flex items-center gap-2">
              Payment Method:
              <input type="text" className="w-1/2" placeholder="" />
            </label>
            <label className="flex items-start gap-2">
              Notes:
              <textarea className="grow" placeholder="" />
            </label>
            <label className="flex items-center gap-2">
              Status:
              <select className="grow py-1">
                <option value="">Select...</option>
                <option value="Inquiry">Inquiry</option>
                <option value="Booking">Booking</option>
              </select>
            </label>
            <label className="flex items-center gap-2 mb-2">
              Follow up Date:
              <input type="text" className="w-1/2" placeholder="" />
            </label>
            <label className="flex items-center gap-2">
              Details:
            </label>
            <div className='flex flex-col gap-3 pl-4'>
              <div>

                <label className="flex items-center gap-2">
                  Name of Event/Stay:
                </label>
                <input type="text" className="ml-6 mb-3" placeholder="" />
              </div>
              <label className="flex items-start gap-2">
                Notes:
                <textarea className="grow" placeholder="" />
              </label>
              <label className="flex items-center gap-2">
                Start Time:
                <input type="text" className="w-1/2" placeholder="" />
              </label>
              <label className="flex items-center gap-2">
                End Time:
                <input type="text" className="w-1/2" placeholder="" />
              </label>
              <label className="flex items-center gap-2">
                Number of Guests:
                <input type="text" className="w-1/2" placeholder="" />
              </label>
              <div>
                {/* // TODO: not selecting multiple properties */}
                <label className="flex items-center gap-2">
                  Properties: (Select all that apply)
                </label>
                <select className="grow py-1" multiple size={4}>
                  <option value="Bluehouse">Blue House</option>
                  <option value="Meadowlane">Meadowlane</option>
                  <option value="LeChalet">Le Chalet</option>
                  <option value="ArmatiVilla">ArmatiVilla</option>
                </select>
              </div>
              <label className="flex items-center gap-2">
                Valet Service
                <select className="grow py-1">
                  <option value="">Select</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </label>
              <label className="flex items-center gap-2">
                DJ Service
                <select className="grow py-1">
                  <option value="">Select</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </label>
              <label className="flex items-center gap-2">
                Kitchen Service
                <select className="grow py-1">
                  <option value="">Select</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </label>
              <label className="flex items-center gap-2">
                Overnight stay
                <select className="grow py-1">
                  <option value="">Select</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </label>
              <label className="flex items-center gap-2">
                Number of Overnight Guests:
                <input type="text" className="w-1/6" placeholder="" />
              </label>
            </div>
          </div>
          <div className='flex w-full justify-center'>

            <SubmitButton
              formAction={createBooking}
              className="border border-foreground/20 rounded-md px-4 py-2 text-foreground mb-2 w-1/2 px-4 "
              pendingText="Creating Booking..."
            >
              Create Booking
            </SubmitButton>
          </div>
        </form>
      </div>
    </div>
  );
}