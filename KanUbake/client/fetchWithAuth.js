// Patches window.fetch globally.
// Any fetch() to localhost:3010 automatically gets the access token attached.
// If the token is expired (401), it fetches a new one using the refresh token and retries.
// All other fetch() calls (auth server, external APIs, HTML files) pass through untouched.

(function () {
  const originalFetch = window.fetch.bind(window);

  window.fetch = async function (url, options = {}) {
    // only intercept calls to the main server
    if (typeof url !== "string" || !url.includes("localhost:3010")) {
      return originalFetch(url, options);
    }

    const accessToken = localStorage.getItem("accessToken");

    // attach the access token to the request
    const authOptions = {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${accessToken}`,
      },
    };

    let response = await originalFetch(url, authOptions);

    // access token expired → try to get a new one using the refresh token
    if (response.status === 401) {
      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        redirectToLogin();
        return response;
      }

      const refreshResponse = await originalFetch("http://localhost:4010/token", {
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
      response = await originalFetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${data.accessToken}`,
        },
      });
    }

    return response;
  };

  function redirectToLogin() {
    window.location.href = "/LogIn-SinUp/html/LogIn.html";
  }
})();
