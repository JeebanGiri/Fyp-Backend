import { BadRequestException, Injectable } from '@nestjs/common';
import { FIREBASE_SERVICE_ACCOUNT } from 'src/@config/constants.config';
import { DataSource, In } from 'typeorm';
import * as firebase from 'firebase-admin';
import { Printer } from 'src/@helpers/printer';
import { CreateFirebaseNotificationTokenDto } from './dto/firebase.dto';
import { FirebaseToken } from './entities/firebase-notification-token.entity';

@Injectable()
export class FirebaseService {
  constructor(private readonly dataSource: DataSource) {
    const firebaseConfig: firebase.ServiceAccount = {
      projectId: FIREBASE_SERVICE_ACCOUNT.project_id,
      clientEmail: FIREBASE_SERVICE_ACCOUNT.client_email,
      privateKey: FIREBASE_SERVICE_ACCOUNT.private_key,
    };
    //check if firebase is already initialized if not then initialize it
    if (!firebase.apps.length) {
      firebase.initializeApp({
        credential: firebase.credential.cert(firebaseConfig),
      });
    }
  }

  // ---------- SAVE NEW TOKEN ----------
  async createToken(
    user_id: string,
    payload: CreateFirebaseNotificationTokenDto,
  ) {
    const existingToken = await this.dataSource
      .getRepository(FirebaseToken)
      .find({ where: { user_id } });

    console.log(existingToken, 'Token');
    if (existingToken.length > 0) {
      throw new BadRequestException('Token exits');
    }
    // If the user does not have a token, save the new token
    await this.dataSource.getRepository(FirebaseToken).save({
      user_id,
      device_type: payload.device_type,
      notification_token: payload.notification_token,
    });

    return { message: 'Token saved.' };
  }

  // ---------- UPDATE TOKEN ----------
  async updateToken(
    user_id: string,
    token_id: string,
    payload: CreateFirebaseNotificationTokenDto,
  ) {
    await this.dataSource.manager.update(
      FirebaseToken,
      { id: token_id, user_id },
      payload,
    );
    return { message: 'Token updated.' };
  }
  // ---------- SEND PUSH NOTIFICATION TO MULTIPLE USERS ----------
  async sendPushNotifications(
    user_ids: string[],
    payload: { title: string; body: string },
  ) {
    const tokens = await this.dataSource.manager.find(FirebaseToken, {
      where: { user_id: In(user_ids), is_active: true },
    });
    for (const token of tokens) {
      await firebase
        .messaging()
        .send({
          token: token.notification_token,
          notification: {
            title: payload.title,
            body: payload.body,
            // imageUrl: 'https://d1m8r2h4y17msp.cloudfront.net/public/others/logo.svg',
          },
          android: { priority: 'high' },
        })
        .catch((error) => {
          Printer('FIREBASE NOTIFICATION ERROR: ', error);
        });
    }
    return { message: 'Push notification sent.' };
  }
  // ---------- SEND BROADCAST PUSH NOTIFICATION ----------
  async sendBroadcastPushNotification(payload: {
    title: string;
    body: string;
  }) {
    const tokens = await this.dataSource.manager.find(FirebaseToken, {
      where: { is_active: true },
    });
    for (const token of tokens) {
      await firebase
        .messaging()
        .send({
          token: token.notification_token,
          notification: {
            title: payload.title,
            body: payload.body,
            // imageUrl: 'https://d1m8r2h4y17msp.cloudfront.net/public/others/logo.svg',
          },
          android: { priority: 'high' },
        })
        .catch((error) => {
          Printer('FIREBASE NOTIFICATION ERROR: ', error);
        });
    }
    return { message: 'Push notification sent.' };
  }
  // ---------- DELETE TOKEN ----------
  async deleteToken(user_id: string, token_id: string) {
    await this.dataSource.manager.update(
      FirebaseToken,
      { id: token_id, user_id },
      { is_active: false },
    );
    return { message: 'Token deleted.' };
  }
}
