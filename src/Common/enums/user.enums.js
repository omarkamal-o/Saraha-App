export const GenderEnum = {
    MALE: "male",
    FEMALE: "female",
}

export const RolesEnum = {
    ADMIN: "admin",
    USER: "user",
    SUPER_ADMIN: "super_admin",
}

export const privileges = {
    ADMINS : [RolesEnum.ADMIN , RolesEnum.SUPER_ADMIN],
    SUPER_ADMINS : [RolesEnum.SUPER_ADMIN],
    ADMIN : [RolesEnum.ADMIN],
    USERS : [RolesEnum.USER],
    ALL : [RolesEnum.ADMIN , RolesEnum.SUPER_ADMIN , RolesEnum.USER],
    USER_ADMIN : [RolesEnum.ADMIN , RolesEnum.USER],
}