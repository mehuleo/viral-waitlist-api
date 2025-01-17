/* eslint-disable class-methods-use-this */
import {
    MigrationInterface,
    QueryRunner
} from 'typeorm';

export default class CreateBase1613083697000 implements MigrationInterface {
    name = 'CreateBase1613083697000'

    public async up(queryRunner: QueryRunner): Promise < any > {
        if (process.env.MYSQL_V_OLDER_THAN_8 === 'true') {
            // await queryRunner.query(`
            //     DELIMITER //
            //         CREATE TRIGGER user_before_insert 
            //         BEFORE INSERT ON user FOR EACH ROW 
            //         BEGIN
            //             IF new.id IS NULL THEN
            //                 SET new.id = uuid();
            //             END IF;
            //         END;//
            //     DELIMITER ;
            // `);

            await queryRunner.query(`
                CREATE TABLE user (
                    id VARCHAR(255) NOT NULL PRIMARY KEY,
                    email VARCHAR(512) NOT NULL UNIQUE,
                    hasConfirmedEmail BOOL NOT NULL DEFAULT false,
                    referrerId VARCHAR(255),
                    points INT NOT NULL DEFAULT 0,
                    position INT NOT NULL DEFAULT 0,
                    originalPosition INT NOT NULL DEFAULT 0,
                    meta json,
                    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
        `);
        } else {
            await queryRunner.query(`
                CREATE TABLE user (
                    id VARCHAR(255) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
                    email VARCHAR(512) NOT NULL UNIQUE,
                    hasConfirmedEmail BOOL NOT NULL DEFAULT false,
                    referrerId VARCHAR(255),
                    points INT NOT NULL DEFAULT 0,
                    position INT NOT NULL DEFAULT 0,
                    originalPosition INT NOT NULL DEFAULT 0,
                    meta json,
                    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);
        }
    }

    public async down(queryRunner: QueryRunner): Promise < any > {
        await queryRunner.query('DROP TABLE user', undefined);
    }
}