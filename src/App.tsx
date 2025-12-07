import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Objekte from "./pages/Objekte";
import Bestellungen from "./pages/Bestellungen";
import BestellungDetail from "./pages/BestellungDetail";
import NeueBestellung from "./pages/NeueBestellung";
import WaescheSets from "./pages/WaescheSets";
import Artikel from "./pages/Artikel";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            <Route path="/dashboard" element={
              <ProtectedRoute><Dashboard /></ProtectedRoute>
            } />
            <Route path="/objekte" element={
              <ProtectedRoute><Objekte /></ProtectedRoute>
            } />
            <Route path="/objekte/:id" element={
              <ProtectedRoute><Objekte /></ProtectedRoute>
            } />
            <Route path="/bestellungen" element={
              <ProtectedRoute><Bestellungen /></ProtectedRoute>
            } />
            <Route path="/bestellungen/neu" element={
              <ProtectedRoute><NeueBestellung /></ProtectedRoute>
            } />
            <Route path="/bestellungen/:id" element={
              <ProtectedRoute><BestellungDetail /></ProtectedRoute>
            } />
            <Route path="/waeschesets" element={
              <ProtectedRoute><WaescheSets /></ProtectedRoute>
            } />
            <Route path="/artikel" element={
              <ProtectedRoute><Artikel /></ProtectedRoute>
            } />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
