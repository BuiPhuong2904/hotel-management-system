import { BrowserRouter, Route, Routes } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import Layout from './components/Layout';
import RoomPage from './pages/RoomPage';
import BookingPage from './pages/BookingPage';
import ServicePage from './pages/ServicePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="rooms" element={<RoomPage />} />
          <Route path="bookings" element={<BookingPage />} />
          <Route path="services" element={<ServicePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;