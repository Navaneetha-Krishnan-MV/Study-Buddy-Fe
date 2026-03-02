const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/$/, '');
const AI_BASE_URL = (import.meta.env.VITE_AI_BASE_URL || 'http://localhost:8000').replace(/\/$/, '');
const TOKEN_KEY = 'token';
export const AUTH_EXPIRED_EVENT = 'studybuddy:auth-expired';

function buildQuery(params = {}) {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }
    search.set(key, String(value));
  });

  const query = search.toString();
  return query ? `?${query}` : '';
}

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token) {
  if (typeof token === 'string' && token.length) {
    localStorage.setItem(TOKEN_KEY, token);
    return;
  }

  localStorage.removeItem(TOKEN_KEY);
}

export function clearAuthToken() {
  localStorage.removeItem(TOKEN_KEY);
}

function emitAuthExpired(message) {
  clearAuthToken();

  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(AUTH_EXPIRED_EVENT, {
      detail: {
        message,
      },
    }),
  );
}

export function subscribeToAuthExpired(handler) {
  if (typeof window === 'undefined' || typeof handler !== 'function') {
    return () => {};
  }

  const listener = (event) => {
    handler(event?.detail?.message || 'Session expired. Please sign in again.');
  };

  window.addEventListener(AUTH_EXPIRED_EVENT, listener);
  return () => window.removeEventListener(AUTH_EXPIRED_EVENT, listener);
}

function authHeaders() {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function parseResponse(response) {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return response.json().catch(() => ({}));
  }

  return response.text().catch(() => '');
}

async function requestBackend(path, options = {}) {
  const {
    method = 'GET',
    auth = true,
    headers: customHeaders = {},
    body,
  } = options;

  const headers = {
    ...(auth ? authHeaders() : {}),
    ...customHeaders,
  };

  const isFormData = body instanceof FormData;
  let requestBody = body;

  if (body !== undefined && body !== null && !isFormData) {
    if (typeof body === 'string') {
      requestBody = body;
    } else {
      requestBody = JSON.stringify(body);
    }

    if (!headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: requestBody,
  });

  const payload = await parseResponse(response);

  if (!response.ok) {
    const message =
      (payload && typeof payload === 'object' && (payload.error || payload.message)) ||
      (typeof payload === 'string' && payload) ||
      `${response.status} ${response.statusText}`;

    if (auth && response.status === 401) {
      emitAuthExpired(message);
    }

    throw new Error(message);
  }

  return payload;
}

async function requestAiServer(path, options = {}) {
  const { method = 'GET', headers: customHeaders = {}, body } = options;
  const isFormData = body instanceof FormData;

  const headers = {
    ...customHeaders,
  };

  if (!isFormData && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${AI_BASE_URL}${path}`, {
    method,
    headers,
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
  });

  const payload = await parseResponse(response);

  if (!response.ok) {
    const message =
      (payload && typeof payload === 'object' && (payload.error || payload.message)) ||
      (typeof payload === 'string' && payload) ||
      `${response.status} ${response.statusText}`;

    throw new Error(message);
  }

  return payload;
}

// Auth
export async function register(data) {
  return requestBackend('/auth/register', {
    method: 'POST',
    auth: false,
    body: data,
  });
}

export async function login(emailOrPayload, password) {
  const payload =
    typeof emailOrPayload === 'object'
      ? emailOrPayload
      : { email: emailOrPayload, password };

  return requestBackend('/auth/login', {
    method: 'POST',
    auth: false,
    body: payload,
  });
}

export async function getMe() {
  return requestBackend('/auth/me');
}

// Catalog
export async function getSemesters() {
  return requestBackend('/semesters');
}

export async function getSemesterSubjects(semesterId) {
  return requestBackend(`/semesters/${semesterId}/subjects`);
}

export async function getSubjectUnits(subjectId) {
  return requestBackend(`/subjects/${subjectId}/units`);
}

export async function getHomeSummary(subjectId) {
  return requestBackend(`/subjects/${subjectId}/home-summary`);
}

// Materials
export async function getMaterials(subjectId, params = {}) {
  const query = buildQuery({
    type: params.type || undefined,
    q: params.q || undefined,
    unitId: params.unitId || undefined,
  });

  return requestBackend(`/subjects/${subjectId}/materials${query}`);
}

export async function createMaterial(payload) {
  return requestBackend('/materials', {
    method: 'POST',
    body: payload,
  });
}

export async function uploadMaterial(payload) {
  return createMaterial(payload);
}

export async function getMaterialDownloadUrl(materialId) {
  return requestBackend(`/materials/${materialId}/download`);
}

// Discussion
export async function getThreads(subjectId, params = {}) {
  const query = buildQuery({
    q: params.q || undefined,
    tag: params.tag || undefined,
    unitId: params.unitId || undefined,
    page: params.page || undefined,
    limit: params.limit || undefined,
  });

  return requestBackend(`/subjects/${subjectId}/threads${query}`);
}

export async function createThread(subjectId, body) {
  return requestBackend(`/subjects/${subjectId}/threads`, {
    method: 'POST',
    body,
  });
}

export async function getThread(threadId) {
  return requestBackend(`/threads/${threadId}`);
}

export async function addComment(threadId, textOrBody) {
  const body =
    typeof textOrBody === 'string'
      ? { text: textOrBody }
      : textOrBody;

  return requestBackend(`/threads/${threadId}/comments`, {
    method: 'POST',
    body,
  });
}

export async function voteThread(threadId, vote) {
  return requestBackend(`/threads/${threadId}/vote`, {
    method: 'PUT',
    body: { vote },
  });
}

// Quiz
export async function getQuizzes(subjectId, params = {}) {
  const query = buildQuery({
    difficulty: params.difficulty || undefined,
    q: params.q || undefined,
  });

  return requestBackend(`/subjects/${subjectId}/quizzes${query}`);
}

export async function startQuizAttempt(quizId) {
  return requestBackend(`/quizzes/${quizId}/attempts/start`, {
    method: 'POST',
  });
}

export async function submitQuizAttempt(attemptId, answers, timeLeftSeconds) {
  return requestBackend(`/quizzes/attempts/${attemptId}/submit`, {
    method: 'POST',
    body: {
      answers,
      timeLeftSeconds,
    },
  });
}

export async function getMyQuizAttempts(params = {}) {
  const query = buildQuery({
    subjectId: params.subjectId || undefined,
    quizId: params.quizId || undefined,
  });

  return requestBackend(`/users/me/quiz-attempts${query}`);
}

// Leaderboard
export async function getLeaderboard(subjectId, params = {}) {
  const query = buildQuery({
    mode: params.mode || undefined,
    unitId: params.unitId || undefined,
    limit: params.limit || undefined,
  });

  return requestBackend(`/subjects/${subjectId}/leaderboard${query}`);
}

// AI (backend)
export async function getAiQuickPrompts() {
  return requestBackend('/ai/quick-prompts');
}

export async function chatWithAi({ conversationId, subjectId, unitId, message }) {
  return requestBackend('/ai/chat', {
    method: 'POST',
    body: {
      conversationId,
      subjectId,
      unitId,
      message,
    },
  });
}

export async function getAiConversationMessages(conversationId) {
  return requestBackend(`/ai/conversations/${conversationId}/messages`);
}

// Legacy compatibility exports used by existing components.
export const downloadMaterial = getMaterialDownloadUrl;

export async function sendChatMessage(question, sessionId = null) {
  return requestAiServer('/chat', {
    method: 'POST',
    body: {
      question,
      session_id: sessionId,
    },
  });
}

export async function uploadPDF(file) {
  const formData = new FormData();
  formData.append('file', file);

  return requestAiServer('/ingest', {
    method: 'POST',
    body: formData,
  });
}

export async function startQuiz(subject, unit, difficulty) {
  return requestAiServer('/quiz/start', {
    method: 'POST',
    body: {
      subject,
      unit,
      difficulty,
    },
  });
}

export async function submitAnswer(sessionId, questionId, userAnswer) {
  return requestAiServer('/quiz/answer', {
    method: 'POST',
    body: {
      session_id: sessionId,
      question_id: questionId,
      user_answer: userAnswer,
    },
  });
}

export async function getQuizResult(sessionId) {
  return requestAiServer(`/quiz/result/${sessionId}`);
}
