import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/app/provider/AuthProvider";
import { ProtectedRoute } from "@/features/auth";
import { LoginPage } from "@/pages/login";
import { CalendarPage } from "@/pages/calendar";

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* Захищений маршрут для головної сторінки календаря */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<CalendarPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
