/**
 * Enter here the user flows and custom policies for your B2C application
 * To learn more about user flows, visit: https://docs.microsoft.com/en-us/azure/active-directory-b2c/user-flow-overview
 * To learn more about custom policies, visit: https://docs.microsoft.com/en-us/azure/active-directory-b2c/custom-policy-overview
 */
const b2cPolicies = {
    names: {
        signUpSignIn: "B2C_1_LegacySignup_Signin",
        forgotPassword: "B2C_1_PasswordReset",
        editProfile: "b2c_1_edit_profile"
    },
    authorities: {
        signUpSignIn: {
            authority: "https://asiftest3.b2clogin.com/asiftest3.onmicrosoft.com/B2C_1_LegacySignup_Signin",
        },
        forgotPassword: {
            authority: "https://asiftest3.b2clogin.com/asiftest3.onmicrosoft.com/B2C_1_PasswordReset",
        },
        editProfile: {
            authority: "https://asiftest3.b2clogin.com/asiftest3.onmicrosoft.com/b2c_1_edit_profile"
        }
    },
    authorityDomain: "https://asiftest3.b2clogin.com/"
}