/*
 * Author: Lai Yan (S10274594G)
 * 
 * Portal selection:
 * - sessionStorage.selectedRole = "customer" | "vendor" | "staff"
 * - staff portal allows roles: admin, nea
 */

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
   * UI: hide registration link on staff/vendor portals (pre-approved accounts only)
   */
  const registerRow = document.getElementById("registerRow");
  if (registerRow && (selectedRole === "staff" || selectedRole === "vendor")) {
    registerRow.style.display = "none";
  }

  /**
   * Redirect user to the correct page based on their actual role.
   * Customer -> Yu Wen customer homepage
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
   * PROFILE GATE:
   * users/{uid} stores the user's profile + role + status.
   * - if missing -> deny access
   * - if inactive/disabled -> deny access
   */
  async function getAndValidateUserProfile(uid) {
    const userSnap = await db.collection("users").doc(uid).get();

    if (!userSnap.exists) {
      return { ok: false, reason: "Access denied: user profile not found." };
    }

    const userData = userSnap.data() || {};
    const status = (userData.status || "active").toLowerCase();

    // Support both "inactive" and "disabled" as blocked states
    if (status === "inactive" || status === "disabled") {
      return { ok: false, reason: "Access denied: your account is inactive." };
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

        // 2) Firestore: verify user profile exists and is active
        const profile = await getAndValidateUserProfile(uid);
        if (!profile.ok) {
          await auth.signOut();
          alert(profile.reason);
          return;
        }

        // Role from Firestore 
        const firestoreRole = (profile.userData.role || "customer").toLowerCase();

        // 3) Portal logic (selectedRole is the portal)
        // ------------------------------------------------

        // STAFF PORTAL: only admin or nea accounts
        if (selectedRole === "staff") {
          if (firestoreRole !== "admin" && firestoreRole !== "nea") {
            await auth.signOut();
            alert("Not approved to access the staff portal.");
            return;
          }
          redirectByRole(firestoreRole);
          return;
        }

        // VENDOR PORTAL: only vendor accounts
        if (selectedRole === "vendor") {
          if (firestoreRole !== "vendor") {
            await auth.signOut();
            alert("Not approved to access the vendor portal.");
            return;
          }
          redirectByRole("vendor");
          return;
        }

        // CUSTOMER PORTAL: only customer accounts
        if (firestoreRole !== "customer") {
          await auth.signOut();
          alert("Please use the correct portal for your account.");
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

      // Block staff/vendor registration
      if (selectedRole === "staff" || selectedRole === "vendor") {
        alert("Registration is only available for customers.");
        return;
      }

      const emailLower = email.toLowerCase();

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
          status: "active",
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
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
        // Password reset is handled by Firebase Auth.
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
      sessionStorage.clear();
      window.location.href = "login.html";
    });
  }
});
