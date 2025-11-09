import crypto from 'node:crypto'
import { type NextRequest, NextResponse } from 'next/server'

const {
  DINGTALK_APP_KEY,
  DINGTALK_APP_SECRET,
  CHAT_REDIRECT_BASE,
  VERIFY_KEY,
} = process.env

async function getAccessToken() {
  const url = `https://oapi.dingtalk.com/gettoken?appkey=${DINGTALK_APP_KEY}&appsecret=${DINGTALK_APP_SECRET}`
  const r = await fetch(url)
  const j = await r.json()
  if (!j.access_token)
    throw new Error(`gettoken failed: ${JSON.stringify(j)}`)
  return j.access_token
}

export async function POST(req: NextRequest) {
  const { code } = await req.json()
  if (!code)
    return NextResponse.json({ error: 'missing code' }, { status: 400 })

  const accessToken = await getAccessToken() // 企业内部应用 token（应用维度）:contentReference[oaicite:7]{index=7}

  // 通过免登码换 userid
  const uiRes = await fetch(
    `https://oapi.dingtalk.com/topapi/v2/user/getuserinfo?access_token=${accessToken}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    },
  )
  const ui = await uiRes.json()
  const dingUserId = ui?.result?.userid
  if (!dingUserId)
    throw new Error(`getuserinfo failed: ${JSON.stringify(ui)}`) // :contentReference[oaicite:8]{index=8}

  // 查用户详情拿工号（可能字段名是 job_number 或 jobNumber）
  const detailRes = await fetch(
    `https://oapi.dingtalk.com/topapi/v2/user/get?access_token=${accessToken}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userid: dingUserId }),
    },
  )
  const detail = await detailRes.json()
  const jobNumber = detail?.result?.job_number ?? detail?.result?.jobNumber // :contentReference[oaicite:9]{index=9}

  const userForChat = `${jobNumber || dingUserId}` // 以工号为主，缺失则退回 userid

  // 构造前端包所需的签名参数（使用 Asia/Shanghai 时区）
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
  const parts = formatter.formatToParts(new Date())
  const ts
    = parts.find(p => p.type === 'year')!.value
    + parts.find(p => p.type === 'month')!.value
    + parts.find(p => p.type === 'day')!.value
    + parts.find(p => p.type === 'hour')!.value
    + parts.find(p => p.type === 'minute')!.value
    + parts.find(p => p.type === 'second')!.value // YYYYMMDDHHmmss
  const verify = crypto
    .createHash('md5')
    .update(`${userForChat}${ts}${VERIFY_KEY}`)
    .digest('hex')

  const url = new URL(CHAT_REDIRECT_BASE!) // 例如 https://chat.myhospital.local/
  url.searchParams.set('userid', userForChat)
  url.searchParams.set('current', ts)
  url.searchParams.set('verify', verify)

  return NextResponse.json({
    redirect: url.toString(),
    userid: dingUserId,
    jobNumber: jobNumber || null,
  })
}
