/* eslint-disable camelcase */
import {
    inject,
    injectable
} from 'tsyringe';
import {
    Repository
} from 'typeorm';
import {
    cargoQueue,
    QueueObject
} from 'async';
import User from '../entities/User';

type StreamUser = {
    user_id: User['id'],
    user_email: User['email'],
    user_hasConfirmedEmail: User['hasConfirmedEmail'],
    user_referrerId: User['referrerId'],
    user_points: User['points'],
    user_originalPosition: User['originalPosition'],
    user_position: User['position'],
    user_meta: User['meta'],
    user_createdAt: User['createdAt'],
    user_updatedAt: User['updatedAt']
};

type StreamUserPositioned = {
    streamUser: StreamUser;
    position: number;
};

// @singleton()
@injectable()
export default class ProcessReferralsService {
    updateQueue: QueueObject < StreamUser > ;

    constructor(
        @inject('UserRepository') private userRepository: Repository < User > ,
    ) {
        this.updateQueue = cargoQueue < StreamUser > (async (streamUsers, callback) => {
            const user = streamUsers[0];
            const [ru, referralCount] = await this.userRepository.findAndCount({
                referrerId: user.user_id,
            });
            if (referralCount < 1) {
                callback();
                return;
            }
            let newPosition = user.user_originalPosition - (referralCount * Number(process.env.REFERRAL_BUMP));
            newPosition = newPosition < 1 ? 1 : newPosition;

            if (newPosition === user.user_position) {
                callback();
                return;
            }

            // update all between current position and new position
            await this.userRepository.query(`
                UPDATE user SET position = position + 1 
                WHERE 
                    position >= ${newPosition} 
                    AND position < ${user.user_position} 
                ;
            `);

            await this.userRepository.update({
                id: user.user_id,
            }, {
                position: newPosition,
                meta: {
                    referralCount,
                }
            });
            callback();
        }, 1, 1);
    }

    async run(): Promise < void > {
        const accountStream = await this.userRepository
            .createQueryBuilder('user')
            .orderBy('user.points', 'DESC')
            .addOrderBy('user.createdAt')
            .stream();

        accountStream.on('data', this.updateQueue.push);
    }
}