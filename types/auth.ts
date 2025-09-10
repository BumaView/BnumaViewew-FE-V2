export type GoogleLoginRequest = {
    authorizationCode: string;
    role: "Admin" | "User";
}

export type LoginRequest = {
    id: string,
	password: string,
	role: "Admin" | "User"
}

export type LogoutRequest = {
    token: string;
}

export type LogoutResponse = {
    message: string;
}

export type UserLoginResponse = {
    userType: "User";
    userId: number;
    name: string;
    accessToken: string;
    refreshToken: string;
} 

export type AdminLoginResponse = {
    userType: "Admin";
    userId: number;
    name: string;
    accessToken: string;
    refreshToken: string;
} 

export type UnregisteredUserError = {
    error: "UNREGISTERED_USER";
    message: string;
}

export type InvalidCodeError = {
    statusCode: number;
    message: string;
} 

export type AuthError = UnregisteredUserError | InvalidCodeError;

export type AuthSuccess = UserLoginResponse | AdminLoginResponse;

export type AuthResponse = AuthSuccess | AuthError;