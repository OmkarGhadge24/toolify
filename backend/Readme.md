toolify
│── backend
│   │── controllers
│   │   ├── authController.js
│   │   ├── fileConverterController.js
│   │   ├── textExtractorController.js
│   │   ├── videoToolsController.js
│   │
│   │── middleware
│   │   ├── auth.js
│   │
│   │── models
│   │   ├── Contact.js
│   │   ├── User.js
│   │
│   │── routes
│   │   ├── authRoutes.js
│   │   ├── backgroundRemover.js
│   │   ├── contactRoutes.js
│   │   ├── fileConverterRoutes.js
│   │   ├── pdfRoutes.js
│   │   ├── textExtractorRoutes.js
│   │   ├── videoToolsRoutes.js
│   │
│   │── utils
│   │   ├── converter.js
│   │
│   │── temp
│   │   ├── .gitkeep
│   │
│   │── uploads
│   │   │── audio
│   │   │   ├── .gitkeep
│   │   │── processed
│   │   │   ├── .gitkeep
│   │   │── videos
│   │   │   ├── .gitkeep
│   │
│   │── .env
│   │── .gitignore
│   │── package-lock.json
│   │── package.json
│   │── Readme.md
│   │── server.js
│
│── frontend
│   │── node_modules
│   │
│   │── public
│   │   │── fonts
│   │   │   ├── Poppins-Regular.ttf
│   │   │
│   │   │── images
│   │   │   ├── female.png
│   │   │   ├── male.png
│   │   │   ├── other.png
│   │   │   ├── save.png
│   │   │
│   │   │── favicon.ico
│   │   │── index.html
│   │   │── manifest.json
│   │   │── robots.txt
│   │
│   │── src
│   │   │── components
│   │   │   │── converters
│   │   │   │   ├── ConversionArea.jsx
│   │   │   │   ├── ConverterCard.jsx
│   │   │   │
│   │   │   │── About.jsx
│   │   │   │── ContactUs.jsx
│   │   │   │── Login.jsx
│   │   │   │── Main.jsx
│   │   │   │── Menu.jsx
│   │   │   │── Navbar.jsx
│   │   │   │── Others.jsx
│   │   │   │── Profile.jsx
│   │   │   │── Signup.jsx
│   │
│   │   │── context
│   │   │   ├── ThemeContext.js
│   │
│   │   │── pages
│   │   │   ├── BackgroundRemover.jsx
│   │   │   ├── FileConverter.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── PdfEditor.jsx
│   │   │   ├── TextExtractor.jsx
│   │   │   ├── VideoEditor.jsx
│   │   │   ├── VideoToAudio.jsx
│   │
│   │   │── App.js
│   │   │── index.css
│   │   │── index.js
│   │   │── reportWebVitals.js
│   │
│   │── .gitignore
│   │── package-lock.json
│   │── package.json
│   │── README.md
│   │── tailwind.config.js
