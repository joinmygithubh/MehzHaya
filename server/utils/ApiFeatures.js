/**
 * Reusable query builder for search, filter, sort and pagination on Mongoose queries.
 */
class ApiFeatures {
  constructor(query, queryStr) {
    this.query = query; // Mongoose query
    this.queryStr = queryStr; // req.query
  }

  search() {
    const keyword = this.queryStr.keyword
      ? {
          $or: [
            { name: { $regex: this.queryStr.keyword, $options: "i" } },
            { categoryName: { $regex: this.queryStr.keyword, $options: "i" } },
            { material: { $regex: this.queryStr.keyword, $options: "i" } },
          ],
        }
      : {};
    this.query = this.query.find({ ...keyword });
    return this;
  }

  filter() {
    const queryCopy = { ...this.queryStr };
    const removeFields = ["keyword", "page", "limit", "sort", "fields"];
    removeFields.forEach((key) => delete queryCopy[key]);

    const filter = {};

    // group / category
    if (queryCopy.group) filter.group = queryCopy.group;
    if (queryCopy.category) filter.categoryName = queryCopy.category;

    // color / material (comma separated supported)
    if (queryCopy.color) filter.colors = { $in: queryCopy.color.split(",") };
    if (queryCopy.material)
      filter.material = { $in: queryCopy.material.split(",") };

    // rating (gte)
    if (queryCopy.rating) filter.ratings = { $gte: Number(queryCopy.rating) };

    // availability
    if (queryCopy.availability === "in") filter.stock = { $gt: 0 };
    if (queryCopy.availability === "out") filter.stock = { $lte: 0 };

    // price range
    if (queryCopy.minPrice || queryCopy.maxPrice) {
      filter.price = {};
      if (queryCopy.minPrice) filter.price.$gte = Number(queryCopy.minPrice);
      if (queryCopy.maxPrice) filter.price.$lte = Number(queryCopy.maxPrice);
    }

    // flags
    ["isFeatured", "isNewArrival", "isTrending", "isBestSeller", "isFlashSale"].forEach(
      (flag) => {
        if (queryCopy[flag] === "true") filter[flag] = true;
      }
    );

    this.query = this.query.find(filter);
    return this;
  }

  sort() {
    const sortMap = {
      newest: "-createdAt",
      oldest: "createdAt",
      popular: "-views",
      bestselling: "-sold",
      priceLow: "price",
      priceHigh: "-price",
      rating: "-ratings",
      alphabetical: "name",
    };
    const sortBy = sortMap[this.queryStr.sort] || "-createdAt";
    this.query = this.query.sort(sortBy);
    return this;
  }

  paginate(defaultLimit = 12) {
    const page = Number(this.queryStr.page) || 1;
    const limit = Number(this.queryStr.limit) || defaultLimit;
    const skip = limit * (page - 1);
    this.query = this.query.limit(limit).skip(skip);
    return this;
  }
}

export default ApiFeatures;
