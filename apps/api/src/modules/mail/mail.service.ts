import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('mail.host'),
      port: this.configService.get<number>('mail.port'),
      secure: this.configService.get<number>('mail.port') === 465, // true for 465, false for other ports
      auth: {
        user: this.configService.get<string>('mail.user'),
        pass: this.configService.get<string>('mail.pass'),
      },
    });

    this.verifyConnection();
  }

  private async verifyConnection() {
    try {
      await this.transporter.verify();
      this.logger.log('Nodemailer is connected and ready to send emails.');
    } catch (error) {
      this.logger.error('Nodemailer configuration error:', error);
    }
  }

  async sendEmail(to: string, subject: string, html: string) {
    try {
      const info = await this.transporter.sendMail({
        from: `"Artisan237" <${this.configService.get<string>('mail.user')}>`,
        to,
        subject,
        html,
      });
      this.logger.log(`Email sent: ${info.messageId}`);
      return info;
    } catch (error) {
      this.logger.error(`Error sending email to ${to}:`, error);
      throw new InternalServerErrorException('Failed to send email');
    }
  }

  async sendKycEmail(to: string, kycUrl: string) {
    const subject = 'Vérification d\'identité (KYC) requise - Artisan237';
    const html = `
      <h2>Vérification d'identité requise</h2>
      <p>Bonjour,</p>
      <p>Afin de pouvoir exercer en tant qu'artisan sur Artisan237, vous devez vérifier votre identité via Didit.</p>
      <p>Veuillez cliquer sur le lien ci-dessous pour démarrer le processus :</p>
      <a href="${kycUrl}" style="padding: 10px 20px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px;">
        Vérifier mon identité
      </a>
      <p>Ce lien expirera prochainement.</p>
      <br />
      <p>L'équipe Artisan237</p>
    `;
    return this.sendEmail(to, subject, html);
  }
}
