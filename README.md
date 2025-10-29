# Recipe WebApp (Fork)

## Overview

Recipe WebApp is a scalable, modern web application designed for recipe sharing and social interaction. Developed as part of the Fork platform in the USC Genesis Program, the project leverages robust event-driven architecture and a modern JavaScript stack to support thousands of concurrent users. The system is engineered for reliability, scalability, and real-time responsiveness.

## Features

- **Recipe Sharing:** Users can post, discover, and save recipes in a social context.
- **Event-Driven Microservices:** Built with Kafka and the Transactional Outbox pattern for strong data consistency and real-time feeds.
- **Scalable Design:** Supports thousands of users with TypeScript, Node.js, and PostgreSQL.
- **Modern UI:** Built using React and styled with CSS for a clean, intuitive interface.

## Technology Stack

- **Frontend:** React, TypeScript, CSS
- **Backend:** Node.js, TypeScript, PostgreSQL
- **Messaging:** Apache Kafka (microservices architecture)
- **Other Languages:** JavaScript, Shell, HTML

## Getting Started

1. **Clone the repository:**
```
git clone https://github.com/sragvivadali/recipe-webapp.git
```
2. **Install dependencies:**
```
npm install
```
3. **Configure environment variables:**
- Edit `.env` with your PostgreSQL credentials and Kafka configuration
4. **Run the development server:**
```
npm start
```


## Contributing

If you'd like to contribute, please fork the repository, submit a pull request, or open an issue with suggestions or bug reports. See the Issues tab for current tasks or requested features.

## Contact

For questions or collaboration opportunities, reach out to the maintainer via LinkedIn or GitHub.

