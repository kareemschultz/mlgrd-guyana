import type { Metadata } from "next";
import { AppointmentsRedirect } from "@/components/appointments/appointments-redirect";

export const metadata: Metadata = {
  title: "Book an REO Appointment",
  description:
    "Request a meeting with your Regional Executive Officer (REO). Booking now lives in the Ministry's unified contact hub.",
  robots: { index: false, follow: true },
};

export default function AppointmentsPage() {
  return <AppointmentsRedirect />;
}
