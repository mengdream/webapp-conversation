import { type NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { client, getInfo, setSession } from '@/app/api/utils/common'

export async function DELETE(request: NextRequest, { params }: { params: { conversationId: string } }) {
  const { sessionId, user } = getInfo(request)
  try {
    const { conversationId } = params
    const { data }: any = await client.deleteConversation(conversationId, user)
    return NextResponse.json(data, {
      headers: setSession(sessionId),
    })
  }
  catch (error: any) {
    return NextResponse.json({
      error: error.message,
    }, { status: 500 })
  }
}