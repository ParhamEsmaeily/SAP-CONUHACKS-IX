/**
 * Utility functions for handling JSON data in the application
 */

/**
 * Fetches and parses a JSON file from a local path or URL
 * @param {string} path - The path or URL to the JSON file
 * @returns {Promise<any>} - The parsed JSON data
 */
export const fetchJSON = async (path) => {
    try {
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching JSON:', error);
      throw error;
    }
  };
  
  /**
   * Parses a JSON file from a File object
   * @param {File} file - The File object containing JSON data
   * @returns {Promise<any>} - The parsed JSON data
   */
  export const parseJSONFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          resolve(data);
        } catch (error) {
          reject(new Error('Failed to parse JSON file: ' + error.message));
        }
      };
  
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
  
      reader.readAsText(file);
    });
  };
  
  /**
   * Validates JSON data against an expected schema
   * @param {Object} data - The JSON data to validate
   * @param {Array<string>} requiredFields - Array of required field names
   * @returns {boolean} - True if valid, throws error if invalid
   */
  export const validateJSON = (data, requiredFields = []) => {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid JSON data: must be an object');
    }
  
    for (const field of requiredFields) {
      if (!(field in data)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
  
    return true;
  };
  
  /**
   * Formats a timestamp from ISO string to a more readable format
   * @param {string} isoString - ISO timestamp string
   * @returns {string} - Formatted date string
   */
  export const formatTimestamp = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString();
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return isoString;
    }
  };
  