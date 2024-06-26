import { Injectable } from '@nestjs/common';
import { CreateRatingDto } from './dto/rating.dto';
import { Rating } from './entities/rating.entity';
import { DataSource } from 'typeorm';
import { Hotel } from 'src/hotel/entities/hotel.entity';
import { User, UserRole } from 'src/users/entities/user.entity';
import { FirebaseService } from 'src/firebase/firebase.service';
import {
  Notification,
  NotificationType,
} from 'src/notification/entities/notification.entity';

@Injectable()
export class RatingService {
  constructor(
    private dataSource: DataSource,
    private readonly firebaseService: FirebaseService,
  ) {}

  async rateHotels(user: User, payload: CreateRatingDto) {
    try {
      if (payload.hotel_id && payload.rating_value) {
        const ratingRepository = this.dataSource.getRepository(Rating);

        // Find existing rating by the user for the hotel
        const existingRating = await ratingRepository.findOne({
          where: { hotel_id: payload.hotel_id, user_id: user.id },
        });

        if (existingRating) {
          // Update the existing rating
          existingRating.rating_value = payload.rating_value;
          await ratingRepository.save(existingRating);
        } else {
          // Create a new rating
          await ratingRepository.save({
            ...payload,
            user_id: user.id,
          });
        }

        // Fetch all ratings for the hotel
        const ratings = await ratingRepository.find({
          where: { hotel_id: payload.hotel_id },
        });

        // Calculate the total rating value by summing up all existing ratings
        const totalRating = ratings.reduce(
          (sum, rating) => sum + rating.rating_value,
          0,
        );

        // Calculate the average rating value
        const averageRating = totalRating / ratings.length;

        // Round the average rating to an integer
        const roundedAverageRating = Math.round(averageRating);

        // Update the hotel's rating value
        const hotelRepository = this.dataSource.getRepository(Hotel);

        await hotelRepository.update(payload.hotel_id, {
          rating_value: roundedAverageRating,
        });

        const users = await this.dataSource
          .getRepository(User)
          .findOne({ where: { id: user.id } });

        const title = 'Rating Received';
        const body = `You have received a ${payload.rating_value} rating from ${users.full_name}`;

        const receiver = await this.dataSource
          .getRepository(User)
          .findOne({ where: { role: UserRole.hotel_admin } });

        await this.dataSource.getRepository(Notification).save({
          title: title,
          body: body,
          user_id: receiver.id,
          notification_type: NotificationType.message,
        });

        await this.firebaseService.sendPushNotifications([receiver.id], {
          title,
          body,
        });

        return { message: 'Rate Successfully!' };
      }
    } catch (error) {
      console.log(error);
    }
  }

  findAll() {
    return `This action returns all rating`;
  }
}
