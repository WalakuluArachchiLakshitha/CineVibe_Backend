// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema({
//     name: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: true },
//     role: { type: String, enum: ['admin', 'user'], default: 'user' },
//     cartData: { type: Object, default: {} }
// }, { minimize: false }) // minimize false to allow empty object

// const User = mongoose.models.user || mongoose.model('user', userSchema);

// export default User;
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        email : {
            type : String,
            required : true,
            unique : true
        },
        firstName : {
            type : String,
            required : true
        },
        lastName : {
            type : String,
            required : true
        },
        password : {
            type : String,
            required : true
        },
        role : {
            type : String,
            required : true,
            default : "user"
        },
        isBlock: {
            type : Boolean,
            default : false
        },
        isEmailVerified:{
            type : Boolean,
            default : false
        },
        image : {
            type : String,
             default : "/user.png"
        }
    }
)

const User = mongoose.model("User",userSchema)
export default User