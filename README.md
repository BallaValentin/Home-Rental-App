# Home Rent Application

The **Home Rent Application** is a full-stack project that allows users to advertise and rent houses. Users can create property listings, browse available homes, and send messages to each other through the platform.  

## Features

- User registration, authentication, and authorization.  
- Upload and manage property advertisements.  
- Browse and search available houses for rent.  
- Direct messaging system for communication between users.  
- Relational data storage with MSSQL.  
- Simple and responsive user interface.  

## Technologies

### Frontend
- **HTML, CSS, JavaScript** for the client-side interface.  

### Backend
- **Node.js** for server-side logic.  
- **MSSQL** for structured data storage.  
- **Express.js** for handling route endpoints.  
- Authentication and authorization with role-based access.  

## Getting Started

### Prerequisites
- Node.js >= 14  
- MSSQL running locally or remotely  

### Installation

1. Clone the repository:

```bash
git clone https://github.com/BallaValentin/Home-Rental-App.git
```

2. Navigate into the project directory:

```bash
cd Home-Rental-App
```

3. Install dependencies

```bash
npm install
```

4. Configure your database connection in application.env
   
```env
DB_SERVER=DATABASE_SERVER_NAME
DB_USER=DATABASE_USERNAME
DB_PASSWORD=DATABASE_PASSWORD
DB_NAME=DATABASE_NAME
```

5. Run the server

```bash
npm run devStart
```
