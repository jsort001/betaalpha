import { NavDropdownMenu } from "@/components/nav-dropdown-menu";

const RESOURCE_LINKS = [
  { href: "/dashboard/resources/user-guide", label: "User Guide" },
  { href: "/dashboard/resources/contacts", label: "Contacts" },
  { href: "/dashboard/resources/exec-board", label: "Exec Board" },
  { href: "/dashboard/resources/activity", label: "Activity" },
  { href: "/dashboard/resources/meeting-minutes", label: "Meeting Minutes" },
  {
    href: "https://us06web.zoom.us/j/88469604123?pwd=948rW6ka1crSTpgy7V4Z1cUUJv57XX.1",
    label: "Zoom Meeting",
    external: true,
  },
  {
    href: "https://spacereservations.odu.edu/EmsWebApp/",
    label: "Room Reservations",
    external: true,
  },
  {
    href: "https://www.odu.edu/academics/calendar/2026-2027",
    label: "Academic Calendar",
    external: true,
  },
];

export function ResourcesNavMenu() {
  return <NavDropdownMenu label="Resources" links={RESOURCE_LINKS} />;
}
