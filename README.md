## Book Content Crawler Project

This project is a web scraping utility designed in Node.js that fetches book content, including metadata and associated images, from the website "Kotobati.com". The provided script crawls through the website and fetches details for approximately 25,000 books.

### Project Overview

The provided Node.js script utilizes various packages and functionalities to scrape and retrieve book data:

- **Libraries Used**:

  - `axios` for making HTTP requests.
  - `fs` (File System) for interacting with the file system.
  - `jsdom` for parsing and manipulating HTML documents in a Node.js environment.

- **Functionality**:
  - Fetches book details, including book titles, authors, categories, summaries, and meta-information.
  - Downloads associated images and PDFs for each book.
  - Logs any errors encountered during the scraping process.

### Script Execution

- **Running the Script**:

  - The script is written in Node.js and can be executed by running `node script_name.js`.
  - Ensure the necessary dependencies are installed (`axios`, `fs`, `jsdom`) before executing the script.

- **Customization**:
  - The script can be customized to suit specific requirements, such as altering the number of URLs to scrape or modifying the file paths for downloaded content.
