// src/api/ai.js
import api from './client'

export async function callAI({ system, messages, max_tokens = 1024 }) {
  const { data } = await api.post('/ai/chat', { system, messages, max_tokens })
  return data.text
}
