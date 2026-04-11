import { render } from "emailmd";
import { createTransport, Transporter } from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";

const APP_INFO = {
  name: "MY_APP",
  link: "https://my-domain.com/",
  logo: "https://my-domain.com/assets/images/logo/logo-small.png",
  logoHeight: "30px",
  from: "MY_APP <noreply@auth.my-domain.com>",
};

class Mailer {
  transporter: Transporter;
  logToConsole: boolean;

  constructor({
    smtpSettings,
    logToConsole = false,
  }: {
    smtpSettings: SMTPTransport.Options;
    logToConsole?: boolean;
  }) {
    this.transporter = createTransport(smtpSettings);
    this.logToConsole = logToConsole;
  }

  sendMail({
    subject,
    to,
    from,
    html,
    text,
  }: {
    subject: string;
    to: string;
    from?: string;
    text: string;
    html: string;
  }) {
    if (this.logToConsole) {
      console.log(text);
    }
    return this.transporter.sendMail({
      subject,
      to,
      from: from ?? APP_INFO.from,
      text,
      html,
    });
  }

  sendOtpLink({ to, otp }: { to: string; otp: string }) {
    const { html, text } = render(`
---
preheader: "Use this code to log in to ${APP_INFO.name}"
---

::: header
![Logo](${APP_INFO.logo}){width="200"}
:::

Your log in code is:

::: callout

# ${otp}

:::

This code will expire in 10 minutes and can only be used once. Never share this code with anyone.

::: footer

To learn more about ${APP_INFO.name}, please visit [${APP_INFO.link}](${APP_INFO.link}).
:::
`);
    return this.sendMail({
      subject: `${APP_INFO.name} - Log in code`,
      to,
      text,
      html,
    });
  }
}

export const mailer = new Mailer({
  smtpSettings: {},
  logToConsole: true,
});
