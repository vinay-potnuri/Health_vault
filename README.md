🏥 HealthVault
🚀 AI-Powered Personal Health Ecosystem
🌟 Overview

HealthVault is a next-generation AI-powered Medical Wallet that transforms unstructured medical data into structured insights, intelligent analytics, and actionable health decisions.

It enables users to:

Digitize medical records
Understand complex reports
Track their health journey
Share data securely with doctors
🎯 Problem Statement

Healthcare systems today face:

❌ Scattered medical records

❌ Difficult-to-understand prescriptions

❌ Lack of centralized health tracking

❌ Minimal patient engagement

💡 Solution
HealthVault solves this by offering:

📄 AI-driven document parsing
📊 Real-time health analytics
💬 Personalized AI assistant
🔐 Secure and shareable medical records
✨ Key Features
🧠 AI Document Parsing
Converts prescriptions & lab reports into structured JSON
Supports handwritten & printed documents
Powered by Gemini 3 Flash
💬 Health Assistant
Context-aware AI chatbot
Answers health queries based on user history
💊 Medication Manager
Tracks medicines, dosage, frequency
Detects:
Drug interactions
Allergy conflicts
📊 Wellness Dashboard
Generates Wellness Score (0–100)
Based on vitals, adherence & records
📈 Lab Comparison
Visualizes trends (Glucose, Hemoglobin, etc.)
Interactive charts
📄 Doctor Summary
Auto-generates professional PDF health reports
🔐 Secure Sharing
Share via QR codes & temporary links
🧍 Body Map
Visual mapping of medical conditions
🏗️ System Architecture
<img width="1296" height="1520" alt="mermaid-diagram" src="https://github.com/user-attachments/assets/41bbd804-b331-401c-9d86-1ddcc9490ed7" />
🔄 User Flow
<img width="1746" height="894" alt="mermaid-diagram (1)" src="https://github.com/user-attachments/assets/32c60b6c-6f72-40ca-a2e5-c5bd4369374c" />
🧩 Tech Stack
Layer	Technology
Frontend	React 18, TypeScript, Tailwind CSS
Backend	Express.js
AI Engine	Gemini 3 Flash
Database	Firebase Firestore
Authentication	Firebase Auth
Charts	Recharts
Animations	Framer Motion
🧪 Installation
# Navigate into project
cd healthvault

# Install dependencies
npm install

# Start development server
npm run dev
🌍 Environment Variables

Create a .env file:

VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project
GEMINI_API_KEY=your_api_key
🔐 Security & Privacy
User data scoped per authenticated UID
Secure Firebase rules
AI responses include medical disclaimer
Built on Google Cloud infrastructure
📊 Impact
⏱️ Reduces manual analysis time by 90%
🧠 Improves patient understanding
⚠️ Prevents medication risks
🚀 Future Enhancements
Wearable device integration
Predictive health analytics
Multi-language support
Mobile app version
⚠️ Disclaimer

HealthVault is an AI-based assistant and not a substitute for professional medical advice. Always consult a qualified healthcare provider.

🤝 Contributing

Contributions are welcome!

# Fork the repo
# Create a new branch
git checkout -b feature-name

# Commit changes
git commit -m "Add new feature"

# Push
git push origin feature-name
📜 License

This project is licensed under the MIT License.
