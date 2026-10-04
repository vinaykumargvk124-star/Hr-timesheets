import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn, signOut } from "./auth";
import { MIN_PASSWORD_LENGTH, findValidToken, setPasswordWithToken } from "./password";

async function googleSignIn() {
  "use server";
  await signIn("google", { redirectTo: "/" });
}

async function passwordSignIn(formData: FormData) {
  "use server";
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/",
    });
  } catch (error) {
    if (error instanceof AuthError) redirect("/login?error=CredentialsSignin");
    throw error; // successful sign-in redirects by throwing
  }
}

async function doSignOut() {
  "use server";
  await signOut({ redirectTo: "/login" });
}

async function submitNewPassword(formData: FormData) {
  "use server";
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  const back = `/set-password?token=${encodeURIComponent(token)}`;
  if (password !== confirm) redirect(`${back}&error=${encodeURIComponent("Passwords do not match.")}`);
  const error = await setPasswordWithToken(token, password);
  if (error) redirect(`${back}&error=${encodeURIComponent(error)}`);
  redirect("/login?notice=password-set");
}

function loginMessage(error?: string) {
  if (!error) return null;
  if (error === "AccessDenied") {
    return "That Google account has not been added yet. Ask your admin to add your email.";
  }
  if (error === "CredentialsSignin") {
    return "Wrong email or password, or the account is temporarily locked.";
  }
  return "Sign-in failed. Please try again.";
}

export function LoginScreen(props: { site: string; error?: string; notice?: string }) {
  const message = loginMessage(props.error);
  return (
    <main className="card">
      <h1>TimeNod</h1>
      <p className="muted">{props.site}</p>
      {props.notice === "password-set" && <p className="ok">Password set. You can sign in now.</p>}
      {message && <p className="err">{message}</p>}
      <form action={googleSignIn}>
        <button className="btn google" type="submit">Sign in with Google</button>
      </form>
      <div className="or">or</div>
      <form action={passwordSignIn}>
        <label>
          Email
          <input name="email" type="email" autoComplete="username" required />
        </label>
        <label>
          Password
          <input name="password" type="password" autoComplete="current-password" required />
        </label>
        <button className="btn" type="submit">Sign in</button>
      </form>
      <p className="muted small">No password yet? Ask your admin for a set-password link.</p>
    </main>
  );
}

export async function SetPasswordScreen(props: { token?: string; error?: string }) {
  const row = await findValidToken(props.token ?? "");
  if (!row) {
    return (
      <main className="card">
        <h1>Link not valid</h1>
        <p className="err">This link is invalid, already used, or expired. Ask your admin for a new one.</p>
        <a href="/login">Back to sign-in</a>
      </main>
    );
  }
  return (
    <main className="card">
      <h1>Set your password</h1>
      <p className="muted">{row.user.email}</p>
      {props.error && <p className="err">{props.error}</p>}
      <form action={submitNewPassword}>
        <input type="hidden" name="token" value={props.token} />
        <label>
          New password (at least {MIN_PASSWORD_LENGTH} characters)
          <input name="password" type="password" autoComplete="new-password" minLength={MIN_PASSWORD_LENGTH} required />
        </label>
        <label>
          Confirm password
          <input name="confirm" type="password" autoComplete="new-password" minLength={MIN_PASSWORD_LENGTH} required />
        </label>
        <button className="btn" type="submit">Save password</button>
      </form>
    </main>
  );
}

export function Shell(props: { site: string; userName: string; role: string; children: ReactNode }) {
  return (
    <>
      <header className="top">
        <strong>TimeNod</strong>
        <span className="muted">{props.site}</span>
        <span className="spacer" />
        <span>
          {props.userName} <span className="tag">{props.role.toLowerCase()}</span>
        </span>
        <form action={doSignOut}>
          <button className="link" type="submit">Sign out</button>
        </form>
      </header>
      <main className="page">{props.children}</main>
    </>
  );
}
