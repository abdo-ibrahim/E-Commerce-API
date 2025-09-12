class APIFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  filter() {
    const queryObj = { ...this.queryStr };
    const excludedFields = ["page", "sort", "limit", "fields", "search"];
    excludedFields.forEach((el) => delete queryObj[el]);
    let queryString = JSON.stringify(queryObj);
    queryString = queryString.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);
    this.query = this.query.find(JSON.parse(queryString));
    return this;
  }

  sort() {
    if (this.queryStr.sort) {
      let sort = this.queryStr.sort.split(",").join(" ");
      this.query = this.query.sort(sort);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }

  paginate() {
    const page = this.queryStr.page || 1;
    const limit = this.queryStr.limit || 10;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }

  search() {
    if (this.queryStr.search) {
      const searchFields = ["name", "description", "firstName", "lastName", "userName"];
      const searchQuery = this.queryStr.search;

      const searchFilter = {
        $or: searchFields.map((field) => ({
          [field]: { $regex: new RegExp(searchQuery, "i") },
        })),
      };

      this.query = this.query.find(searchFilter);
    }

    return this;
  }

  selectFields() {
    if (this.queryStr.fields) {
      let { fields } = this.queryStr;
      fields = fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }
    return this;
  }
}

module.exports = APIFeatures;

// How to use:
// const features = new APIFeatures(Model.find(), req.query)
//   .filter()
//   .sort()
//   .paginate();
// const users = await features.query;
