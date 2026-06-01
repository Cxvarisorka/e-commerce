const User = require("../models/user.model");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const { createSendToken } = require("./auth.controller");
const axios = require("axios");

// AUTH URL is used to give user chance to choose his account
const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";

// TOKEN URL gives us access token which will be used to request user info
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";

// USERINFO URL gives us user info with access token
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

// 1) User choose account -> returns code
// 2) We submit our proof with google so we can request info -> returns access token
// 3) We use access token to request user data -> returns user info
// 4) We store user info in db if all conditionals are passed


// This controller will redirect user to google web to choose desired account
// After choosing gogle will make new request to our API endpoint and send temp authorization code 
const getGoogleAuthUrl = catchAsync(async (req, res) => {
    const params = new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        response_type: "code",
        scope: "openid email profile",
        access_type: "offline",
        prompt: "consent",
    });

    res.redirect(`${GOOGLE_AUTH_URL}?${params.toString()}`);
});


const googleCallback = catchAsync(async (req, res, next) => {
    const { code } = req.query;

    if (!code) {
        return next(new AppError('Authorization code not provided', 400));
    }


    const tokenResponse = await axios.post(
        GOOGLE_TOKEN_URL, 
        new URLSearchParams({
            code,
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: process.env.GOOGLE_REDIRECT_URI,
            grant_type: 'authorization_code',
        }), {
            headers: {
                'content-type': 'application/x-www-form-urlencoded'
            }
        }
    );

    const { access_token } = tokenResponse.data;

    const userInfo = await axios.get(GOOGLE_USERINFO_URL, {
        headers: {
                Authorization: `Bearer ${access_token}`
        }
    })

    const { email, name, picture, sub, email_verified } = userInfo.data;

    let user = await User.findOne({oauthProvider: "google", oauthid: sub});

    if(!user) {
        if(!email_verified) {
            return next(new AppError('Google account not verified', 400));
        }

        user = await User.create({
            fullname: name,
            email,
            avatar: picture,
            oauthid: sub,
            oauthProvider: 'google',
            isVerified: true,
        });

        return res.status(201).json({
            status: "success",
            message: "Account created succesfully!",
            data: {
                user
            }
        })

        
    }

    createSendToken(user, res, 200);
});


module.exports = { getGoogleAuthUrl, googleCallback };