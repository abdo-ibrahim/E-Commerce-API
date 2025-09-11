const mongoose = require("mongoose");
const slugify = require("slugify");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    slug: {
      type: String,
      index: true,
      lowercase: true,
    },
    image: {
      public_id: String,
      url: String,
    },
  },
  { timestamps: true }
);
categorySchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true });
  }
  next();
});
const Category = mongoose.model("Category", categorySchema);
module.exports = Category;
