import type { IOnCompleted, IOnData, IOnError, IOnFile, IOnMessageEnd, IOnMessageReplace, IOnNodeFinished, IOnNodeStarted, IOnThought, IOnWorkflowFinished, IOnWorkflowStarted } from './base'
import { get, post, ssePost, del } from './base'
import type { Feedbacktype } from '@/types/app'
import { getUrlParams } from '@/utils/auth';

export const sendChatMessage = async (
  body: Record<string, any>,
  {
    onData,
    onCompleted,
    onThought,
    onFile,
    onError,
    getAbortController,
    onMessageEnd,
    onMessageReplace,
    onWorkflowStarted,
    onNodeStarted,
    onNodeFinished,
    onWorkflowFinished,
  }: {
    onData: IOnData
    onCompleted: IOnCompleted
    onFile: IOnFile
    onThought: IOnThought
    onMessageEnd: IOnMessageEnd
    onMessageReplace: IOnMessageReplace
    onError: IOnError
    getAbortController?: (abortController: AbortController) => void
    onWorkflowStarted: IOnWorkflowStarted
    onNodeStarted: IOnNodeStarted
    onNodeFinished: IOnNodeFinished
    onWorkflowFinished: IOnWorkflowFinished
  },
) => {
  const { userid } = getUrlParams();
  return ssePost('chat-messages', {
    body: {
      ...body,
      response_mode: 'streaming',
      user: userid,
    },
  }, { onData, onCompleted, onThought, onFile, onError, getAbortController, onMessageEnd, onMessageReplace, onNodeStarted, onWorkflowStarted, onWorkflowFinished, onNodeFinished })
}

export const fetchConversations = async () => {
  const { userid } = getUrlParams();
  return get('conversations', { 
    params: { 
      limit: 100, 
      first_id: '',
      user: userid 
    } 
  })
}

export const fetchChatList = async (conversationId: string) => {
  const { userid } = getUrlParams();
  return get('messages', { 
    params: { 
      conversation_id: conversationId, 
      limit: 20, 
      last_id: '',
      user: userid
    } 
  })
}

// init value. wait for server update
export const fetchAppParams = async () => {
  const { userid } = getUrlParams();
  return get('parameters', {
    params: {
      user: userid
    }
  })
}

export const updateFeedback = async ({ url, body }: { url: string; body: Feedbacktype }) => {
  const { userid } = getUrlParams();
  return post(url, { 
    body: {
      ...body,
      user: userid
    }
  })
}

export const generationConversationName = async (id: string) => {
  const { userid } = getUrlParams();
  return post(`conversations/${id}/name`, { 
    body: { 
      auto_generate: true,
      user: userid 
    } 
  })
}

export const deleteConversation = async (conversationId: string) => {
  const { userid } = getUrlParams();
  return del(`conversations/${conversationId}`, { 
    body: { 
      user: userid 
    } 
  })
}
