import express from "express";
import * as authController from "../controllers/auth.controller.js";
import * as validationRules from "../middleware/validation.middleware.js";
import passport from "passport";

const router = express.Router();

router.post("/register",validationRules.registerUserValidationRules,authController.register);

router.post("/login", validationRules.loginUserValidationRules, authController.login);

router.get('/google',(req, res, next) =>{
  const redirect = req.query.redirect || "/";
  req.session.redirect = redirect;
  next();
},
  passport.authenticate('google', { scope: ['profile', 'email'] })
);


router.get('/google/callback',
  passport.authenticate('google', { session: true, failureRedirect: '/api/auth/login' }),
  authController.googleAuthCallback
);


export default router;