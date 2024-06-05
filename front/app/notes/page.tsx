import { createClient } from '@/utils/supabase/server';
import { SubmitButton } from '../login/submit-button';

export default async function Notes() {
  const supabase = createClient();
  const { data: notes } = await supabase.from("notes").select();

  
  const createNote = async (formData: FormData) => {
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
      <ul>
        {notes?.map(note => (
          <li key={note.id}>
            <strong>ID:</strong> {note.id} <br />
            <strong>Text:</strong> {note.text}
          </li>
        ))}
      </ul>
      <form>
      <label className="text-md" htmlFor="content">
          Content
        </label>
        <input
          className="rounded-md px-4 py-2 bg-inherit border mb-6"
          name="content"
          placeholder="Enter note text here"
          required
        />
      <SubmitButton
        formAction={createNote}
        className="border border-foreground/20 rounded-md px-4 py-2 text-foreground mb-2"
        pendingText="Creating Note..."
      >
        Creat Note
      </SubmitButton>
      </form>
    </div>
  );
}