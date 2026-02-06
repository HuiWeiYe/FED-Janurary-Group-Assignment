document.addEventListener("DOMContentLoaded", () => {
  const auth = firebase.auth();
  const db = firebase.firestore();

  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const logoutBtn = document.getElementById("logoutBtn");
  const resetPwBtn = document.getElementById("resetPwBtn");

  const selectedRole = (sessionStorage.getItem("selectedRole") || "customer").toLowerCase();

  // Hide register row for vendor/admin
  const registerRow = document.getElementById("registerRow");
  if (registerRow && (selectedRole === "admin" || selectedRole === "vendor")) {
    registerRow.style.display = "none";
  }

  async function checkAllowlistForStaff(emailLower) {
    const snap = await db.collection("allowedAccounts").doc(emailLower).get();
    if (!snap.exists) return false;

    const role = (snap.data().role || "").toLowerCase();
    return role === selectedRole; // selectedRole is vendor/admin here
  }

    function redirectByRole(role) {
    if (role === "admin") window.location.href = "admin-home.html";
    else if (role === "vendor") window.location.href = "vendor-home.html";
    else window.location.href = "customer-home.html";
    }


  // ----- LOGIN -----
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("email")?.value?.trim();
      const password = document.getElementById("password")?.value;

      if (!email || !password) {
        alert("Please enter email and password.");
        return;
      }

      const emailLower = email.toLowerCase();

      try {
        // 1) Sign in
        const result = await auth.signInWithEmailAndPassword(emailLower, password);

        // 2) If staff role selected, enforce allowlist + role match
        if (selectedRole === "admin" || selectedRole === "vendor") {
          const approved = await checkAllowlistForStaff(emailLower);

          if (!approved) {
            await auth.signOut();
            alert("Not approved for this role.");
            return;
          }

          redirectByRole(selectedRole);
          return;
        }

        // 3) Customer role selected
        redirectByRole("customer");
      } catch (err) {
        console.error(err);
        alert(err.message);
      }
    });
  }

  // ----- REGISTER (Customer only) -----
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("email")?.value?.trim();
      const password = document.getElementById("password")?.value;

      if (!email || !password) {
        alert("Please enter email and password.");
        return;
      }

      const emailLower = email.toLowerCase();

      // Prevent vendor/admin registration
      if (selectedRole === "admin" || selectedRole === "vendor") {
        alert("Registration is only available for customers.");
        return;
      }

      try {
        await auth.createUserWithEmailAndPassword(emailLower, password);
        redirectByRole("customer");
      } catch (err) {
        console.error(err);
        alert(err.message);
      }
    });
  }

  // ----- RESET PASSWORD -----
  if (resetPwBtn) {
    resetPwBtn.addEventListener("click", async () => {
      const email = document.getElementById("email")?.value?.trim();
      if (!email) {
        alert("Enter your email first.");
        return;
      }

      const emailLower = email.toLowerCase();

      try {
        // If staff role selected, only allow if allowlisted
        if (selectedRole === "admin" || selectedRole === "vendor") {
          const approved = await checkAllowlistForStaff(emailLower);
          if (!approved) {
            alert("This email is not approved for this role.");
            return;
          }
        }

        await auth.sendPasswordResetEmail(emailLower);
        alert("Password reset link sent. Check your email.");
      } catch (err) {
        console.error(err);
        alert(err.message);
      }
    });
  }

  // ----- LOGOUT -----
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await auth.signOut();
      window.location.href = "login.html";
    });
  }
});
