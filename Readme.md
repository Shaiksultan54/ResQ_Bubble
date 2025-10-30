# 🚨 RescueConnect - Emergency Resource Management Platform

<div align="center">

![RescueConnect Logo](https://img.shields.io/badge/RescueConnect-Emergency%20Response-red?style=for-the-badge&logo=emergency&logoColor=white)

**Connect. Share. Save Lives.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6+-green.svg)](https://www.mongodb.com/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

[Features](#-features) • [Demo](#-demo) • [Installation](#-installation) • [Usage](#-usage) • [Contributing](#-contributing) • [License](#-license)

</div>

---

## 📖 About

**RescueConnect** is a comprehensive emergency resource management platform designed to revolutionize how rescue agencies collaborate during crisis situations. By enabling real-time resource sharing, equipment rental, and seamless communication, RescueConnect ensures that no resource goes unused when lives are at stake.

### 🎯 Mission

To create a unified ecosystem where emergency response agencies can efficiently share resources, coordinate operations, and respond faster to save more lives.

---

## ✨ Features

### 🔄 **Resource Exchange & Rental System**
- **Share Equipment**: List available resources for borrowing or rental
- **Browse Inventory**: Search through other agencies' available equipment
- **Request Resources**: Submit formal borrow requests with tracking
- **Rental Management**: Track borrowed items with expected return dates
- **Approval Workflow**: Structured approval process for resource requests

### 🚨 **Real-Time Emergency Alerts**
- **Geo-Targeted Alerts**: Send location-based emergency notifications
- **Severity Levels**: Critical, High, Medium, and Low priority alerts
- **Radius-Based Broadcasting**: Alert agencies within specified distance
- **Read Receipts**: Track which agencies have acknowledged alerts
- **Alert History**: Complete audit trail of all emergency communications

### 💬 **Inter-Agency Communication Hub**
- **Direct Messaging**: Real-time chat between agencies
- **Context-Aware Messages**: Reference specific items and borrow requests
- **Message Threading**: Organized conversation history
- **Unread Indicators**: Never miss important communications
- **File Attachments**: Share documents and photos

### 🗺️ **Interactive Location & Mapping**
- **Agency Discovery**: Find nearby emergency response agencies
- **Resource Visualization**: View available resources on interactive map
- **Distance Calculation**: Automatic calculation of agency proximity
- **Operational Radius**: Visual representation of agency coverage areas
- **Real-Time Updates**: Live location tracking for resource transfers

### 📦 **Comprehensive Inventory Management**
- **Multi-Category Support**: Medical, Food, Shelter, Transportation, Communication, Rescue
- **Status Tracking**: Available, Borrowed, In-Use, Maintenance, Depleted
- **Quantity Management**: Track stock levels and units
- **Expiry Date Monitoring**: Alerts for expiring supplies
- **Custom Tags**: Flexible categorization system
- **Search & Filter**: Advanced inventory search capabilities

### 🚚 **Real-Time Resource Tracking** *(Coming Soon)*
- **GPS Tracking**: Live location updates during resource transport
- **Route Monitoring**: Track delivery routes in real-time
- **ETA Calculations**: Estimated time of arrival updates
- **Delivery Confirmation**: Secure delivery verification with codes
- **Emergency Alerts**: In-transit emergency notification system

### 👥 **User & Access Management**
- **Role-Based Access Control**: Admin, Manager, and Staff roles
- **Permission Management**: Granular permission settings
- **Multi-Agency Support**: Manage multiple agencies from one platform
- **User Activity Logs**: Complete audit trail
- **Secure Authentication**: JWT-based authentication system

### 📊 **Analytics & Reporting**
- **Dashboard Analytics**: Real-time statistics and metrics
- **Borrow History**: Complete transaction history
- **Resource Utilization**: Track how resources are being used
- **Agency Performance**: Monitor response times and efficiency

---

## 🏗️ Technology Stack

### **Frontend**
- **React 18** - Modern UI framework
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Leaflet & React-Leaflet** - Interactive maps
- **Socket.io Client** - Real-time communication
- **React Hook Form** - Form validation
- **Lucide React** - Beautiful icons

### **Backend**
- **Node.js & Express** - Server framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Socket.io** - Real-time updates
- **Cors** - Cross-origin resource sharing

### **Database**
- **MongoDB Atlas** - Cloud database
- **Geospatial Indexes** - Location-based queries
- **2dsphere Indexes** - Geographic calculations

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or Atlas account)
- **Git**

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/rescueconnect.git
cd rescueconnect
```

2. **Install Backend Dependencies**
```bash
cd backend
npm install
```

3. **Install Frontend Dependencies**
```bash
cd ../frontend
npm install
```

4. **Environment Configuration**

Create `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/rescueconnect
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/rescueconnect

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

Create `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

5. **Database Setup**

For MongoDB Atlas:
- Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Create a new cluster
- Get your connection string
- Update `MONGODB_URI` in backend `.env`

For Local MongoDB:
```bash
# Start MongoDB service
mongod
```

6. **Start Development Servers**

Backend:
```bash
cd backend
npm run dev
```

Frontend (in a new terminal):
```bash
cd frontend
npm run dev
```

7. **Access the Application**

Open your browser and navigate to:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api

---

## 📱 Usage

### First Time Setup

1. **Register Your Agency**
   - Navigate to `/register`
   - Fill in agency details (name, type, contact information)
   - Provide your agency's address for location-based features
   - Create your admin account

2. **Complete Agency Profile**
   - Add agency logo and description
   - Set operational capacity
   - Add specialties and service areas

3. **Add Inventory Items**
   - Go to Inventory section
   - Add your agency's available resources
   - Categorize items properly for easy discovery

4. **Invite Team Members**
   - Navigate to Users section
   - Add staff members with appropriate roles
   - Assign permissions based on responsibilities

### Daily Operations

#### Borrowing Resources
1. Browse available inventory from other agencies
2. Submit a borrow request with purpose and expected return date
3. Wait for approval from the lending agency
4. Coordinate pickup/delivery
5. Return items on time

#### Sending Alerts
1. Navigate to Alerts section
2. Click "Create Alert"
3. Fill in alert details (title, message, severity)
4. Set location and radius
5. Send to nearby agencies automatically

#### Managing Transfers *(Coming Soon)*
1. Create a transfer with item details
2. Assign staff member for delivery
3. Track real-time location during transport
4. Confirm delivery with security code
5. Complete transfer with photos

---

## 🏛️ Project Structure

```
rescueconnect/
├── backend/
│   ├── controllers/       # Request handlers
│   │   ├── agency.controller.js
│   │   ├── alert.controller.js
│   │   ├── auth.controller.js
│   │   ├── borrow.controller.js
│   │   ├── inventory.controller.js
│   │   ├── message.controller.js
│   │   ├── transfer.controller.js
│   │   └── user.controller.js
│   ├── middleware/        # Express middleware
│   │   ├── auth.middleware.js
│   │   └── socket.middleware.js
│   ├── models/           # MongoDB schemas
│   │   ├── agency.model.js
│   │   ├── alert.model.js
│   │   ├── borrow.model.js
│   │   ├── inventory.model.js
│   │   ├── message.model.js
│   │   ├── transfer.model.js
│   │   └── user.model.js
│   ├── routes/           # API routes
│   │   ├── agency.routes.js
│   │   ├── alert.routes.js
│   │   ├── auth.routes.js
│   │   ├── borrow.routes.js
│   │   ├── inventory.routes.js
│   │   ├── message.routes.js
│   │   ├── transfer.routes.js
│   │   └── user.routes.js
│   ├── scripts/          # Utility scripts
│   └── server.js         # Entry point
│
├── frontend/
│   ├── public/           # Static assets
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   │   ├── auth/
│   │   │   ├── common/
│   │   │   └── layout/
│   │   ├── context/      # React context
│   │   │   ├── AuthContext.tsx
│   │   │   └── SocketContext.tsx
│   │   ├── hooks/        # Custom hooks
│   │   ├── lib/          # API & utilities
│   │   │   └── api.ts
│   │   ├── pages/        # Page components
│   │   │   ├── admin/
│   │   │   ├── agencies/
│   │   │   ├── alerts/
│   │   │   ├── auth/
│   │   │   ├── borrow/
│   │   │   ├── inventory/
│   │   │   ├── map/
│   │   │   ├── messages/
│   │   │   ├── profile/
│   │   │   ├── tracking/
│   │   │   └── users/
│   │   ├── types/        # TypeScript types
│   │   ├── App.tsx       # Main app component
│   │   ├── routes.tsx    # Route definitions
│   │   └── main.tsx      # Entry point
│   └── package.json
│
└── README.md
```

---

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Role-Based Access Control**: Granular permission management
- **Input Validation**: Server-side validation for all inputs
- **CORS Protection**: Configured cross-origin policies
- **Secure Transfer Codes**: Unique codes for resource transfers
- **Session Management**: Automatic token expiration

---

## 🌐 API Documentation

### Authentication Endpoints

```
POST   /api/auth/register          # Register new agency
POST   /api/auth/login             # Login with email
POST   /api/auth/login-with-id     # Login with ID
GET    /api/auth/me                # Get current user
PUT    /api/auth/profile           # Update profile
PUT    /api/auth/change-password   # Change password
```

### Agency Endpoints

```
GET    /api/agencies               # Get all agencies
GET    /api/agencies/:id           # Get agency by ID
POST   /api/agencies               # Create agency (admin)
PUT    /api/agencies/:id           # Update agency
GET    /api/agencies/nearby/:distance  # Get nearby agencies
GET    /api/agencies/type/:type    # Get agencies by type
```

### Inventory Endpoints

```
GET    /api/inventory/agency/:agencyId    # Get agency inventory
GET    /api/inventory/:id                 # Get item by ID
POST   /api/inventory                     # Create inventory item
PUT    /api/inventory/:id                 # Update item
DELETE /api/inventory/:id                 # Delete item
GET    /api/inventory/search              # Search inventory
GET    /api/inventory/other-agencies      # Browse all agencies' inventory
```

### Borrow Endpoints

```
GET    /api/borrow                        # Get all borrow requests
GET    /api/borrow/:id                    # Get borrow request by ID
POST   /api/borrow                        # Create borrow request
PUT    /api/borrow/:id/status             # Update borrow status
GET    /api/borrow/history/agency/:id    # Get agency borrow history
GET    /api/borrow/history/item/:id      # Get item borrow history
```

### Alert Endpoints

```
POST   /api/alerts                        # Create alert
GET    /api/alerts/agency/:agencyId       # Get agency alerts
GET    /api/alerts/sent/:agencyId         # Get sent alerts
PUT    /api/alerts/:alertId/read          # Mark alert as read
PUT    /api/alerts/:alertId/deactivate    # Deactivate alert
GET    /api/alerts/unread/count/:agencyId # Get unread count
```

### Message Endpoints

```
GET    /api/messages/agency/:agencyId          # Get agency messages
GET    /api/messages/conversation/:id1/:id2    # Get conversation
POST   /api/messages                           # Send message
PUT    /api/messages/:id/read                  # Mark as read
GET    /api/messages/unread/count/:agencyId    # Get unread count
```

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Ways to Contribute

1. **Report Bugs**: Found a bug? [Open an issue](https://github.com/yourusername/rescueconnect/issues)
2. **Suggest Features**: Have ideas? [Request a feature](https://github.com/yourusername/rescueconnect/issues)
3. **Submit Pull Requests**: Code contributions are always welcome!
4. **Improve Documentation**: Help make our docs better
5. **Share Feedback**: Tell us about your experience using RescueConnect

### Development Workflow

1. **Fork the Repository**
```bash
# Click the Fork button on GitHub
```

2. **Create a Feature Branch**
```bash
git checkout -b feature/amazing-feature
```

3. **Make Your Changes**
   - Follow the existing code style
   - Write clear commit messages
   - Add tests if applicable
   - Update documentation

4. **Commit Your Changes**
```bash
git commit -m "Add: Amazing new feature"
```

5. **Push to Your Fork**
```bash
git push origin feature/amazing-feature
```

6. **Open a Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Describe your changes clearly

### Code Style Guidelines

- **JavaScript/TypeScript**: Use ESLint configuration
- **React**: Follow React best practices and hooks guidelines
- **Naming**: Use descriptive names for variables and functions
- **Comments**: Add comments for complex logic
- **Testing**: Include tests for new features

### Commit Message Convention

```
Add: New feature
Fix: Bug fix
Update: Changes to existing feature
Refactor: Code refactoring
Docs: Documentation updates
Style: Code style changes
Test: Test additions or modifications
```

---

## 🐛 Known Issues & Roadmap

### Current Limitations

- Real-time GPS tracking is in development
- Mobile app versions coming soon
- Advanced analytics dashboard in progress

### Upcoming Features

- [ ] **Mobile Applications**: Native iOS and Android apps
- [ ] **Advanced Analytics**: Detailed reporting and insights
- [ ] **AI-Powered Matching**: Smart resource matching algorithms
- [ ] **Multi-Language Support**: Internationalization
- [ ] **Offline Mode**: Continue operations without internet
- [ ] **Blockchain Integration**: Immutable resource transfer records
- [ ] **Weather Integration**: Real-time weather data for planning
- [ ] **Drone Coordination**: Track and coordinate drone deliveries
- [ ] **Video Conferencing**: Built-in emergency coordination calls

---

## 📊 Project Status

![GitHub issues](https://img.shields.io/github/issues/yourusername/rescueconnect)
![GitHub pull requests](https://img.shields.io/github/issues-pr/yourusername/rescueconnect)
![GitHub stars](https://img.shields.io/github/stars/yourusername/rescueconnect)
![GitHub forks](https://img.shields.io/github/forks/yourusername/rescueconnect)

**Current Version**: 1.0.0  
**Status**: Active Development  
**Last Updated**: October 2024

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 RescueConnect

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 🙏 Acknowledgments

- **Emergency Response Teams**: For inspiring this project
- **Open Source Community**: For amazing tools and libraries
- **Contributors**: Everyone who has contributed to RescueConnect
- **MongoDB**: For database support and documentation
- **React Team**: For the excellent frontend framework

---

## 📞 Support & Contact
- **Email**: sultan541790@gmail.com


### Getting Help
1. Check the [FAQ](https://github.com/Shaiksultan54/ResQ_Bubble)

---

## 💖 Support the Project

If RescueConnect helps your organization, consider:

- ⭐ **Star this repository**
- 🐦 **Share on social media**
- 💡 **Suggest new features**
- 🤝 **Contribute code**
- 📝 **Improve documentation**

---

<div align="center">

**Made with ❤️ for Emergency Response Teams Worldwide**

[⬆ Back to Top](#-rescueconnect---emergency-resource-management-platform)

</div>

