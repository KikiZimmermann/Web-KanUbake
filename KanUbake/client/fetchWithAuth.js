// Use this instead of plain fetch() for any request to the main server (port 3010).
// If the access token has expired, it automatically gets a new one and retries.
async function fetchWithAuth(url, options = {}) {
  const accessToken = localStorage.getItem("accessToken");

  // attach the current access token to the request
  const authOptions = {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
    },
  };

  let response = await fetch(url, authOptions);

  // access token expired → try to get a new one using the refresh token
  if (response.status === 401) {
    const refreshToken = localStorage.getItem("refreshToken");

    if (!refreshToken) {
      redirectToLogin();
      return response;
    }

    const refreshResponse = await fetch("http://localhost:4010/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: refreshToken }),
    });

    if (!refreshResponse.ok) {
      // refresh token is also invalid or revoked → force login
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      redirectToLogin();
      return refreshResponse;
    }

    const data = await refreshResponse.json();
    localStorage.setItem("accessToken", data.accessToken);

    // retry the original request with the new access token
    response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${data.accessToken}`,
      },
    });
  }

  return response;
}

function redirectToLogin() {
  window.location.href = "/KanUbake/client/LogIn-SinUp/html/LogIn.html";
}
