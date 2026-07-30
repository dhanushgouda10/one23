package com.one23.one23.email.service;

import jakarta.annotation.PostConstruct;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailAuthenticationException;
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * Sends the "Welcome to One23" email after a user signs up.
 
 * Uses Spring's JavaMailSender, which Spring Boot auto-configures for us
 * from the `spring.mail.*` properties in application.properties (see that
 * file for Gmail SMTP setup). To switch providers later (Outlook, Mailtrap,
 * SendGrid SMTP, etc.) you only need to change those properties — nothing
 * in this class needs to change.
 */
@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    // The "From" address shown on the email. For Gmail SMTP this should be
    // the same Gmail address you're authenticating with.
    @Value("${app.mail.from}")
    private String fromAddress;

    // Link used by the "Login Now" button — points at the React frontend.
    @Value("${app.frontend.login-url}")
    private String loginUrl;

    // The SMTP username resolved from ONE23_MAIL_USERNAME (injected for the
    // startup config check below — not used in the actual send path).
    @Value("${spring.mail.username:}")
    private String smtpUsername;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Logs the resolved SMTP username at startup so you can immediately
     * confirm whether ONE23_MAIL_USERNAME was picked up from .env.
     * Does NOT log the password — only whether it is blank or set.
     */
    @PostConstruct
    void logMailConfig() {
        boolean usernameSet = smtpUsername != null && !smtpUsername.isBlank();
        if (usernameSet) {
            logger.info("Mail config: SMTP username resolved to '{}' — password is {}",
                    smtpUsername,
                    "[set — value not logged]");
        } else {
            logger.warn("Mail config: SMTP username is BLANK. " +
                    "Set ONE23_MAIL_USERNAME and ONE23_MAIL_PASSWORD in your .env file. " +
                    "Welcome emails will fail until these are configured.");
        }
    }

    /**
     * Sends the welcome email to a newly registered user.
     *
     * IMPORTANT: This method intentionally never throws an exception.
     * If SMTP isn't configured yet, the internet is down, or Gmail
     * rejects the login, we simply log a warning and return — signup
     * must always succeed even if the email fails to send.
     *
     * @Async("emailTaskExecutor"): runs on the dedicated email thread pool
     * (see AsyncConfig) instead of the caller's request thread. Previously
     * this ran synchronously inside the signup HTTP request, so a slow or
     * unreachable SMTP server (connect/read/write timeouts of 5s each,
     * see application.properties) could hold the signup response open for
     * several seconds even though the signup itself had already succeeded.
     * Signup now returns as soon as the user is saved; the email is fired
     * in the background.
     */
    @Async("emailTaskExecutor")
    public void sendWelcomeEmail(String toEmail, String fullName) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();

            // "true" below = allow HTML content (multipart message)
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(toEmail);
            helper.setSubject("Welcome to One23 🚗");
            helper.setText(buildWelcomeEmailHtml(fullName), true); // true = body is HTML

            mailSender.send(mimeMessage);
            logger.info("Welcome email sent to {}", toEmail);
        } catch (MailAuthenticationException e) {
            // SMTP authentication failed — almost always one of:
            //   1. ONE23_MAIL_USERNAME / ONE23_MAIL_PASSWORD not set in .env
            //   2. A normal Gmail password was used — Gmail requires an App
            //      Password for SMTP auth (myaccount.google.com/apppasswords)
            //   3. Correct password but 2-Step Verification isn't enabled,
            //      which also blocks App Passwords — enable 2SV first.
            logger.warn("Could not send welcome email to {} — SMTP authentication failed. " +
                    "Check that ONE23_MAIL_USERNAME and ONE23_MAIL_PASSWORD are set in .env " +
                    "and that ONE23_MAIL_PASSWORD is a Gmail App Password, not your account password. " +
                    "Detail: {}", toEmail, e.getMessage());
        } catch (MailSendException e) {
            // Network-level failure (host unreachable, connection refused, TLS
            // handshake error, etc.) — credentials may be fine but SMTP host
            // is down or blocked by a firewall / ISP.
            logger.warn("Could not send welcome email to {} — SMTP send failed (network or " +
                    "host issue). Detail: {}", toEmail, e.getMessage());
        } catch (Exception e) {
            // Catch-all for any other unexpected failure so email never blocks
            // or fails the signup request.
            logger.warn("Could not send welcome email to {}: {}", toEmail, e.getMessage());
        }
    }

    // Builds a simple, inline-styled HTML email body.
    // Inline styles are used on purpose — most email clients (Gmail,
    // Outlook) strip out <style> tags, so styling has to live on each tag.
    private String buildWelcomeEmailHtml(String fullName) {
        String safeName = (fullName == null || fullName.isBlank()) ? "there" : fullName;

        return """
                <div style="font-family: Arial, sans-serif; background-color: #f6f7f8; padding: 32px;">
                  <div style="max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 32px; text-align: center;">
                    <h1 style="color: #10c95a; margin-bottom: 4px;">Welcome to One23 🎉</h1>
                    <p style="font-size: 16px; color: #1a1a2e; margin-top: 0;">Hi %s,</p>
                    <p style="font-size: 15px; color: #4b5563; line-height: 1.6;">
                      Thank you for signing up! We're excited to have you on board.
                      With One23 you can quickly find and join rides with people
                      heading the same way as you.
                    </p>
                    <a href="%s"
                       style="display: inline-block; margin-top: 20px; padding: 12px 28px;
                              background-color: #10c95a; color: #ffffff; text-decoration: none;
                              border-radius: 8px; font-weight: bold;">
                      Login Now
                    </a>
                    <p style="font-size: 12px; color: #9ca3af; margin-top: 28px;">
                      If you did not create this account, you can safely ignore this email.
                    </p>
                  </div>
                </div>
                """.formatted(safeName, loginUrl);
    }
}
