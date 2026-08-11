import { requireCurrentUser } from "@/lib/current-user";
import { createClient } from "@/lib/supabase/server";
import { ContactsManager } from "@/components/contacts-manager";

export default async function ContactsPage() {
  await requireCurrentUser();

  const supabase = await createClient();
  const { data: contacts } = await supabase
    .from("contacts")
    .select(
      "id, name, email, phone, pledge_year, major, undergrad_grad_date, grad_degree, school_attended, grad_school_grad_date, job_field, employer, job_title, location"
    )
    .order("name");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-primary">
          Contacts
        </h1>
        <p className="text-sm text-muted-foreground">
          Chapter contact directory — visible and editable by all members.
        </p>
      </div>
      <ContactsManager contacts={contacts ?? []} />
    </div>
  );
}
