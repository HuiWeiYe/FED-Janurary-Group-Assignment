document.addEventListener("DOMContentLoaded", () => {
  // Firebase services
  const auth = firebase.auth();
  const db = firebase.firestore();

  // DOM references 
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const logoutBtn = document.getElementById("logoutBtn");
  const resetPwBtn = document.getElementById("resetPwBtn");

  /**
   * selectedRole = which portal the user chose (customer / vendor / staff)
   */
  const selectedRole = (sessionStorage.getItem("selectedRole") || "customer").toLowerCase();

  /**
   * UI: hide registration link on staff portals
   * Staff accounts should be pre-approved (allowlist)
   */
  const registerRow = document.getElementById("registerRow");
  if (registerRow && (selectedRole === "admin" || selectedRole === "vendor")) {
    registerRow.style.display = "none";
  }

  /**
   * Redirect user to the correct page based on their role.
   * Customer -> customer-home.html
   * Vendor -> vendor-home.html
   * NEA -> nea-home.html
   * Admin -> admin-management.html
   */
  function redirectByRole(role) {
    if (role === "admin") window.location.href = "admin-management.html";
    else if (role === "nea") window.location.href = "nea-home.html";
    else if (role === "vendor") window.location.href = "vendor-home.html";
    else window.location.href = "../../YuWenwork/CustomerHomepage/Assignment.html";
  }

  /**
   * STAFF GATE:
   * allowedAccounts/{emailLower} is used to control which staff emails are allowed.
   * - allowedRoles is an array of roles that can access the current portal.
   * - returns { ok: boolean, role: string|null }
   */
  async function checkAllowlistForStaff(emailLower, allowedRoles) {
    const snap = await db.collection("allowedAccounts").doc(emailLower).get();
    if (!snap.exists) return { ok: false, role: null };

    const data = snap.data() || {};

    const role = (data.role || "").toLowerCase();
    return { ok: allowedRoles.includes(role), role };
  }

  /**
   * PROFILE GATE:
   * users/{uid} stores the user's profile + role + status.
   * - if missing -> deny access
   * - if disabled -> deny access
   */
  async function getAndValidateUserProfile(uid) {
    const userSnap = await db.collection("users").doc(uid).get();

    if (!userSnap.exists) {
      return { ok: false, reason: "Access denied: user profile not found." };
    }

    const userData = userSnap.data() || {};
    const status = (userData.status || "active").toLowerCase();

    if (status === "disabled") {
      return { ok: false, reason: "Access denied: your account is disabled." };
    }

    return { ok: true, userData };
  }

  // =========================
  // LOGIN
  // =========================
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
        // 1) Firebase Authentication: verify email/password
        const result = await auth.signInWithEmailAndPassword(emailLower, password);
        const uid = result.user.uid;

        // 2) Firestore: verify user profile exists and is not disabled
        const profile = await getAndValidateUserProfile(uid);
        if (!profile.ok) {
          await auth.signOut();
          alert(profile.reason);
          return;
        }

        // This is the user's role from database
        const firestoreRole = (profile.userData.role || "customer").toLowerCase();

        // 3) Portal logic (selectedRole is the portal)
        // ------------------------------------------------
        // STAFF PORTAL: NEA & Admin
        if (selectedRole === "staff") {
          // Allowlist must contain role admin OR nea
          const allow = await checkAllowlistForStaff(emailLower, ["admin", "nea"]);
          if (!allow.ok) {
            await auth.signOut();
            alert("Not approved to access the staff portal.");
            return;
          }

          // Firestore role must also be admin OR nea (prevents customer entering admin portal)
          if (firestoreRole !== "admin" && firestoreRole !== "nea") {
            await auth.signOut();
            alert("Role mismatch. Your account is not a staff account.");
            return;
          }

          // Redirect based on user's actual Firestore role
          redirectByRole(firestoreRole);
          return;
        }

        // VENDOR PORTAL: only vendor accounts
        if (selectedRole === "vendor") {
          const allow = await checkAllowlistForStaff(emailLower, ["vendor"]);
          if (!allow.ok) {
            await auth.signOut();
            alert("Not approved to access the vendor portal.");
            return;
          }

          if (firestoreRole !== "vendor") {
            await auth.signOut();
            alert("Role mismatch. Please use the correct portal.");
            return;
          }

          redirectByRole("vendor");
          return;
        }

        // CUSTOMER PORTAL: only customers
        if (firestoreRole !== "customer") {
          await auth.signOut();
          alert("Please use the correct staff portal for your account.");
          return;
        }

        redirectByRole("customer");
      } catch (err) {
        console.error(err);
        alert(err.message);
      }
    });
  }

  // =========================
  // REGISTER (Customer only)
  // =========================
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("email")?.value?.trim();
      const password = document.getElementById("password")?.value;

      // Optional fields (only stored if inputs exist)
      const name = document.getElementById("name")?.value?.trim() || "";
      const phone = document.getElementById("phone")?.value?.trim() || "";

      if (!email || !password) {
        alert("Please enter email and password.");
        return;
      }

      const emailLower = email.toLowerCase();

      // Block staff registration from UI
      if (selectedRole === "staff" || selectedRole === "vendor") {
        alert("Registration is only available for customers.");
        return;
      }

      try {
        // Create Auth account
        const cred = await auth.createUserWithEmailAndPassword(emailLower, password);
        const uid = cred.user.uid;

        // Create Firestore profile record for app logic + admin management
        await db.collection("users").doc(uid).set({
          name,
          email: emailLower,
          phone,
          role: "customer",
        });

        redirectByRole("customer");
      } catch (err) {
        console.error(err);
        alert(err.message);
      }
    });
  }

  // =========================
  // RESET PASSWORD
  // =========================
  if (resetPwBtn) {
    resetPwBtn.addEventListener("click", async () => {
      const email = document.getElementById("email")?.value?.trim();
      if (!email) {
        alert("Enter your email first.");
        return;
      }

      const emailLower = email.toLowerCase();

      try {
        // If user is on a staff portal, only allow reset if allowlisted for that portal
        if (selectedRole === "staff") {
          const allow = await checkAllowlistForStaff(emailLower, ["admin", "nea"]);
          if (!allow.ok) {
            alert("This email is not approved for the admin portal.");
            return;
          }
        } else if (selectedRole === "vendor") {
          const allow = await checkAllowlistForStaff(emailLower, ["vendor"]);
          if (!allow.ok) {
            alert("This email is not approved for the vendor portal.");
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

  // =========================
  // LOGOUT
  // =========================
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await auth.signOut();
      window.location.href = "login.html";
    });
  }
});
