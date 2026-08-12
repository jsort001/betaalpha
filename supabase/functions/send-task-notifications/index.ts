import { createClient } from "npm:@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const RESEND_FROM_EMAIL = Deno.env.get("RESEND_FROM_EMAIL")!;
const SLACK_WEBHOOK_URL = Deno.env.get("SLACK_WEBHOOK_URL");
const APP_URL = "https://betaalpha.vercel.app";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `Beta Alpha Project Manager <${RESEND_FROM_EMAIL}>`,
      to,
      subject,
      html,
    }),
  });
  if (!res.ok) {
    console.error(`Resend error for ${to}: ${res.status} ${await res.text()}`);
  }
  return res.ok;
}

function taskEmailBody(intro: string, title: string, boardName: string, boardId: string) {
  return `
    <p>${intro}</p>
    <p><strong>${title}</strong> on <strong>${boardName}</strong></p>
    <p><a href="${APP_URL}/dashboard/boards/${boardId}">View it in Beta Alpha Project Manager</a></p>
  `;
}

async function postToSlack(text: string) {
  if (!SLACK_WEBHOOK_URL) return;
  try {
    const res = await fetch(SLACK_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) {
      console.error(`Slack webhook error: ${res.status} ${await res.text()}`);
    }
  } catch (err) {
    console.error(`Slack webhook exception: ${err}`);
  }
}

function taskSlackText(
  intro: string,
  title: string,
  ownerName: string,
  boardName: string,
  boardId: string
) {
  return (
    `${intro} *${title}* (${boardName}) — ${ownerName}\n` +
    `<${APP_URL}/dashboard/boards/${boardId}|View in Beta Alpha Project Manager>`
  );
}

Deno.serve(async () => {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const soonCutoff = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const [
    { data: users, error: usersError },
    { data: boards, error: boardsError },
  ] = await Promise.all([
    supabase.from("users").select("id, name, email"),
    supabase.from("boards").select("id, name"),
  ]);
  const userById = new Map((users ?? []).map((u) => [u.id, u]));
  const boardNameById = new Map((boards ?? []).map((b) => [b.id, b.name]));

  let sentCount = 0;
  const errors: string[] = [];
  if (usersError) errors.push(`users query: ${usersError.message}`);
  if (boardsError) errors.push(`boards query: ${boardsError.message}`);

  // Newly assigned. Also covers recurring-task regeneration, since
  // regenerate_recurring_task() sets owner_id on the fresh row.
  const { data: assigned, error: assignedError } = await supabase
    .from("tasks")
    .select("id, title, due_date, owner_id, board_id")
    .not("owner_id", "is", null)
    .is("assigned_notified_at", null);
  if (assignedError) errors.push(`assigned query: ${assignedError.message}`);

  for (const task of assigned ?? []) {
    const owner = userById.get(task.owner_id as string);
    if (!owner) continue;
    const ok = await sendEmail(
      owner.email,
      `New task assigned: ${task.title}`,
      taskEmailBody(
        "You've been assigned a new task" +
          (task.due_date ? `, due ${task.due_date}` : "") +
          ":",
        task.title,
        boardNameById.get(task.board_id) ?? "a board",
        task.board_id
      )
    );
    if (ok) {
      await postToSlack(
        taskSlackText(
          "📌 New task assigned:",
          task.title,
          owner.name,
          boardNameById.get(task.board_id) ?? "a board",
          task.board_id
        )
      );
      const { error: updateError } = await supabase
        .from("tasks")
        .update({ assigned_notified_at: new Date().toISOString() })
        .eq("id", task.id);
      if (updateError) errors.push(`update ${task.id}: ${updateError.message}`);
      else sentCount++;
    }
  }

  // Due soon (within the next 3 days).
  const { data: dueSoon, error: dueSoonError } = await supabase
    .from("tasks")
    .select("id, title, due_date, owner_id, board_id")
    .neq("status", "done")
    .not("owner_id", "is", null)
    .not("due_date", "is", null)
    .gte("due_date", today)
    .lte("due_date", soonCutoff)
    .is("due_soon_notified_at", null);
  if (dueSoonError) errors.push(`due soon query: ${dueSoonError.message}`);

  for (const task of dueSoon ?? []) {
    const owner = userById.get(task.owner_id as string);
    if (!owner) continue;
    const ok = await sendEmail(
      owner.email,
      `Task due soon: ${task.title}`,
      taskEmailBody(
        `This task is due ${task.due_date}:`,
        task.title,
        boardNameById.get(task.board_id) ?? "a board",
        task.board_id
      )
    );
    if (ok) {
      await postToSlack(
        taskSlackText(
          "⏰ Task due soon:",
          task.title,
          owner.name,
          boardNameById.get(task.board_id) ?? "a board",
          task.board_id
        )
      );
      const { error: updateError } = await supabase
        .from("tasks")
        .update({ due_soon_notified_at: new Date().toISOString() })
        .eq("id", task.id);
      if (updateError) errors.push(`update ${task.id}: ${updateError.message}`);
      else sentCount++;
    }
  }

  // Overdue.
  const { data: overdue, error: overdueError } = await supabase
    .from("tasks")
    .select("id, title, due_date, owner_id, board_id")
    .neq("status", "done")
    .not("owner_id", "is", null)
    .not("due_date", "is", null)
    .lt("due_date", today)
    .is("overdue_notified_at", null);
  if (overdueError) errors.push(`overdue query: ${overdueError.message}`);

  for (const task of overdue ?? []) {
    const owner = userById.get(task.owner_id as string);
    if (!owner) continue;
    const ok = await sendEmail(
      owner.email,
      `Task overdue: ${task.title}`,
      taskEmailBody(
        `This task was due ${task.due_date} and is now overdue:`,
        task.title,
        boardNameById.get(task.board_id) ?? "a board",
        task.board_id
      )
    );
    if (ok) {
      await postToSlack(
        taskSlackText(
          "🚨 Task overdue:",
          task.title,
          owner.name,
          boardNameById.get(task.board_id) ?? "a board",
          task.board_id
        )
      );
      const { error: updateError } = await supabase
        .from("tasks")
        .update({ overdue_notified_at: new Date().toISOString() })
        .eq("id", task.id);
      if (updateError) errors.push(`update ${task.id}: ${updateError.message}`);
      else sentCount++;
    }
  }

  // Comment mentions.
  const { data: mentions, error: mentionsError } = await supabase
    .from("comment_mentions")
    .select("comment_id, user_id")
    .is("notified_at", null);
  if (mentionsError) errors.push(`mentions query: ${mentionsError.message}`);

  if (mentions && mentions.length > 0) {
    const commentIds = [...new Set(mentions.map((m) => m.comment_id))];
    const { data: comments, error: commentsError } = await supabase
      .from("task_comments")
      .select("id, task_id, author_id, body")
      .in("id", commentIds);
    if (commentsError) errors.push(`comments query: ${commentsError.message}`);
    const commentById = new Map((comments ?? []).map((c) => [c.id, c]));

    const taskIds = [...new Set((comments ?? []).map((c) => c.task_id))];
    const { data: mentionTasks, error: mentionTasksError } = await supabase
      .from("tasks")
      .select("id, title, board_id")
      .in("id", taskIds.length > 0 ? taskIds : ["00000000-0000-0000-0000-000000000000"]);
    if (mentionTasksError) errors.push(`mention tasks query: ${mentionTasksError.message}`);
    const taskById = new Map((mentionTasks ?? []).map((t) => [t.id, t]));

    for (const mention of mentions) {
      const comment = commentById.get(mention.comment_id);
      const mentionedUser = userById.get(mention.user_id);
      if (!comment || !mentionedUser) continue;
      const task = taskById.get(comment.task_id);
      if (!task) continue;
      const author = userById.get(comment.author_id);
      const authorName = author?.name ?? "Someone";
      const preview =
        comment.body.length > 200 ? `${comment.body.slice(0, 200)}…` : comment.body;
      const boardName = boardNameById.get(task.board_id) ?? "a board";

      const ok = await sendEmail(
        mentionedUser.email,
        `${authorName} tagged you in a comment: ${task.title}`,
        `
          <p>${authorName} tagged you in a comment on <strong>${task.title}</strong> (${boardName}):</p>
          <p style="border-left: 3px solid #ccc; padding-left: 10px;">${preview}</p>
          <p><a href="${APP_URL}/dashboard/boards/${task.board_id}">View it in Beta Alpha Project Manager</a></p>
        `
      );
      if (ok) {
        await postToSlack(
          `💬 ${authorName} tagged *${mentionedUser.name}* in a comment on *${task.title}* (${boardName}):\n` +
            `> ${preview}\n` +
            `<${APP_URL}/dashboard/boards/${task.board_id}|View in Beta Alpha Project Manager>`
        );
        const { error: updateError } = await supabase
          .from("comment_mentions")
          .update({ notified_at: new Date().toISOString() })
          .eq("comment_id", mention.comment_id)
          .eq("user_id", mention.user_id);
        if (updateError) {
          errors.push(`mention update ${mention.comment_id}/${mention.user_id}: ${updateError.message}`);
        } else {
          sentCount++;
        }
      }
    }
  }

  return new Response(JSON.stringify({ sent: sentCount, errors }), {
    headers: { "Content-Type": "application/json" },
  });
});
