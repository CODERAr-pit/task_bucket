import { body, validationResult } from "express-validator";
import createDOMPurify from "dompurify";
import { JSDOM } from "jsdom";
import validator from "validator";

// Create DOMPurify instance for server-side sanitization
const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);

// Helper function to handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }
  next();
};

// Sanitize HTML content to prevent XSS
export const sanitizeHtml = (value) => {
  if (typeof value !== "string") return value;
  return DOMPurify.sanitize(value, {
    ALLOWED_TAGS: [], // Remove all HTML tags
    ALLOWED_ATTR: [], // Remove all attributes
  });
};

// Custom password validation
const isStrongPassword = (password) => {
  if (password.length < 8) return false;
  if (!/[a-z]/.test(password)) return false; // lowercase
  if (!/[A-Z]/.test(password)) return false; // uppercase
  if (!/[0-9]/.test(password)) return false; // number
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false; // special char
  return true;
};

// User registration validation
export const validateUserRegistration = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters")
    .customSanitizer(sanitizeHtml),

  body("email")
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage("Email must not exceed 100 characters"),

  body("password")
    .isLength({ min: 8, max: 128 })
    .withMessage("Password must be between 8 and 128 characters")
    .custom((password) => {
      if (!isStrongPassword(password)) {
        throw new Error(
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
        );
      }
      return true;
    }),

  body("role")
    .isIn(["1st Year", "2nd Year", "3rd Year", "4th Year"])
    .withMessage("Invalid role selected"),

  body("domains")
    .isArray({ min: 1 })
    .withMessage("At least one domain must be selected")
    .custom((domains) => {
      const validDomains = [
        "Web Development",
        "Content Writing",
        "Graphic Designing",
        "Video Editing",
        "General",
      ];
      const invalidDomains = domains.filter(
        (domain) => !validDomains.includes(domain)
      );
      if (invalidDomains.length > 0) {
        throw new Error(`Invalid domains: ${invalidDomains.join(", ")}`);
      }
      return true;
    }),

  handleValidationErrors,
];

// User login validation
export const validateUserLogin = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ max: 128 })
    .withMessage("Password too long"),

  handleValidationErrors,
];

// Task creation/update validation
export const validateTask = [
  body("title")
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage("Title must be between 1 and 200 characters")
    .customSanitizer(sanitizeHtml),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage("Description must not exceed 5000 characters")
    .customSanitizer(sanitizeHtml),

  body("domain")
    .optional()
    .isIn([
      "Web Development",
      "Content Writing",
      "Graphic Designing",
      "Video Editing",
      "General",
    ])
    .withMessage("Invalid domain selected"),

  body("status")
    .optional()
    .isIn(["todo", "in-progress", "completed", "overdue"])
    .withMessage("Invalid status"),

  body("priority")
    .optional()
    .isIn(["low", "medium", "high"])
    .withMessage("Invalid priority"),

  body("visibility")
    .optional()
    .isIn(["public", "private"])
    .withMessage("Invalid visibility"),

  body("dueDate")
    .optional()
    .isISO8601()
    .withMessage("Due date must be a valid date"),

  body("assignedTo")
    .optional()
    .custom((assignedTo) => {
      if (Array.isArray(assignedTo)) {
        if (assignedTo.length > 20) {
          throw new Error("Cannot assign to more than 20 users");
        }
        assignedTo.forEach((id) => {
          if (!validator.isMongoId(id)) {
            throw new Error("Invalid user ID format");
          }
        });
      } else if (assignedTo && !validator.isMongoId(assignedTo)) {
        throw new Error("Invalid user ID format");
      }
      return true;
    }),

  handleValidationErrors,
];

// Comment validation
export const validateComment = [
  body("text")
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage("Comment must be between 1 and 1000 characters")
    .customSanitizer(sanitizeHtml),

  handleValidationErrors,
];

// MongoDB ObjectId validation
export const validateObjectId = (req, res, next) => {
  const { id, taskId } = req.params;
  const idToValidate = id || taskId;

  if (idToValidate && !validator.isMongoId(idToValidate)) {
    return res.status(400).json({
      success: false,
      message: "Invalid ID format",
    });
  }
  next();
};

// Admin operation validation
export const validateAdminAction = [
  body("reason")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Reason must not exceed 500 characters")
    .customSanitizer(sanitizeHtml),

  handleValidationErrors,
];

export default {
  validateUserRegistration,
  validateUserLogin,
  validateTask,
  validateComment,
  validateObjectId,
  validateAdminAction,
  handleValidationErrors,
  sanitizeHtml,
};
