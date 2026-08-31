const { protect } = require('./auth');

// Export protect function directly as express middleware
// Also attach .protect property for compatibility with { protect } imports
protect.protect = protect;

module.exports = protect;
