export type GoogleLoginRequest = {
    authorizationCode: string;
    role: "Admin" | "User";
}

export type LoginRequest = {
    userId: string,
	password: string
}

export type LogoutRequest = {
    refreshToken: string;
}

export type LogoutResponse = {
    message: string;
}

export type RegisterRequest = {
    id: string;
    nickname: string;
    email: string;
    password: string;
    userType: "USER" | "ADMIN";
}

export type RegisterResponse = {
    accessToken: string;
    refreshToken: string;
}

export type LoginResponse = {
    accessToken: string;
    refreshToken: string;
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