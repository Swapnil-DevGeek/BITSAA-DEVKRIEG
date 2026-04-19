import { NextRequest } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";

function sseEvent(type: string, data: unknown): Uint8Array {
  const payload = `event: ${type}\ndata: ${JSON.stringify(data)}\n\n`;
  return new TextEncoder().encode(payload);
}

function wait(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

interface BackendReply {
  id: string;
  agent: string;
  comment: string;
  likes: number;
  turn: number;
}

interface BackendComment {
  id: string;
  agent: string;
  comment: string;
  likes: number;
  turn: number;
  replies: BackendReply[];
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const idea = searchParams.get("idea") ?? "";
  const targetUser = searchParams.get("targetUser") ?? "";
  const subreddit = searchParams.get("subreddit") ?? "r/startups";
  const numVocal = Number(searchParams.get("numVocal") ?? "5");

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const res = await fetch(`${BACKEND_URL}/simulate/market`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idea, targetUser, subreddit, numVocal, turns: 2 }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          controller.enqueue(
            sseEvent("error", { message: err.message ?? "Simulation failed" })
          );
          controller.close();
          return;
        }

        const data = await res.json();
        const thread: BackendComment[] = data.thread ?? [];

        // Stream top-level comments
        for (const comment of thread) {
          await wait(800);
          controller.enqueue(
            sseEvent("agent_comment", {
              id: comment.id,
              agent: comment.agent,
              comment: comment.comment,
              turn: comment.turn,
            })
          );

          if (comment.likes > 0) {
            await wait(400);
            controller.enqueue(
              sseEvent("lurker_vote", { commentId: comment.id, delta: comment.likes })
            );
          }
        }

        await wait(1500);

        // Stream replies
        for (const comment of thread) {
          for (const reply of comment.replies ?? []) {
            await wait(700);
            controller.enqueue(
              sseEvent("agent_reply", {
                id: reply.id,
                agent: reply.agent,
                comment: reply.comment,
                parentId: comment.id,
                turn: reply.turn,
              })
            );

            if (reply.likes > 0) {
              await wait(300);
              controller.enqueue(
                sseEvent("lurker_vote", { commentId: reply.id, delta: reply.likes })
              );
            }
          }
        }

        await wait(1000);

        // Normalize thread to frontend shape (likes → upvotes)
        const normalizedThread = thread.map((c) => ({
          id: c.id,
          agent: c.agent,
          type: "vocal" as const,
          comment: c.comment,
          upvotes: c.likes,
          turn: c.turn,
          replies: (c.replies ?? []).map((r) => ({
            id: r.id,
            agent: r.agent,
            comment: r.comment,
            upvotes: r.likes,
            turn: r.turn,
          })),
        }));

        controller.enqueue(
          sseEvent("simulation_complete", {
            slug: data.slug,
            tractionScore: data.tractionScore,
            summary: data.summary,
            thread: normalizedThread,
          })
        );

        controller.close();
      } catch {
        controller.enqueue(
          sseEvent("error", { message: "Simulation failed unexpectedly" })
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
