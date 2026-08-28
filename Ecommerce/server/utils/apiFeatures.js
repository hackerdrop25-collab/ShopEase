/**
 * ShopEase - API Features Utility
 *
 * A chainable helper class that layers search, filter, sort,
 * field-selection (projection), and pagination on top of any
 * Mongoose query object.
 *
 * Usage:
 *   const features = new APIFeatures(Product.find(), req.query)
 *     .search(['title', 'description'])
 *     .filter()
 *     .sort()
 *     .limitFields()
 *     .paginate();
 *
 *   const products = await features.query;
 */

class APIFeatures {
  /**
   * @param {mongoose.Query} query   - Mongoose query (e.g. Product.find())
   * @param {Object}         queryString - req.query from Express
   */
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  // ── Search ─────────────────────────────────────────────────────────────────

  /**
   * Applies a case-insensitive regex search across the provided fields.
   *
   * Client usage: GET /api/products?keyword=laptop
   *
   * @param {string[]} fields - Model fields to search in
   * @returns {APIFeatures} this (for chaining)
   */
  search(fields = ['title']) {
    if (this.queryString.keyword) {
      const regex = new RegExp(this.queryString.keyword, 'i');
      const orConditions = fields.map((field) => ({ [field]: regex }));
      this.query = this.query.find({ $or: orConditions });
    }
    return this;
  }

  // ── Filter ────────────────────────────────────────────────────────────────

  /**
   * Removes reserved query params (page, limit, sort, fields, keyword)
   * and converts MongoDB comparison operators written as strings
   * (gte, gt, lte, lt) into their $ prefixed equivalents.
   *
   * Client usage: GET /api/products?price[gte]=100&price[lte]=500&category=electronics
   *
   * @returns {APIFeatures} this (for chaining)
   */
  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'keyword'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // Replace gte|gt|lte|lt with $gte|$gt|$lte|$lt
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  // ── Sort ──────────────────────────────────────────────────────────────────

  /**
   * Sorts results by the given field(s).
   * Prefix with "-" for descending order.
   *
   * Client usage: GET /api/products?sort=-price,rating
   * Default: newest first (sort by -createdAt)
   *
   * @returns {APIFeatures} this (for chaining)
   */
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  // ── Field Limiting (Projection) ───────────────────────────────────────────

  /**
   * Limits the fields returned in the response.
   *
   * Client usage: GET /api/products?fields=title,price,images
   * Default: excludes __v (internal Mongoose version key)
   *
   * @returns {APIFeatures} this (for chaining)
   */
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  // ── Pagination ────────────────────────────────────────────────────────────

  /**
   * Implements cursor-style pagination using page + limit.
   *
   * Client usage: GET /api/products?page=2&limit=12
   * Defaults: page=1, limit=12
   *
   * @returns {APIFeatures} this (for chaining)
   */
  paginate() {
    const page = parseInt(this.queryString.page, 10) || 1;
    const limit = parseInt(this.queryString.limit, 10) || 12;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    // Expose pagination meta for controllers to pass to the client
    this.pagination = { page, limit, skip };
    return this;
  }
}

module.exports = APIFeatures;
