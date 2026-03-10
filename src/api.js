export const BASE_URL = "http://localhost:4000";
const API_URL = `${BASE_URL}/api`;

async function checkResponse(response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = body.error || response.statusText || "API Error";
    throw new Error(error);
  }
  return body;
}

export async function getDashboardStats() {
  const response = await fetch(`${API_URL}/dashboard`);
  return checkResponse(response);
}

export async function getClientDashboardStats(username) {
  const response = await fetch(`${API_URL}/client-dashboard/${username}`);
  return checkResponse(response);
}

export async function getClientProfile(username) {
  const response = await fetch(`${API_URL}/client-profile/${username}`);
  return checkResponse(response);
}

export async function getClients() {
  const response = await fetch(`${API_URL}/clients`);
  return checkResponse(response);
}

export async function createClient(client) {
  const response = await fetch(`${API_URL}/clients`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(client),
  });
  return checkResponse(response);
}

export async function getLawyers() {
  const response = await fetch(`${API_URL}/lawyers`);
  return checkResponse(response);
}

export async function createLawyer(lawyer) {
  const response = await fetch(`${API_URL}/lawyers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(lawyer),
  });
  return checkResponse(response);
}

export async function getJudges() {
  const response = await fetch(`${API_URL}/judges`);
  return checkResponse(response);
}

export async function createJudge(judge) {
  const response = await fetch(`${API_URL}/judges`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(judge),
  });
  return checkResponse(response);
}

export async function getCases() {
  const response = await fetch(`${API_URL}/cases`);
  return checkResponse(response);
}

export async function createCase(caseData) {
  const response = await fetch(`${API_URL}/cases`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(caseData),
  });
  return checkResponse(response);
}

export async function createDocument(formData) {
  const response = await fetch(`${API_URL}/documents`, {
    method: "POST",
    // When sending FormData, DO NOT set Content-Type header. Browser handles it and the multipart boundary.
    body: formData,
  });
  return checkResponse(response);
}

export async function getHearings() {
  const response = await fetch(`${API_URL}/hearings`);
  return checkResponse(response);
}

export async function createHearing(hearing) {
  const response = await fetch(`${API_URL}/hearings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(hearing),
  });
  return checkResponse(response);
}

export async function updateHearing(id, data) {
  const response = await fetch(`${API_URL}/hearings/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return checkResponse(response);
}

export async function createReport(report) {
  const response = await fetch(`${API_URL}/reports`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(report),
  });
  return checkResponse(response);
}


export async function createNotification(notification) {
  const response = await fetch(`${API_URL}/notifications`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(notification),
  });
  return checkResponse(response);
}

export async function userLogin(user) {
  const response = await fetch(`${API_URL}/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });
  return checkResponse(response);
}

export async function userRegister(user) {
  const response = await fetch(`${API_URL}/users/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });
  return checkResponse(response);
}

export async function clientSignUp(data) {
  const response = await fetch(`${API_URL}/clients/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return checkResponse(response);
}

export async function clientLogin(credentials) {
  const response = await fetch(`${API_URL}/clients/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  return checkResponse(response);
}

export async function getNotifications(userId) {
  const url = userId ? `${API_URL}/notifications?user_id=${userId}` : `${API_URL}/notifications`;
  const response = await fetch(url);
  return checkResponse(response);
}

export async function deleteNotification(id) {
  const response = await fetch(`${API_URL}/notifications/${id}`, { method: "DELETE" });
  return checkResponse(response);
}

export async function clearAllNotifications(userId) {
  const url = userId ? `${API_URL}/notifications?user_id=${userId}` : `${API_URL}/notifications`;
  const response = await fetch(url, { method: "DELETE" });
  return checkResponse(response);
}
