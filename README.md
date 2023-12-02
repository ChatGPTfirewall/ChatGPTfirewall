# Forschungsprojekt-CCC

![Logo](images/android-chrome-192x192.png)

## Description

Forschungsprojekt-CCC is a web-based application that allows users to interact with their data through a conversational interface. This project leverages the power of vector databases and large language models to enable users to upload files, ask questions in natural language, and receive contextual answers.

## Features

- **Conversational Data Interaction**: Users can chat with their data by uploading files and asking questions in natural language.
- **File Upload Support**: Manual file uploads are supported with Nextcloud integration, and S3 support is underway.
- **Vector Database Integration**: Utilizes Qdrant for efficient similarity searches on text data.
- **Editable Responses**: Adjust the number of facts and sentences returned from searches.
- **Customizable Prompts**: Customize the prompts sent to ChatGPT for tailored answers.
- **Authentication**: Secure user login with Auth0.
- **File Management**: Easily manage, reload, or delete uploaded files.
- **Demo Mode**: Explore the application's capabilities with preloaded files in demo mode.
- **Multilingual**: The application supports both German and English languages.

## Tech Stack

- Frontend: React with TypeScript, Vite
- Backend: Django
- Database: PostgreSQL
- Search Engine: Qdrant

## Prerequisites

Before you begin, ensure you have met the following requirements:
- Docker and Docker Compose are installed on your machine.
- You have an OpenAI API key if you wish to use the ChatGPT response features.

## Installation

Follow these steps to install and run Forschungsprojekt-CCC:

1. **Clone the repository:**
   ```sh
   git clone https://gitlab.hs-flensburg.de/forschungsprojekt/confidential-cloud-computing.git
   ```

2. **Navigate to the project directory:**
   ```sh
   cd confidential-cloud-computing
   ```

3. **Create and configure the `.env` file:**
   ```sh
   cp .env.example .env
   ```
   Edit the `.env` file and adjust the variables to your needs. Make sure to set the `OPEN_AI_KEY` to enable the ChatGPT response.

4. **Build and start the application:**
   ```sh
   docker compose up --build
   ```
   The `--build` flag ensures that Docker builds the images before starting the containers. Use this command especially after making changes to the `.env` file or updating dependencies in `requirements.txt`.

5. **The application should now be running at [http://localhost:5173/](http://localhost:5173/).**

## Further Configuration and Commands

After installing, you may want to set up the database or create demo users:

- **Move into the `chat_with_your_data` directory:**
  ```sh
  cd chat_with_your_data
  ```
  The following commands can only be executed within this directory.

- **Autogenerate database migrations:**
  ```sh
  python manage.py makemigrations
  ```
  Run this after creating a new database model.

- **Apply migrations to the database:**
  ```sh
  python manage.py migrate
  ```
  This will update the database schema.

- **Create demo users:**
  ```sh
  python manage.py create_demo_users
  ```
  This will create a German and an English demo user with demo files.

- **Delete demo users:**
  ```sh
  python manage.py delete_demo_users
  ```
  Use this to clean up the demo data.

## Further Information

For additional details and documentation, please refer to the [Wiki](https://gitlab.hs-flensburg.de/forschungsprojekt/confidential-cloud-computing/-/wikis/home).