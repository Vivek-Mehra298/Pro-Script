import jwt from 'jsonwebtoken';

const secretKey = process.env.JWT_SECRET || 'fallback-secret';

export const setUser=(user:any)=>{
    const payload={
        id:user?._id?.toString() ?? user?._id,
        email:user?.email,
        role:user?.role,
        fullName:user?.fullName
    }
    return jwt.sign(payload,secretKey, { expiresIn: '7d' });
};


export const getUser=(token:string)=>{
    if(!token) return null;
    try {
        return jwt.verify(token,secretKey);
    } catch (error) {
        return null;
    }
}
