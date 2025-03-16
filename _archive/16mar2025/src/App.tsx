import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./routes";

import PageHeader from "./components/PageHeader";
import PageFooter from "./components/PageFooter";

function App() {
  return (
    <Router>
      <div className="wrap-page">
        <PageHeader />
        <main className="p-4">
          <AppRoutes />
        </main>
        <PageFooter />
      </div>
    </Router>
  );
}

export default App;
