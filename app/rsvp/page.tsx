import { Suspense } from "react";
import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase";
import { RSVPForm } from "@/components/rsvp-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

interface RSVPPageProps {
  searchParams: { id?: string };
}

async function getInvitee(token: string) {
  const supabase = createServerClient();
  const { data: invitee, error } = await supabase
    .from("invitees")
    .select("*")
    .eq("unique_token", token)
    .single();

  if (error || !invitee) {
    return null;
  }

  return invitee;
}

async function RSVPContent({ token }: { token: string }) {
  const invitee = await getInvitee(token);

  if (!invitee) {
    notFound();
  }

  return (
    <div className="flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-4">
      <Card className="w-full max-w-xxxl shadow-xl rounded-xxxl bg-white/90 backdrop-blur-sm">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-extrabold text-indigo-700 tracking-tight">
            You're Invited!
          </CardTitle>
          <CardDescription className="text-md text-gray-600">
            Hi <span className="font-semibold text-indigo-500">{invitee.name}</span>,
            we'd love to know if you’re attending.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <RSVPForm
            inviteeId={invitee.id}
            token={token}
            inviteeName={invitee.name}
            currentResponse={invitee.rsvp_response}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default function RSVPPage({ searchParams }: RSVPPageProps) {
  const token = searchParams.id;

  if (!token) {
    notFound();
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-pink-100 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent"></div>
        </div>
      }
    >
      <RSVPContent token={token} />
    </Suspense>
  );
}
