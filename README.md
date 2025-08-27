# Zing Chat - Frontend

A modern, responsive chat application built with React that provides real-time messaging capabilities with a sleek, energetic interface.

## Click Here For Demo [Zing Chat Demo](https://zing-chat-rho.vercel.app)

## ✨ Features

- 🔐 **Authentication System** - Secure login/registration with JWT tokens
- 💬 **Real-time Messaging** - Instant message delivery with typing indicators
- 👥 **Group Chats** - Create and manage group conversations
- 🛡️ **Protected Routes** - Automatic redirect for unauthenticated users
- 🔧 **Admin Controls** - Group administration and management tools
- 🔄 **Password Recovery** - Forgot password functionality with email reset
- 🎨 **Modern UI** - Clean, responsive design with smooth animations
- 📱 **Mobile Friendly** - Responsive design that works on all devices

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd zing-chat-frontend

npm install
# or
yarn install

cp .env.example .env

REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000

npm start
# or
yarn start
```

## 🏗️ Project Structure  
src  
│  
├── assets  
│   ├── default-avatar.png  
│   ├── default-group.png  
│   └── logo.png   
│  
├── components  
│   ├── chat  
│   │   ├── ChatInfo.tsx  
│   │   ├── EditGroup.tsx  
│   │   ├── GroupInfo.tsx  
│   │   └── UserInfo.tsx  
│   │  
│   ├── ConfirmationModal.tsx  
│   ├── ContactsList.tsx  
│   ├── CreateGroupModal.tsx  
│   ├── Layout.tsx  
│   ├── LeaveGroupModal.tsx  
│   ├── LogoutModal.tsx  
│   └── PrivateRoute.tsx  
│   
├── context  
│   ├── AuthContext.tsx  
│   └── ThemeContext.tsx  
│  
├── hooks  
│   └── useSocket.ts  
│   
├── pages  
│   ├── ChatPage.tsx  
│   ├── ForgotPassword.tsx  
│   ├── Groups.tsx  
│   ├── Home.tsx  
│   ├── Login.tsx  
│   ├── Profile.tsx  
│   ├── Register.tsx  
│   ├── ResetPassword.tsx  
│   └── Settings.tsx  
│   
└── services  
    ├── api.ts  
    └── chatService.ts  
    
## 🔧 Configuration

The application can be configured through environment variables:

Variable	Description	Default
REACT_APP_API_URL	Backend API base URL	http://localhost:5000

REACT_APP_SOCKET_URL	WebSocket server URL	http://localhost:5000

REACT_APP_ENABLE_ANALYTICS	Enable analytics	false

## 📦 Available Scripts
```
npm start       # Run app in development
npm test        # Run tests
npm run build   # Build for production
npm run eject   # Eject CRA config (one-way)
```

## 🧪 Testing
```
npm test
npm test -- --coverage
```

## 📱 Browser Support

Chrome 60+

Firefox 60+

Safari 12+

Edge 79+

## 🤝 Contributing

Fork the project

Create your feature branch (git checkout -b feature/AmazingFeature)

Commit your changes (git commit -m 'Add some AmazingFeature')

Push (git push origin feature/AmazingFeature)

Open a Pull Request

## 📄 License

This project is licensed under the MIT License.
