import { createServiceClient } from "@/lib/supabase/service";

const SITE_TITLE = "Beta Alpha Project Manager";
const SITE_DESCRIPTION =
  "Task and project management for the Beta Alpha chapter of La Unidad Latina, Lambda Upsilon Lambda Fraternity, Incorporated.";

const STATIC_ROUTE_TITLES: Record<string, string> = {
  "/dashboard": "My Tasks",
  "/dashboard/calendar": "Calendar",
  "/dashboard/search": "Search",
  "/dashboard/resources/contacts": "Contacts",
  "/dashboard/resources/exec-board": "Exec Board",
  "/dashboard/resources/activity": "Activity",
  "/dashboard/resources/meeting-minutes": "Meeting Minutes",
  "/dashboard/resources/user-guide": "User Guide",
  "/dashboard/admin/allowlist": "Allowlist",
  "/dashboard/admin/trash": "Trash",
};

const BOARD_PATH = /^\/dashboard\/boards\/([0-9a-f-]{36})$/i;
const CATEGORY_PATH = /^\/dashboard\/categories\/([^/]+)$/;

// Only ever resolves to a page's own display name (board title, category
// name) — deliberately never touches tasks, descriptions, or members, so
// an unauthenticated preview fetcher can't see anything beyond a label
// that's already effectively public knowledge within the chapter.
export async function resolvePreviewMetadata(
  pathname: string
): Promise<{ title: string; description: string }> {
  const staticTitle = STATIC_ROUTE_TITLES[pathname];
  if (staticTitle) {
    return { title: `${staticTitle} · ${SITE_TITLE}`, description: SITE_DESCRIPTION };
  }

  const categoryMatch = pathname.match(CATEGORY_PATH);
  if (categoryMatch) {
    return {
      title: `${decodeURIComponent(categoryMatch[1])} · ${SITE_TITLE}`,
      description: SITE_DESCRIPTION,
    };
  }

  const boardMatch = pathname.match(BOARD_PATH);
  if (boardMatch) {
    const supabase = createServiceClient();
    const { data: board } = await supabase
      .from("boards")
      .select("name")
      .eq("id", boardMatch[1])
      .maybeSingle();
    if (board) {
      return { title: `${board.name} · ${SITE_TITLE}`, description: SITE_DESCRIPTION };
    }
  }

  return { title: SITE_TITLE, description: SITE_DESCRIPTION };
}
