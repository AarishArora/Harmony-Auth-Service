import {body, validationResult} from 'express-validator';

async function validate(req, res, next) {
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }
    next();
}

export const registerUserValidationRules = [
    body("email").isEmail().withMessage("Invalid Email Address"),
    body("password").isLength({min: 6}).withMessage("password must be atleast 6 characters long"),
    body("fullname.firstName").notEmpty().withMessage('First name is required'),
    body("fullname.lastName").notEmpty().withMessage("Last name is required"),
    validate
]

export const loginUserValidationRules = [
    body("email").isEmail().withMessage('Invalid email address'),
    body("password").notEmpty().withMessage("Password is required"),
    validate
]