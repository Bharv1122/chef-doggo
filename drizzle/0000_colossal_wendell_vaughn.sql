CREATE TABLE `dog_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`breed` varchar(100),
	`weightLbs` int NOT NULL,
	`ageYears` int NOT NULL,
	`ageMonths` int DEFAULT 0,
	`sizeCategory` enum('toy','small','medium','large','giant') NOT NULL,
	`lifeStage` enum('puppy','adult','senior') NOT NULL,
	`activityLevel` enum('sedentary','moderate','active','very_active') NOT NULL DEFAULT 'moderate',
	`allergies` text,
	`dietaryRestrictions` text,
	`healthConditions` text,
	`dailyCalories` int,
	`photoUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dog_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `saved_recipes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`dogProfileId` int NOT NULL,
	`name` varchar(200) NOT NULL,
	`description` text,
	`ingredients` text NOT NULL,
	`instructions` text NOT NULL,
	`nutrition` text,
	`supplements` text,
	`servingSize` varchar(100),
	`servingsPerDay` int,
	`prepTimeMinutes` int,
	`cookTimeMinutes` int,
	`kibbleIngredients` text,
	`isFavorite` boolean DEFAULT false,
	`rating` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `saved_recipes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`hasAcceptedDisclaimer` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
