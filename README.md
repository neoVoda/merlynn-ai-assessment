# Merlynn AI Assessment Application

This project is a Next.js application built for Merlynn Intelligence Technologies’ coding assessment. It demonstrates a full‑stack solution that integrates with the UP2TOM API to process decisions and batch scenarios, complete with dynamic form generation, validation (including exclusion rule validation), and file uploads—all styled with a Merlynn-inspired color scheme (white background, gray text, orange accents).

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Usage](#usage)
  - [Model Listing & Detail](#model-listing--detail)
  - [Decision Processing](#decision-processing)
  - [Batch Processing](#batch-processing)
- [API Endpoints](#api-endpoints)
- [Security Considerations](#security-considerations)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## Overview

The Merlynn AI Assessment Application is an innovative solution designed to demonstrate:
- Full‑stack Next.js development with React and Tailwind CSS
- API integration with UP2TOM for AI‑driven decision making and batch processing
- Dynamic form creation with field‑level and exclusion‑rule validation
- Secure handling of sensitive data using MongoDB (with Mongoose) and server‑side API routes

---

## Features

- **Model Listing:**  
  Displays a list of available models fetched from the UP2TOM API.
  
- **Model Detail & Decision Submission:**  
  - Dynamically generates forms based on model metadata.
  - Validates numeric (continuous) inputs and nominal inputs (rendered as dropdowns).
  - Checks exclusion rules (e.g., ValueEx, BlatantEx, RelationshipEx) to ensure the input scenario is feasible.
  - Submits user input to the UP2TOM decision endpoint and stores results in MongoDB.

- **Batch Processing:**  
  Supports file uploads (CSV) for batch scenario processing via a dedicated API route.

- **Responsive Design:**  
  Built with Tailwind CSS for a responsive and clean UI using the Merlynn color scheme (white background, gray/black text, and orange accents).

---

## Technology Stack

- **Frontend:** Next.js (App Router), React, Tailwind CSS  
- **Backend:** Next.js API routes, Node.js, Axios  
- **Database:** MongoDB with Mongoose  
- **External API:** UP2TOM API

---

## Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/azterix101/merlynn-ai-assessment.git
   cd merlynn-ai-assessment
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Set Up Environment Variables**

   Create a `.env` file in the root directory with the following:

   ```env
   TOM_API_KEY=9307bfd5fa011428ff198bb37547f979
   MONGODB_URI=your_mongodb_connection_string_here
   ```

   Replace `your_mongodb_connection_string_here` with your actual MongoDB URI.

4. **Run the Development Server**

   ```bash
   npm run dev
   ```

5. **Access the Application**

   Open your browser at [http://localhost:3000](http://localhost:3000)

---

## Environment Variables

- **TOM_API_KEY:** UP2TOM API key for authenticating requests.
- **MONGODB_URI:** MongoDB connection string.

---

## Project Structure

```
merlynn-ai-assessment/
├── app/
│   ├── api/
│   │   ├── models/         // API routes for fetching model data from UP2TOM
│   │   ├── decision/       // API route for processing decision requests
│   │   └── batch/          // API route for handling batch file uploads
│   ├── model/              // Dynamic model detail page (e.g., [id]/page.jsx)
│   └── page.jsx            // Home page displaying a list of models
├── lib/
│   └── mongodb.js          // MongoDB connection helper
├── models/
│   └── Decision.js         // Mongoose model for storing decision results
├── tailwind.config.js      // Tailwind CSS configuration
├── package.json
└── README.md
```

---

## Usage

### Model Listing & Detail

- **Home Page:**  
  The home page (`app/page.jsx`) displays a list of models. Each model is listed with its name and description and links to its detail page.

- **Model Detail Page:**  
  The dynamic route (`app/model/[id]/page.jsx`) displays a form based on the selected model's metadata. Nominal fields are rendered as dropdowns and continuous fields as text inputs. Field-level validation and exclusion rule checks are performed before submission.

### Decision Processing

When a user submits the form on the Model Detail page:
- The input data is validated and wrapped in the expected JSON payload.
- A request is made to the `/api/decision` endpoint.
- The decision response from the UP2TOM API is stored in MongoDB and displayed to the user.

### Batch Processing

- **Batch Upload Page (`app/batch/page.jsx`):**  
  This page provides a file input for uploading a CSV file and a text input for specifying the delimiter.  
- **Workflow:**  
  - Create a properly formatted CSV file (ensure no formatting issues with negative numbers, etc.).
  - Use the form to upload the CSV.  
  - The file is sent as multipart/form-data to the `/api/batch` endpoint, which forwards it to the UP2TOM API.
  - You can list, monitor, download, or delete batch processing results through your backend API endpoints.

---

## API Endpoints

### GET `/api/models`
Fetches a list of available models from the UP2TOM API.

### GET `/api/models/[id]`
Fetches detailed metadata for a specific model.

### POST `/api/decision`
Processes a decision request.  
**Expected Payload Example:**
```json
{
  "modelId": "58d3bcf97c6b1644db73ad12",
  "inputData": {
    "data": {
      "type": "scenario",
      "attributes": {
        "input": {
          "INPUTVAR1": 42,
          "INPUTVAR2": "Male",
          "INPUTVAR3": 56,
          "INPUTVAR4": "Yes",
          "INPUTVAR5": "Morning",
          "INPUTVAR6": "NA",
          "INPUTVAR7": "Yes",
          "INPUTVAR8": 5,
          "INPUTVAR9": 7
        }
      }
    }
  }
}
```

### POST `/api/batch`
Handles batch file uploads for processing multiple scenarios. Accepts multipart/form-data with:
- `file`: The CSV file.
- `delimiter`: The delimiter character used in the CSV (e.g., `,`, `|`).

---

## Security Considerations

- **Environment Variables:** Store sensitive keys in `.env` and never commit them to version control.
- **Server-Side API Calls:** All calls to the UP2TOM API are made from server-side API routes to keep API keys secure.
- **Input Validation:** Both client‑ and server‑side validation is used to ensure inputs are safe and valid.
- **File Uploads:** Validate file type and size on the backend; consider scanning for malicious content.
- **Rate Limiting & HTTPS:** Implement rate limiting on API routes and enforce HTTPS in production.
- **Error Handling:** Log errors server‑side without exposing sensitive information to the client.

---

## Contributing

Contributions are welcome! To contribute:
1. Fork the repository.
2. Create a new branch: `git checkout -b feature/your-feature-name`.
3. Commit your changes: `git commit -am 'Add new feature'`.
4. Push to your branch: `git push origin feature/your-feature-name`.
5. Create a pull request with a detailed description of your changes.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Contact

For questions or support, please contact:
- **Email:** [support@merlynn.ai](mailto:support@merlynn.ai)
- **Website:** [https://merlynn.ai](https://merlynn.ai)

---
