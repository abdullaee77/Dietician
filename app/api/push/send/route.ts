// import { NextRequest, NextResponse } from 'next/server'
// import { query } from '@/lib/db'
// import webpush from 'web-push'
// import { todayISO } from '@/lib/utils'

// webpush.setVapidDetails(
//   process.env.VAPID_EMAIL!,
//   process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
//   process.env.VAPID_PRIVATE_KEY!
// )

// export async function POST(req: NextRequest) {
//   const authHeader = req.headers.get('authorization')
//   const cronHeader = req.headers.get('x-vercel-cron')

//   if (!cronHeader && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
//   }

//   try {
//     const today = todayISO()

//     // Get all subscriptions for users who haven't completed today's log
//     const usersWithoutLog = await query(
//       `SELECT DISTINCT ps.user_id, ps.endpoint, ps.p256dh, ps.auth
//        FROM push_subscriptions ps
//        WHERE ps.user_id NOT IN (
//          SELECT user_id FROM daily_logs
//          WHERE date = $1 AND completed = TRUE
//        )`,
//       [today]
//     )

//     if (usersWithoutLog.length === 0) {
//       return NextResponse.json({ message: 'All users have filled their plan', sent: 0 })
//     }

//     const results = await Promise.allSettled(
//       usersWithoutLog.map(async (sub: any) => {
//         const pushSubscription = {
//           endpoint: sub.endpoint,
//           keys: {
//             p256dh: sub.p256dh,
//             auth: sub.auth
//           }
//         }

//         await webpush.sendNotification(
//           pushSubscription,
//           JSON.stringify({
//             title: "Don't forget! 🌸",
//             body: "You haven't filled today's plan yet. Takes just a few minutes!",
//             url: '/home'
//           })
//         )
//       })
//     )

//     // Clean up expired/invalid subscriptions
//     const failed = results
//       .map((r, i) => ({ r, sub: usersWithoutLog[i] }))
//       .filter(({ r }) => r.status === 'rejected')

//     for (const { sub } of failed) {
//       await query(
//         `DELETE FROM push_subscriptions WHERE endpoint = $1`,
//         [sub.endpoint]
//       ).catch(() => {})
//     }

//     return NextResponse.json({
//       sent: results.filter(r => r.status === 'fulfilled').length,
//       failed: failed.length,
//       total: usersWithoutLog.length
//     })
//   } catch (err: any) {
//     console.error('PUSH SEND ERROR:', err.message)
//     return NextResponse.json({ error: err.message }, { status: 500 })
//   }
// }
// export async function GET(req: NextRequest) {
//   console.log("GET route hit by cron");

//   return NextResponse.json({
//     message: "GET works",
//     cron: req.headers.get("x-vercel-cron"),
//   });
// }

import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import webpush from 'web-push'
import { todayISO } from '@/lib/utils'

webpush.setVapidDetails(
  process.env.VAPID_EMAIL!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

async function sendNotifications() {
  try {
    const today = todayISO()

    // Get all subscriptions for users who haven't completed today's log
    const usersWithoutLog = await query(
      `SELECT DISTINCT ps.user_id, ps.endpoint, ps.p256dh, ps.auth
       FROM push_subscriptions ps
       WHERE ps.user_id NOT IN (
         SELECT user_id
         FROM daily_logs
         WHERE date = $1
           AND completed = TRUE
       )`,
      [today]
    )

    if (usersWithoutLog.length === 0) {
      return NextResponse.json({
        message: 'All users have filled their plan',
        sent: 0,
      })
    }

    const results = await Promise.allSettled(
      usersWithoutLog.map(async (sub: any) => {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        }

        await webpush.sendNotification(
          pushSubscription,
          JSON.stringify({
            title: "Don't forget! 🌸",
            body: "You haven't filled today's plan yet. Takes just a few minutes!",
            url: '/home',
          })
        )
      })
    )

    // Remove invalid subscriptions
    const failed = results
      .map((r, i) => ({ r, sub: usersWithoutLog[i] }))
      .filter(({ r }) => r.status === 'rejected')

    for (const { sub } of failed) {
      await query(
        `DELETE FROM push_subscriptions WHERE endpoint = $1`,
        [sub.endpoint]
      ).catch(() => {})
    }

    return NextResponse.json({
      sent: results.filter(r => r.status === 'fulfilled').length,
      failed: failed.length,
      total: usersWithoutLog.length,
    })
  } catch (err: any) {
    console.error('PUSH SEND ERROR:', err)

    return NextResponse.json(
      {
        error: err.message,
      },
      { status: 500 }
    )
  }
}

// Used by Vercel Cron
export async function GET(req: NextRequest) {
  console.log("GET route hit by cron");

  console.log("Headers:");
  req.headers.forEach((value, key) => {
    console.log(`${key}: ${value}`);
  });

  return sendNotifications();
}
// Used by Postman
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  console.log('POST route hit manually')

  return sendNotifications()
}