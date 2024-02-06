import { EmailTemplate } from "@/components/email-template";
import { currentUser } from "@clerk/nextjs/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(req) {
  const user = await currentUser();
  const emailId = user.emailAddresses[0].emailAddress;
  const firstName = user.firstName;
  const { data, error } = await resend.emails.send({
    from: "ReviNotion <onboarding@resend.dev>",
    to: ["harshylohana15@gmail.com"],
    subject: "Hello world",
    react: EmailTemplate({ firstName }),
  });

  if (error) {
    return Response.json(error);
  }
  return Response.json(data);
}
