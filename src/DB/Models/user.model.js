import mongoose from "mongoose";
import { GenderEnum, RolesEnum } from "../../Common/enums/user.enums.js";




const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minlength: [3, "First name must be at least 3 characters long"],
        maxlength: [20],
        trim: true,
    } ,
    lastName: {
        type: String,
        required: true,
        minlength: [3, "Last name must be at least 3 characters long"],
        maxlength: [20],
        trim: true,
    } ,
    age: {
        type: Number,
        required: true,
        min: [18, "Age must be at least 18"],
        max: [100, "Age must be less than 100"],
        index: {
            name: "idx_age"
        } ,
    } ,
    gender: {
        type : String,
        required: true,
        enum: Object.values(GenderEnum),
    } ,
    email: {
        type: String,
        required: true,
        trim: true,
        index: {
            unique: true,
            name: "idx_email_unique"
        }
    } ,
    password: {
        type: String,
        required: true,
        trim: true,
    } ,
    phoneNumber: {
        type: String,
        required: true,
        unique: true,
        minlength: [11, "Phone number must be 11 characters long"],
    } ,
    otps: {
        confirmation:String,
        resetPassword:String,
    } ,
    isConfirmed: {
        type: Boolean,
        default: false,
    } ,
    role: {
        type: String,
        enum: Object.values(RolesEnum),
        default: RolesEnum.USER,
    }
} ,
{
    timestamps: true,
    toJSON: {
        virtuals: true,
    },
    toObject: {
        virtuals: true,
    } , 
    virtuals: {
        fullName: {
            get(){
                return `${this.firstName} ${this.lastName}`;
            }
        }
    }   ,
    methods: {
        getFullName(){
            return `${this.firstName} ${this.lastName}`;
        },
        getDoubleAge(){
            return this.age * 2 ;
        },
    },     
}
)

userSchema.index({firstName: 1 , lastName: 1} , {unique: true , name: "idx_full_name_unique"})
// userSchema.virtual("Messages" ,{
//     ref: "Messages",
//     localField: "_id",
//     foreignField: "receiverId",
// })

const User = mongoose.model("User" , userSchema);
export default User;