import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private isFirebaseInitialized = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.initFirebase();
  }

  private initFirebase() {
    try {
      const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID');
      const clientEmail = this.configService.get<string>('FIREBASE_CLIENT_EMAIL');
      const privateKey = this.configService.get<string>('FIREBASE_PRIVATE_KEY')?.replace(/\\n/g, '\n');

      if (projectId && clientEmail && privateKey) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey,
          }),
        });
        this.isFirebaseInitialized = true;
        this.logger.log('Firebase Admin SDK initialized successfully');
      } else {
        this.logger.warn('Firebase credentials not found. Push notifications will be mocked.');
      }
    } catch (error) {
      this.logger.error('Failed to initialize Firebase Admin SDK', error);
    }
  }

  async sendNotification(userId: string, title: string, message: string, type: string) {
    // 1. Sauvegarder dans la BDD pour l'historique in-app
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
      },
    });

    // 2. Envoyer une Push Notification via Firebase (si un deviceToken était disponible)
    if (this.isFirebaseInitialized) {
      try {
        // En conditions réelles, on récupèrerait le fcmToken de l'utilisateur depuis la BDD
        const fcmToken = 'mocked-fcm-token-for-' + userId;
        
        await admin.messaging().send({
          token: fcmToken,
          notification: {
            title,
            body: message,
          },
          data: {
            type,
            notificationId: notification.id,
          }
        });
      } catch (error) {
        this.logger.error(`Failed to send Firebase Push Notification to ${userId}`);
      }
    }

    return notification;
  }
}
