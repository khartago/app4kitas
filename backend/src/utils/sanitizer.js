const xss = require('xss');
const fs = require('fs');

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param {string} content - The content to sanitize
 * @returns {string} - Sanitized content
 */
function sanitizeHtml(content) {
  if (!content || typeof content !== 'string') {
    return '';
  }
  
  // Use xss library to sanitize HTML
  return xss(content, {
    whiteList: {
      // Allow only safe HTML tags
      p: [],
      br: [],
      strong: [],
      em: [],
      u: [],
      ol: [],
      ul: [],
      li: [],
      h1: [],
      h2: [],
      h3: [],
      h4: [],
      h5: [],
      h6: [],
      blockquote: [],
      code: [],
      pre: []
    },
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script', 'style', 'iframe', 'object', 'embed']
  });
}

/**
 * Sanitize text content to prevent XSS
 * @param {string} text - The text to sanitize
 * @returns {string} - Sanitized text
 */
function sanitizeText(text) {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  // Remove HTML tags
  let sanitized = text.replace(/<[^>]*>/g, '');
  
  // Remove dangerous JavaScript function calls
  sanitized = sanitized.replace(/alert\s*\([^)]*\)/gi, '');
  sanitized = sanitized.replace(/confirm\s*\([^)]*\)/gi, '');
  sanitized = sanitized.replace(/prompt\s*\([^)]*\)/gi, '');
  sanitized = sanitized.replace(/eval\s*\([^)]*\)/gi, '');
  sanitized = sanitized.replace(/exec\s*\([^)]*\)/gi, '');
  sanitized = sanitized.replace(/setTimeout\s*\([^)]*\)/gi, '');
  sanitized = sanitized.replace(/setInterval\s*\([^)]*\)/gi, '');
  sanitized = sanitized.replace(/Function\s*\([^)]*\)/gi, '');
  
  // Remove dangerous event handlers
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=\s*[^>\s]+/gi, '');
  
  // Remove javascript: URLs
  sanitized = sanitized.replace(/javascript\s*:\s*[^;\s]+/gi, '');
  sanitized = sanitized.replace(/vbscript\s*:\s*[^;\s]+/gi, '');
  
  // Remove data URLs
  sanitized = sanitized.replace(/data\s*:\s*[^;\s]+/gi, '');
  
  // Remove leading/trailing whitespace
  sanitized = sanitized.trim();
  
  return sanitized;
}

/**
 * Validate and sanitize user input for names, titles, etc.
 * @param {string} input - The input to validate
 * @returns {string} - Sanitized input
 */
function sanitizeUserInput(input) {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  // Remove any HTML/script content from user input
  return sanitizeText(input);
}

/**
 * Sanitize file names to prevent XSS and path traversal
 * @param {string} fileName - The file name to sanitize
 * @returns {string} - Sanitized file name
 */
function sanitizeFileName(fileName) {
  if (!fileName || typeof fileName !== 'string') {
    return '';
  }
  // Remove HTML tags
  let sanitized = fileName.replace(/<[^>]*>/g, '');
  // Remove path traversal and suspicious characters
  sanitized = sanitized.replace(/[\\/:*?"<>|\[\]{}()'`$%#@!]/g, '');
  // Remove leading/trailing whitespace
  sanitized = sanitized.trim();
  // Prevent empty file names
  if (!sanitized) return 'file';
  return sanitized;
}

/**
 * Check for malware patterns in file content
 * @param {Buffer} fileBuffer - The file content as buffer
 * @param {string} fileName - The file name
 * @returns {boolean} - True if suspicious/malicious content detected
 */
function detectMalware(fileBuffer, fileName) {
  if (!fileBuffer || !fileName) return false;
  
  const content = fileBuffer.toString('utf8', 0, Math.min(fileBuffer.length, 10000)); // Check first 10KB
  const lowerContent = content.toLowerCase();
  const lowerFileName = fileName.toLowerCase();
  
  // EICAR test file patterns - check for the exact string and common variants
  const eicarStrings = [
    'X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*',
    'X5O!P%@AP[4\\\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*',
    'x5o!p%@ap[4\\pzx54(p^)7cc)7}$eicar-standard-antivirus-test-file!$h+h*',
    'x5o!p%@ap[4\\\\pzx54(p^)7cc)7}$eicar-standard-antivirus-test-file!$h+h*'
  ];
  
  for (const eicarString of eicarStrings) {
    if (content.includes(eicarString) || lowerContent.includes(eicarString.toLowerCase())) {
      return true;
    }
  }
  
  // Check for other malware signatures
  const malwareSignatures = [
    'virus',
    'trojan',
    'malware',
    'exploit',
    'backdoor'
  ];
  
  for (const signature of malwareSignatures) {
    if (lowerContent.includes(signature) || lowerFileName.includes(signature)) {
      return true;
    }
  }
  
  // Check for suspicious file extensions
  const suspiciousExtensions = ['.exe', '.bat', '.cmd', '.com', '.scr', '.pif', '.vbs', '.js'];
  for (const ext of suspiciousExtensions) {
    if (lowerFileName.endsWith(ext)) {
      return true;
    }
  }
  
  return false;
}

module.exports = {
  sanitizeHtml,
  sanitizeText,
  sanitizeUserInput,
  sanitizeFileName,
  detectMalware
}; 