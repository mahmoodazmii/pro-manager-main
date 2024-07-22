import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        const accessToken = req.headers["authorization"]?.replace("Bearer ", "");
        if (!accessToken) throw new ApiError(401, "Unauthorized request");

        const decodedToken = jwt.verify(accessToken, process.env.JWT_SECRET);

        const user = await User.findById(decodedToken?._id).select("-password");
        if (!user) throw new ApiError(401, "Invalid access token");

        req.user = user;
        next();

    } catch (error) {
        throw new ApiError(error?.statusCode || 401, error?.message || "Invalid access token");
    }
});