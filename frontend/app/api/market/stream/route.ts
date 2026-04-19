import { MOCK_THREAD } from "@/lib/mock-data";

function sseEvent(type: string, data: unknown): Uint8Array {
  const payload = `event: ${type}\ndata: ${JSON.stringify(data)}\n\n`;
  return new TextEncoder().encode(payload);
}

function wait(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export async function GET() {
  const turn1Comments = MOCK_THREAD.filter((c) => c.turn === 1);
  const turn2Comments = MOCK_THREAD.filter((c) => c.turn === 2);

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // ── Turn 1: initial comments ──────────────────────────────────────────
        for (const comment of turn1Comments) {
          await wait(1400);
          controller.enqueue(
            sseEvent("agent_comment", {
              id: comment.id,
              agent: comment.agent,
              comment: comment.comment,
              turn: 1,
            })
          );

          // Lurker votes arrive shortly after each comment
          await wait(600);
          const voteCount = Math.floor(Math.random() * 3) + 2;
          for (let i = 0; i < voteCount; i++) {
            await wait(300);
            controller.enqueue(
              sseEvent("lurker_vote", {
                commentId: comment.id,
                delta: Math.floor(Math.random() * 10) + 2,
              })
            );
          }
        }

        // Brief pause between turns
        await wait(2000);

        // ── Turn 2: replies ───────────────────────────────────────────────────
        for (let i = 0; i < turn2Comments.length; i++) {
          const comment = turn2Comments[i];
          await wait(1600);

          // Turn 2 comments are replies to Turn 1 comments
          const parentId = turn1Comments[i % turn1Comments.length]?.id ?? turn1Comments[0].id;
          controller.enqueue(
            sseEvent("agent_reply", {
              id: `${comment.id}_r${i}`,
              agent: comment.agent,
              comment: comment.comment,
              parentId,
              turn: 2,
            })
          );

          // More lurker votes on replies
          await wait(500);
          const voteCount = Math.floor(Math.random() * 2) + 1;
          for (let j = 0; j < voteCount; j++) {
            await wait(400);
            controller.enqueue(
              sseEvent("lurker_vote", {
                commentId: parentId,
                delta: Math.floor(Math.random() * 6) + 1,
              })
            );
          }
        }

        // ── Final aggregation ─────────────────────────────────────────────────
        await wait(1500);
        controller.enqueue(
          sseEvent("simulation_complete", {
            tractionScore: 7.2,
            summary:
              "Strong signal from early adopters and power users, tempered by legitimate concerns around scraping legality and scraper maintenance burden. The Slack-native distribution angle is genuinely differentiated from incumbent players. Biggest risk is legal exposure from ToS violations — recommend scoping MVP to public pricing pages only and getting legal counsel before launch.",
            thread: MOCK_THREAD,
          })
        );

        controller.close();
      } catch {
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
