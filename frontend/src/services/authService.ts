import { apiClient } from '@/lib/api/apiClient'

export type AuthMeResponse = {
  email?: string | null
  avatarUrl?: string | null
  avatar_url?: string | null
  profile?: {
    avatarUrl?: string | null
    avatar_url?: string | null
    picture?: string | null
  } | null
  user?: {
    email?: string | null
    avatarUrl?: string | null
    avatar_url?: string | null
  } | null
} & Record<string, unknown>

export function fetchAuthMe() {
  return apiClient.get<AuthMeResponse>('/auth/me')
}

export function extractEmailFromAuthMe(data: AuthMeResponse | null | undefined) {
  const topLevelEmail = typeof data?.email === 'string' ? data.email : null
  if (topLevelEmail) return topLevelEmail

  const nestedEmail = typeof data?.user?.email === 'string' ? data.user.email : null
  return nestedEmail ?? null
}

function firstNonEmptyString(...values: Array<unknown>): string | null {
  for (const v of values) {
    if (typeof v === 'string' && v.trim().length > 0) return v.trim()
  }
  return null
}

/** รองรับหลายรูปแบบ field จาก backend / profile */
export function extractAvatarUrlFromAuthMe(data: AuthMeResponse | null | undefined) {
  if (!data) return null
  const top = firstNonEmptyString(
    data.avatarUrl,
    data.avatar_url,
    (data as { picture?: string }).picture,
    (data as { photoUrl?: string }).photoUrl,
    (data as { imageUrl?: string }).imageUrl,
  )
  if (top) return top

  const profile = data.profile
  if (profile && typeof profile === 'object') {
    const p = firstNonEmptyString(
      profile.avatarUrl,
      profile.avatar_url,
      profile.picture,
    )
    if (p) return p
  }

  const user = data.user
  if (user && typeof user === 'object') {
    return firstNonEmptyString(user.avatarUrl, user.avatar_url, (user as { picture?: string }).picture)
  }

  return null
}
