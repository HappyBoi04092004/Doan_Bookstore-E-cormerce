import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import prisma from "./prisma";
import dotenv from "dotenv";

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      callbackURL: process.env.GOOGLE_CALLBACK_URL || "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error("No email found in Google profile"));
        }

        // Check if user exists by googleId
        let user = await prisma.user.findUnique({
          where: { googleId: profile.id },
          include: { role: true },
        });

        if (!user) {
          // If not found by googleId, check if a user with this email already exists
          user = await prisma.user.findUnique({
            where: { email },
            include: { role: true },
          });

          if (user) {
            // Update existing user with googleId and avatar if they don't have it
            user = await prisma.user.update({
              where: { id: user.id },
              data: {
                googleId: profile.id,
                avatar: user.avatar || profile.photos?.[0]?.value,
              },
              include: { role: true },
            });
          } else {
            // Create a new user
            const roleRecord = await prisma.role.findFirst({
              where: { name: "USER" },
            });

            if (!roleRecord) {
              return done(new Error("Default user role not found. Please seed the database."));
            }

            user = await prisma.user.create({
              data: {
                email,
                name: profile.displayName || "Google User",
                googleId: profile.id,
                avatar: profile.photos?.[0]?.value,
                roleId: roleRecord.id,
              },
              include: { role: true },
            });
          }
        }

        return done(null, user);
      } catch (error) {
        console.error("Error in Google Strategy:", error);
        return done(error);
      }
    }
  )
);

export default passport;
