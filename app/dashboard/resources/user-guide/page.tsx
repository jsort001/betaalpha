import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { BOARD_CATEGORIES } from "@/lib/supabase/types";

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-accent-foreground">
      <span className="h-px w-5 bg-accent-foreground" />
      {children}
    </p>
  );
}

function Step({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4 border-t border-border py-4 first:border-t-0 first:pt-0">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary font-heading text-sm font-bold text-primary">
        {n}
      </span>
      <div>
        <h4 className="text-sm font-bold">{title}</h4>
        <p className="mt-1 text-sm text-muted-foreground">{children}</p>
      </div>
    </div>
  );
}

const BENEFITS = [
  {
    title: "One clear owner",
    body: 'Every task is assigned to a real person. No more "I thought someone else had it."',
  },
  {
    title: "Full visibility",
    body: "See what every hermano is working on — not just your own — from a single dashboard.",
  },
  {
    title: "Nothing slips",
    body: "Email and Slack alerts fire automatically when something's assigned to you, due soon, or overdue.",
  },
  {
    title: "Built-in consistency",
    body: "Recurring events like the Informationals auto-create their standard checklist, so the same six steps never get forgotten.",
  },
  {
    title: "Works from your phone",
    body: "Full mobile layout — check and update your tasks between classes, no laptop required.",
  },
  {
    title: "A real paper trail",
    body: "Every status change and comment is logged, including how long a task actually took start to finish.",
  },
];

const TEMPLATE_TASKS = [
  "Reserve room and date",
  "Reserve AV equipment",
  "Order food",
  "Update PowerPoint presentation",
  "Design flyer",
  "Distribute flyers",
];

const NOTIFICATIONS = [
  {
    title: "Assigned, due soon, or overdue",
    body: "You'll get an email and a chapter Slack post automatically — you don't have to go looking.",
  },
  {
    title: "Tagged in a comment",
    body: "Get notified the moment someone tags you, wherever the conversation is happening.",
  },
  {
    title: "Search",
    body: "Find any task by keyword from the search bar in the header — no need to remember which board it's on.",
  },
  {
    title: "History & timing",
    body: "Every task keeps a full log of who changed what, and once it's done, exactly how long it took start to finish.",
  },
];

const RESOURCE_ITEMS = [
  "Contacts",
  "Exec Board",
  "Zoom Meeting",
  "Room Reservations",
  "Academic Calendar",
];

const TIPS = [
  "Check My Tasks instead of waiting for someone to text you.",
  'Update your status the moment something changes — don’t let it sit on "To Do."',
  "Use comments on the task instead of starting a side conversation in the group chat.",
  "Tag a teammate in a comment instead of DMing them separately.",
  "Not signed in yet? Use the same Google account an admin added — you're already on the roster.",
];

export default function UserGuidePage() {
  return (
    <div className="flex flex-col gap-16 pb-16">
      <div className="flex flex-col items-center gap-4 pt-4 text-center">
        <Image
          src="/logo.png"
          alt="Beta Alpha chapter crest"
          width={72}
          height={81}
          className="h-16 w-auto"
        />
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Beta Alpha Chapter &middot; La Unidad Latina, Lambda Upsilon Lambda
          </p>
          <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-primary">
            Beta Alpha Project Manager
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
            One place to see, assign, and finish everything the chapter is
            working on — built for us, by us.
          </p>
        </div>
        <Badge variant="secondary">Undergrad walkthrough &amp; reference guide</Badge>
      </div>

      <section>
        <Eyebrow>Why this exists</Eyebrow>
        <h2 className="text-xl font-bold tracking-tight text-primary">
          Hermano work was living in separate group chats, emails, and Slack.
        </h2>
        <div className="mt-3 flex max-w-2xl flex-col gap-3 text-sm text-muted-foreground">
          <p>
            Room bookings in one thread, flyer drafts in another, &quot;did
            anyone order the food?&quot; texted to whoever picked up first.
            Nothing was written down anywhere everyone could see it, so the
            same three people ended up carrying it every time.
          </p>
          <p>
            This app is the fix: every task has one owner, one due date, and
            one place to check on it — visible to the whole chapter, not just
            whoever&apos;s in the thread.
          </p>
          <p>
            And because it runs on a Kanban board instead of a wall of
            messages, you can see exactly where every hermano&apos;s work
            stands — To Do, In Progress, Done, or Blocked — at a glance,
            without reading a single message to find out.
          </p>
        </div>
      </section>

      <section>
        <Eyebrow>What it actually gets us</Eyebrow>
        <h2 className="text-xl font-bold tracking-tight text-primary">
          Six things that change once everything&apos;s in one place
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {BENEFITS.map((b) => (
            <Card key={b.title}>
              <CardContent className="py-4">
                <h3 className="text-sm font-bold">{b.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{b.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <Eyebrow>Getting started</Eyebrow>
        <h2 className="text-xl font-bold tracking-tight text-primary">
          Signing in
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Sign in with the same Google account an admin added to the roster.
          If you&apos;re not in yet, ask an admin — once you&apos;re added,
          you&apos;re in, and any task already assigned to you will be
          waiting the first time you log in.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Card>
            <CardContent className="py-4">
              <Badge variant="secondary" className="mb-3">
                Undergrad
              </Badge>
              <ul className="flex flex-col gap-1.5 text-sm text-muted-foreground">
                <li>See every board and every task, across all hermanos</li>
                <li>Update the status on tasks assigned to you</li>
                <li>Comment on any task and tag teammates</li>
                <li>View a task&apos;s full history</li>
              </ul>
            </CardContent>
          </Card>
          <Card className="border-primary bg-primary text-primary-foreground">
            <CardContent className="py-4">
              <Badge className="mb-3 bg-sidebar-primary text-sidebar-primary-foreground">
                Alumni / admin
              </Badge>
              <ul className="flex flex-col gap-1.5 text-sm text-primary-foreground/85">
                <li>Create, edit, and delete boards and tasks</li>
                <li>Assign or reassign anyone, including yourself</li>
                <li>Manage who&apos;s allowed to sign in</li>
                <li>Everything an undergrad can do</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      <section>
        <Eyebrow>The dashboard</Eyebrow>
        <h2 className="text-xl font-bold tracking-tight text-primary">
          Your home base has four parts
        </h2>
        <div className="mt-4">
          <Step n={1} title="My Tasks">
            Everything currently assigned to you, in one list, the moment you
            sign in.
          </Step>
          <Step n={2} title="Project Boards">
            Every board, grouped by category, with an open/overdue count at a
            glance.
          </Step>
          <Step n={3} title="Calendar">
            Chapter events — informationals, socials, deadlines — in a month
            grid or a simple upcoming list.
          </Step>
          <Step n={4} title="Resources">
            Contacts, exec board, Zoom, room reservations, and the academic
            calendar — always one click away.
          </Step>
        </div>
      </section>

      <section>
        <Eyebrow>Project boards</Eyebrow>
        <h2 className="text-xl font-bold tracking-tight text-primary">
          Boards, organized by category
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Every board belongs to a category, so it&apos;s easy to find
          whichever hermano&apos;s work you&apos;re looking for.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {BOARD_CATEGORIES.map((c) => (
            <Badge key={c} variant="outline">
              {c}
            </Badge>
          ))}
        </div>
        <p className="mt-4 max-w-2xl text-sm text-muted-foreground">
          Inside a board, switch between a List view or a Kanban board — drag
          a card between columns and its status updates instantly.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2 overflow-x-auto sm:grid-cols-4">
          {[
            { label: "To Do", border: "border-l-border" },
            { label: "In Progress", border: "border-l-accent" },
            { label: "Done", border: "border-l-primary" },
            { label: "Blocked", border: "border-l-destructive" },
          ].map((col) => (
            <div key={col.label} className="rounded-lg bg-muted/50 p-2">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                {col.label}
              </p>
              <div
                className={`rounded-md border-l-4 bg-card p-2 text-xs shadow-sm ${col.border}`}
              >
                Reserve AV equipment
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <Eyebrow>Starting a new project &middot; admins</Eyebrow>
        <h2 className="text-xl font-bold tracking-tight text-primary">
          Creating a board
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Board creation is an admin action — but knowing how it works
          explains why boards like the Informationals show up already
          stocked with tasks.
        </p>
        <div className="mt-4">
          <Step n={1} title="New board">
            From the dashboard, choose a name — Fall Informational, Spring
            Informational, or Custom for a one-off project.
          </Step>
          <Step n={2} title="Pick the year">
            Recurring titles ask for a year, so &quot;Fall Informational
            2026&quot; and next year&apos;s are always easy to tell apart.
          </Step>
          <Step n={3} title="Category">
            Informational boards default to Intake automatically; custom
            projects pick from the six categories.
          </Step>
        </div>
        <Card className="mt-4 border-dashed">
          <CardContent className="py-4">
            <p className="mb-3 text-xs font-bold text-primary">
              A Fall or Spring Informational board is created with these six
              tasks already on it:
            </p>
            <div className="flex flex-wrap gap-2">
              {TEMPLATE_TASKS.map((t) => (
                <Badge key={t} variant="outline">
                  {t}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <Eyebrow>Doing the work</Eyebrow>
        <h2 className="text-xl font-bold tracking-tight text-primary">
          Creating and running a task
        </h2>
        <div className="mt-4">
          <Step n={1} title="New task">
            Title, description, due date, priority, and — if it repeats —
            weekly, monthly, or every semester.
          </Step>
          <Step n={2} title="Assign an owner">
            Pick anyone on the roster — even someone who hasn&apos;t signed
            in yet. It&apos;ll be waiting for them the moment they do.
          </Step>
          <Step n={3} title="Work it">
            Drag the card to a new column, or change status from the
            dropdown. Comment on it and tag a teammate instead of texting
            them separately.
          </Step>
          <Step n={4} title="Done">
            Mark it complete. If it&apos;s recurring, the next occurrence is
            created automatically with the date rolled forward.
          </Step>
        </div>
      </section>

      <section>
        <Eyebrow>Staying in the loop</Eyebrow>
        <h2 className="text-xl font-bold tracking-tight text-primary">
          The app comes to you
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {NOTIFICATIONS.map((n) => (
            <Card key={n.title}>
              <CardContent className="py-4">
                <h4 className="text-sm font-bold">{n.title}</h4>
                <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <Eyebrow>Calendar &amp; resources</Eyebrow>
        <h2 className="text-xl font-bold tracking-tight text-primary">
          Everything else, one click away
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          The Calendar has two views — a full month Grid, or a simple Agenda
          list split into Upcoming and Past. It remembers whichever you used
          last.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {RESOURCE_ITEMS.map((r) => (
            <div
              key={r}
              className="rounded-lg border border-border bg-card px-4 py-3 text-sm font-semibold"
            >
              {r}
            </div>
          ))}
        </div>
      </section>

      <section>
        <Eyebrow>What this means day to day</Eyebrow>
        <h2 className="text-xl font-bold tracking-tight text-primary">
          How to actually use it
        </h2>
        <div className="mt-4 flex flex-col gap-3">
          {TIPS.map((tip) => (
            <div key={tip} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sidebar-primary text-[11px] font-bold text-sidebar-primary-foreground">
                &#10003;
              </span>
              <p className="text-sm">{tip}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="flex flex-col items-center gap-2 border-t border-border pt-10 text-center">
        <h2 className="font-heading text-2xl font-bold text-primary">
          Questions?
        </h2>
        <p className="text-sm text-muted-foreground">
          Beta Alpha Chapter &middot; La Unidad Latina, Lambda Upsilon Lambda
          Fraternity, Incorporated
        </p>
      </div>
    </div>
  );
}
