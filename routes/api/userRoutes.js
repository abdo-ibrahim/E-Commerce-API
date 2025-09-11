const express = require("express");
const { getAllUsers, getUserById, updateUser, deleteUser, getMe, updateMe, updatePassword, deleteMe, uploadProfilePicture } = require("../../controllers/userController");
const { addUserAddress, removeUserAddress, updateUserAddress, getAllUserAddresses } = require("../../controllers/addressesController");
const { protect } = require("../../controllers/authController");
const { allowTo } = require("../../middlewares/allowTo");
const upload = require("../../config/fileUpload");
const userRouter = express.Router();

// ====== Admin Routes ======
userRouter.get("/", protect, allowTo("Admin"), getAllUsers);

// ====== User Routes  ======
userRouter.get("/me", protect, allowTo("User"), getMe);
userRouter.put("/update-me", protect, allowTo("User"), updateMe);
userRouter.put("/update-password", protect, allowTo("User"), updatePassword);
userRouter.delete("/delete-me", protect, allowTo("User"), deleteMe);
userRouter.post("/upload-profile-picture", protect, allowTo("User"), upload.single("image"), uploadProfilePicture);
// ====== User Addresses Routes ======
userRouter.post("/addresses", protect, allowTo("User"), addUserAddress);
userRouter.get("/addresses", protect, allowTo("User"), getAllUserAddresses);
userRouter.put("/addresses/:addressId", protect, allowTo("User"), updateUserAddress);
userRouter.delete("/addresses/:addressId", protect, allowTo("User"), removeUserAddress);

// ====== Admin Routes with dynamic ID : put last) ======
userRouter.get("/:id", protect, allowTo("Admin"), getUserById);
userRouter.put("/:id", protect, allowTo("Admin"), updateUser);
userRouter.delete("/:id", protect, allowTo("Admin"), deleteUser);

module.exports = userRouter;
