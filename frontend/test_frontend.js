// OptiFit 2.0 Frontend Component Structure Validator
const fs = require('fs');
const path = require('path');

// Test Suite
console.log('----------------------------------------------------');
console.log('RUNNING OPTIFIT 2.0 FRONTEND STATIC STRUCTURAL TESTS');
console.log('----------------------------------------------------');

let passed = true;

const checkFileExists = (filePath, description) => {
  const absPath = path.join(__dirname, filePath);
  if (fs.existsSync(absPath)) {
    console.log(`[PASS] ${description} exists at: ${filePath}`);
    return true;
  } else {
    console.error(`[FAIL] ${description} is missing! Expected at: ${filePath}`);
    passed = false;
    return false;
  }
};

const checkFileContent = (filePath, patterns, description) => {
  const absPath = path.join(__dirname, filePath);
  if (!fs.existsSync(absPath)) return false;

  const content = fs.readFileSync(absPath, 'utf8');
  let fileOk = true;

  patterns.forEach(pattern => {
    if (pattern instanceof RegExp ? pattern.test(content) : content.includes(pattern)) {
      // Pass
    } else {
      console.error(`[FAIL] ${description}: Content check failed in ${filePath}. Missing keyword/pattern: ${pattern}`);
      fileOk = false;
      passed = false;
    }
  });

  if (fileOk) {
    console.log(`[PASS] ${description}: All syntax validation checks passed for ${filePath}`);
  }
};

// 1. Verify existence of critical paths
checkFileExists('package.json', 'Package Configuration');
checkFileExists('vite.config.js', 'Vite Configuration');
checkFileExists('src/main.jsx', 'Main Entrypoint');
checkFileExists('src/App.jsx', 'App Component Routing');
checkFileExists('src/index.css', 'Tailwind Base Style');
checkFileExists('src/services/api.js', 'API Client Service');
checkFileExists('src/context/AuthContext.jsx', 'Auth Context Provider');
checkFileExists('src/context/ThemeContext.jsx', 'Theme Context Provider');

// 2. Validate App.jsx routing elements
checkFileContent('src/App.jsx', [
  'react-router-dom',
  'AuthProvider',
  'ThemeProvider',
  'ProtectedRoute',
  'Layout',
  'Login',
  'Register',
  'Dashboard',
  'ForgotPassword'
], 'App routing dependencies and view registration');

// 3. Validate AuthContext state variables
checkFileContent('src/context/AuthContext.jsx', [
  'AuthContext = createContext()',
  'login = async',
  'register = async',
  'logout',
  'localStorage.getItem(\'token\')'
], 'Auth Context logic structure');

// 4. Validate layout element properties
checkFileContent('src/components/Layout.jsx', [
  'Layout = ({ children',
  'weatherState',
  'setWeatherState',
  'toggleTheme'
], 'Layout layout attributes and togglers');

// 5. Validate Dashboard.jsx layout elements
checkFileContent('src/views/Dashboard.jsx', [
  'Dashboard = ({ weatherState })',
  'recommender',
  'framer-motion',
  'recs = await api.get'
], 'Dashboard variables and framework compatibility');

console.log('----------------------------------------------------');
if (passed) {
  console.log('RESULT: ALL FRONTEND STATIC TESTS COMPLETED SUCCESSFULLY! (PASS)');
  process.exit(0);
} else {
  console.error('RESULT: SOME FRONTEND TESTS HAVE FAILED. PLEASE CORRECT ERRORS. (FAIL)');
  process.exit(1);
}
