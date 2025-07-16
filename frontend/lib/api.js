const API_BASE_URL = "http://localhost:3001/api"; // sesuaikan dengan base URL backend kamu

// Fungsi login
export async function loginUser(email, password) {
  const response = await fetch(`${API_BASE_URL}/users/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Login failed");
  }

  // ✅ Simpan token ke localStorage
  localStorage.setItem("token", data.token);

  return data; // data.token, data.user, dsb
}

// Fungsi register (contoh)
export async function registerUser({ name, email, password }) {
  const response = await fetch(`${API_BASE_URL}/users/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Register failed");
  }

  return data;
}

// Fungsi get user by token (opsional)
export async function getCurrentUser(token) {
  const response = await fetch(`${API_BASE_URL}/users/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch user");
  }

  return data;
}

export async function fetchWithToken(url, token) {
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch: ${res.status}`);
  }

  return await res.json();
}
