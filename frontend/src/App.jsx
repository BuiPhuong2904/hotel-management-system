import { BrowserRouter, Route, Routes } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import Layout from './components/Layout';
import RoomPage from './pages/RoomPage';
import BookingPage from './pages/BookingPage';
import ServicePage from './pages/ServicePage';
import ServiceUsagePage from './pages/ServiceUsagePage';
import InvoicePage from './pages/InvoicePage';
import CustomerPage from './pages/CustomerPage';
import StaffPage from './pages/StaffPage';
import PromotionPage from './pages/PromotionPage';
import ReportPage from './pages/ReportPage';
import SettingsPage from './pages/SettingsPage';

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
          <Route path="service-usage" element={<ServiceUsagePage />} />
          <Route path="invoices" element={<InvoicePage />} />
          <Route path="customers" element={<CustomerPage />} />
          <Route path="staff" element={<StaffPage />} />
          <Route path="promotions" element={<PromotionPage />} />
          <Route path="reports" element={<ReportPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;