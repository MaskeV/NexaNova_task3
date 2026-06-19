const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username:{
       type:String,
       unique:true,
       trim:true,
       required:[true, 'Username is required'],
       min:[5,'Username ahould be at least 5 characters']
    },
    email:{
        type:String,
        unique:true,
        required:[true, "Email is required"],
        trim:true,
        lowercase:true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password:{
        type:String,
        trim:true,
        min:[6,"Password must be at least 6 character long"],
        required:[true,"Password is required"],
        select:false
    },
    role:{
        type:String,
        enum:['admin','student'],
        default:'student'
    },
    isActive:{
        type:Boolean,
        default:true
    },
},{
   timestamp:true
}
);

userSchema.pre('save',async ()=>{

    if(!this.isModified('password')){
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(enteredPassword,this.password)   

});

userSchema.methods.comparePassword = async ()=>{
    return await bycrypt.compare(enteredPassword,this.password);
};

module.export = mongoose.model('User',userSchema);