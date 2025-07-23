# PetConnect SaaS - Backend

This is the backend server for the PetConnect SaaS application, built with Node.js, Express, and MongoDB. It handles user authentication, pet profile management, subscription plans, and payment processing via Razorpay.

## Features

-   **JWT Authentication:** Secure user signup and login with JSON Web Tokens.
-   **Tiered Subscription Plans:** Free, Basic, and Premium tiers with different feature access levels.
-   **Pet Profile Management:** Full CRUD (Create, Read, Update, Delete) operations for pet profiles.
-   **Image Uploads:** Integrates with Cloudinary for robust image hosting.
-   **Payment Integration:** Securely creates payment orders and validates webhooks with Razorpay.
-   **RESTful API:** A well-structured API for the frontend to consume.

## Getting Started

### Prerequisites

-   Node.js (v16 or higher)
-   npm
-   A MongoDB Atlas account (or a local MongoDB instance)
-   A Cloudinary account
-   A Razorpay account

### Setup Instructions

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    ```

2.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

3.  **Install dependencies:**
    ```bash
    npm install
    ```

4.  **Create the environment file:**
    -   Create a file named `.env` in the `backend` root directory.
    -   Copy the contents of `.env.example` into it and fill in your secret keys and database URI.

5.  **Start the server:**
    ```bash
    node server.js
    ```
    The server will be running on `http://localhost:5000`.

### Environment Variables

Create a `.env` file in the root of the `/backend` folder and add the following variables:

| Variable                  | Description                                            | Example Value                                           |
| ------------------------- | ------------------------------------------------------ | ------------------------------------------------------- |
| `MONGODB_URI`             | Your MongoDB connection string.                        | `mongodb+srv://user:pass@cluster...`                    |
| `JWT_SECRET`              | A long, random string for signing JWTs.                | `a_very_long_secret_string`                             |
| `CLOUDINARY_URL`          | Your Cloudinary credentials URL.                       | `cloudinary://key:secret@name`                          |
| `RAZORPAY_KEY_ID`         | Your secret Key ID from the Razorpay dashboard.        | `rzp_test_xxxxxxxx`                                     |
| `RAZORPAY_KEY_SECRET`     | Your secret Key Secret from the Razorpay dashboard.    | `your_razorpay_secret`                                  |
| `RAZORPAY_WEBHOOK_SECRET` | The secret for validating Razorpay webhooks.           | `your_webhook_secret`                                   |
| `CLIENT_URL`              | The URL of your running frontend application.          | `http://localhost:3000`                                 |
| `PORT`                    | The port for the backend server to run on.             | `5000`                                                  |