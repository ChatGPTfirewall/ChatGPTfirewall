# ChatGPTFirewall

![Logo](images/android-chrome-192x192.png)

## Description

ChatGPTFirewall is a web-based application that allows users to interact with their data through a conversational interface. This project leverages the power of vector databases and large language models to enable users to upload files, ask questions in natural language, and receive contextual answers.

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

## Prerequisites

Before you begin, ensure you have met the following requirements:
- Docker and Docker Compose are installed on your machine.
- You have an OpenAI API key if you wish to use the ChatGPT response features.

## Installation

Follow these steps to install and run ChatGPTFirewall:

1. **Clone this repository:**
   ##### SSH

   ```sh
   git clone git@github.com:ChatGPTfirewall/ChatGPTfirewall.git
   ```

   ##### HTTPS

   ```sh
   git clone https://github.com/ChatGPTfirewall/ChatGPTfirewall.git
   ```

2. **Navigate to the project directory:**
   ```sh
   cd ChatGPTfirewall
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
   The application should now be running at [http://localhost:5173/](http://localhost:5173/).

## Further Configuration and Commands
Go into the backend container with `docker exec -it backend /bin/bash` and move into the `/chat_with_your_data` Folder. You can execute the following commands in there:
- **Set up the database and manage demo users with the following commands:**
  - Autogenerate database migrations: `python manage.py makemigrations`
  - Apply migrations to the database: `python manage.py migrate`
  - Create demo users: `python manage.py create_demo_users`
  - Delete demo users: `python manage.py delete_demo_users`

## Acknowledgments

This application was developed as part of a research project for our Master's degree in Applied Computer Science by Robert Pfeiffer, Jens-Uwe Hennings, and Mats Klein, under the guidance of Professor Sebastian Gajek. We are grateful for the support and resources provided by Sebastian Gajek and Hochschule Flensburg, which made this project possible.

## License

[Placeholder for License Information]

## Contact Information

For further information, queries, or suggestions, please contact us at [placeholder for contact information].