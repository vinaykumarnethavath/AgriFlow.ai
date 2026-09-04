import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import httpx
from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path

# Get the path to the .env file in the backend directory
ENV_PATH = Path(__file__).parent.parent / ".env"

class MailSettings(BaseSettings):
    smtp_user: str = "your-email@gmail.com"
    smtp_password: str = "your-app-password"
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 465
    smtp_use_ssl: bool = True
    smtp_use_starttls: bool = False
    smtp_timeout_seconds: int = 20

    resend_api_key: str = ""
    resend_from: str = ""

    brevo_api_key: str = ""
    brevo_sender_email: str = ""
    brevo_sender_name: str = "AgriFlow"

    model_config = SettingsConfigDict(
        env_file=str(ENV_PATH) if ENV_PATH.exists() else ".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

mail_settings = MailSettings()

# Debugging: Print loaded settings (masked)
print(f"DEBUG: Mail account: {mail_settings.smtp_user}")
if mail_settings.brevo_api_key:
    print("OK: Brevo HTTP API is configured.", flush=True)
elif mail_settings.resend_api_key:
    print("OK: Resend HTTP API is configured.", flush=True)
elif mail_settings.smtp_password == "your-app-password":
    print("WARNING: Mail system is using DEFAULT password placeholder! On deployed servers, add SMTP_USER/SMTP_PASSWORD or BREVO_API_KEY to environment variables.", flush=True)
else:
    print("OK: Mail system loaded custom SMTP password.", flush=True)


def _send_email(to_email: str, subject: str, text: str, html: str) -> bool:
    # 1. Try Brevo HTTP API (Port 443 - Never blocked on Railway/Render/Fly.io)
    brevo_api_key = (getattr(mail_settings, "brevo_api_key", "") or "").strip()
    if brevo_api_key:
        sender_email = (getattr(mail_settings, "brevo_sender_email", "") or "").strip() or mail_settings.smtp_user
        sender_name = getattr(mail_settings, "brevo_sender_name", "AgriFlow") or "AgriFlow"
        try:
            print(f"DEBUG: Sending email via Brevo HTTP API to={to_email} from={sender_email}", flush=True)
            resp = httpx.post(
                "https://api.brevo.com/v3/smtp/email",
                headers={
                    "api-key": brevo_api_key,
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                json={
                    "sender": {"name": sender_name, "email": sender_email},
                    "to": [{"email": to_email}],
                    "subject": subject,
                    "htmlContent": html,
                    "textContent": text,
                },
                timeout=15.0,
            )
            if resp.status_code in (200, 201):
                print(f"OK: Email successfully sent via Brevo to {to_email}", flush=True)
                return True
            else:
                print(f"WARNING: Brevo API returned status={resp.status_code}: {resp.text}. Trying next provider...", flush=True)
        except Exception as brevo_err:
            print(f"WARNING: Brevo HTTP error ({brevo_err}). Trying next provider...", flush=True)

    # 2. Try Resend HTTP API (Port 443 - Never blocked on cloud platforms)
    resend_api_key = (getattr(mail_settings, "resend_api_key", "") or "").strip()
    resend_from = (getattr(mail_settings, "resend_from", "") or "").strip()
    if resend_api_key:
        if not resend_from:
            resend_from = "AgriFlow <onboarding@resend.dev>"
        elif any(pub in resend_from.lower() for pub in ["@gmail.com", "@yahoo.com", "@outlook.com", "@hotmail.com"]):
            print(f"WARNING: RESEND_FROM is set to a public email ({resend_from}). Resend requires 'onboarding@resend.dev' or a custom verified domain. Falling back to 'AgriFlow <onboarding@resend.dev>'", flush=True)
            resend_from = "AgriFlow <onboarding@resend.dev>"

        try:
            print(f"DEBUG: Sending email via Resend to={to_email} from={resend_from}", flush=True)
            resp = httpx.post(
                "https://api.resend.com/emails",
                headers={
                    "Authorization": f"Bearer {resend_api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "from": resend_from,
                    "to": [to_email],
                    "subject": subject,
                    "text": text,
                    "html": html,
                },
                timeout=15.0,
            )
            if resp.status_code in (200, 201):
                print(f"OK: Email successfully sent via Resend to {to_email}", flush=True)
                return True
            else:
                print(f"WARNING: Resend failed (status={resp.status_code}): {resp.text}. Falling back to SMTP...", flush=True)
        except Exception as resend_err:
            print(f"WARNING: Resend error ({resend_err}). Falling back to SMTP...", flush=True)

    # 3. Fallback to Direct SMTP (Works on localhost, frequently blocked on cloud platforms)
    message = MIMEMultipart("alternative")
    message["Subject"] = subject
    message["From"] = mail_settings.smtp_user
    message["To"] = to_email

    part1 = MIMEText(text, "plain")
    part2 = MIMEText(html, "html")
    message.attach(part1)
    message.attach(part2)

    host = mail_settings.smtp_host
    port = int(mail_settings.smtp_port)
    timeout = int(getattr(mail_settings, "smtp_timeout_seconds", 20) or 20)
    use_ssl = bool(getattr(mail_settings, "smtp_use_ssl", False))
    use_starttls = bool(getattr(mail_settings, "smtp_use_starttls", False))

    if port == 465:
        use_ssl = True
        use_starttls = False
    elif port == 587:
        use_ssl = False
        use_starttls = True

    print(f"DEBUG: SMTP connect host={host} port={port} ssl={use_ssl} starttls={use_starttls} timeout={timeout}", flush=True)

    context = ssl.create_default_context()
    try:
        if use_ssl:
            with smtplib.SMTP_SSL(host, port, context=context, timeout=timeout) as server:
                server.login(mail_settings.smtp_user, mail_settings.smtp_password)
                server.sendmail(mail_settings.smtp_user, to_email, message.as_string())
            return True

        with smtplib.SMTP(host, port, timeout=timeout) as server:
            server.ehlo()
            if use_starttls:
                server.starttls(context=context)
                server.ehlo()
            server.login(mail_settings.smtp_user, mail_settings.smtp_password)
            server.sendmail(mail_settings.smtp_user, to_email, message.as_string())
        return True
    except smtplib.SMTPAuthenticationError as auth_err:
        print(f"ERROR: Gmail/SMTP authentication rejected: {auth_err}. Make sure you are using a 16-character Google App Password (not your normal account password).", flush=True)
        raise auth_err
    except (OSError, TimeoutError) as net_err:
        print(f"ERROR: Outbound SMTP connection failed ({net_err}). Cloud platforms (Railway, Render, Fly.io, AWS) block SMTP ports 465 and 587 by default. Fix: Set BREVO_API_KEY (recommended free HTTP API) or RESEND_API_KEY in your deployed environment variables.", flush=True)
        raise net_err

def send_registration_otp_email(to_email: str, otp: str, role: str):
    """Sends an account verification OTP email during registration."""
    role_label = role.replace("_", " ").title()
    try:
        subject = "AgriFlow - Verify Your Email"
        text = f"Your AgriFlow email verification code is: {otp}. This code expires in 10 minutes."
        html = f"""
        <html>
          <body style="font-family: Arial, sans-serif; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
              <h2 style="color: #166534; text-align: center;">Verify Your AgriFlow Account</h2>
              <p>Hello,</p>
              <p>You are creating an <strong>{role_label}</strong> account on AgriFlow. Use the code below to verify your email:</p>
              <div style="background-color: #f0fdf4; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                <span style="font-size: 36px; font-weight: bold; color: #16a34a; letter-spacing: 8px;">{otp}</span>
              </div>
              <p>This code will expire in <strong>10 minutes</strong>. If you did not try to register, please ignore this email.</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
              <p style="font-size: 12px; color: #666; text-align: center;">AgriFlow - Connecting Farmers &amp; Markets</p>
            </div>
          </body>
        </html>
        """

        _send_email(to_email=to_email, subject=subject, text=text, html=html)

        print(f"OK: Registration OTP email sent to {to_email}", flush=True)
        return True
    except Exception as e:
        print(f"ERROR: Failed to send registration OTP email: {e}", flush=True)
        import traceback
        traceback.print_exc()
        return False


def send_otp_email(to_email: str, otp: str):
    """Sends an OTP email using Gmail SMTP."""
    
    try:
        subject = "AgriFlow - Password Reset OTP"
        # Plain-text and HTML versions
        text = f"Your AgriFlow password reset OTP is: {otp}. This code expires in 10 minutes."
        html = f"""
        <html>
          <body style="font-family: Arial, sans-serif; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
              <h2 style="color: #166534; text-align: center;">AgriFlow Password Reset</h2>
              <p>Hello,</p>
              <p>You requested a password reset for your AgriFlow account. Please use the following One-Time Password (OTP) to proceed:</p>
              <div style="background-color: #f0fdf4; padding: 20px; text-align: center; border-radius: 8px;">
                <span style="font-size: 32px; font-weight: bold; color: #16a34a; letter-spacing: 5px;">{otp}</span>
              </div>
              <p style="margin-top: 20px;">This code will expire in <strong>10 minutes</strong>. If you did not request this, please ignore this email.</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
              <p style="font-size: 12px; color: #666; text-align: center;">AgriFlow - Connecting Farmers & Markets</p>
            </div>
          </body>
        </html>
        """

        _send_email(to_email=to_email, subject=subject, text=text, html=html)
        
        print(f"OK: OTP Email sent successfully to {to_email}", flush=True)
        return True
    except Exception as e:
        print(f"ERROR: Failed to send email: {e}", flush=True)
        import traceback
        traceback.print_exc()
        return False
