// import { verifyToken } from "./auth";
import * as dotenv from 'dotenv';
import { query } from './helper';

dotenv.config();

// const token = 'eyJhbGciOiJIUzI1NiIsImtpZCI6IjJFRWZoS0ZUZllTTHl5dXciLCJ0eXAiOiJKV1QifQ.eyJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzE3NTMyNDM3LCJpYXQiOjE3MTc1Mjg4MzcsImlzcyI6Imh0dHBzOi8vb2tmcnVxenVsanB4bXp3ZGV5bmouc3VwYWJhc2UuY28vYXV0aC92MSIsInN1YiI6ImExZWY0NDI0LTMzYWQtNGZjYi1iNDZlLWQwNGRhY2IwZDFkOSIsImVtYWlsIjoibmF0aGlrYXphZEBnbWFpbC5jb20iLCJwaG9uZSI6IiIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6ImVtYWlsIiwicHJvdmlkZXJzIjpbImVtYWlsIl19LCJ1c2VyX21ldGFkYXRhIjp7ImVtYWlsIjoibmF0aGlrYXphZEBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsInBob25lX3ZlcmlmaWVkIjpmYWxzZSwic3ViIjoiYTFlZjQ0MjQtMzNhZC00ZmNiLWI0NmUtZDA0ZGFjYjBkMWQ5In0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoicGFzc3dvcmQiLCJ0aW1lc3RhbXAiOjE3MTc1Mjg4Mzd9XSwic2Vzc2lvbl9pZCI6IjQzMmJiNzgwLWNjNmMtNGQzMi05MDI2LTFkYTkxNjFjOGY0YSIsImlzX2Fub255bW91cyI6ZmFsc2V9.TqvxUYrSakGp5f9HqyUPBoMi1k_sT6sBbHBfxkFAO6c';
// const result = verifyToken(token);
// console.log(result);

// export const note = pgTable("user", {
//     id: serial("id"),
//     name: text("name"),
//     email: text("email"),
//     password: text("password"),
//     role: text("role").$type<"admin" | "customer">(),
//     createdAt: timestamp("created_at"),
//     updatedAt: timestamp("updated_at"),
//   });




async function main() {
    const notes = await query('SELECT * FROM notes');
    console.log(notes);
    const notes2 = await query('INSERT INTO notes(text) VALUES($1)', ["Hello"]);
    console.log(notes2);
    
    return;
}

main()