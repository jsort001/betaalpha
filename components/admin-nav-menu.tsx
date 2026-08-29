import { NavDropdownMenu } from "@/components/nav-dropdown-menu";

const ADMIN_LINKS = [
  { href: "/dashboard/admin/allowlist", label: "Allowlist" },
  { href: "/dashboard/admin/trash", label: "Trash" },
];

export function AdminNavMenu() {
  return <NavDropdownMenu label="Admin" links={ADMIN_LINKS} />;
}
