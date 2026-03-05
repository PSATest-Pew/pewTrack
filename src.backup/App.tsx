/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from '@/pages/Dashboard';
import NewTest from '@/pages/NewTest';
import ActiveTest from '@/pages/ActiveTest';
import Measurements from '@/pages/Measurements';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-emerald-500/30">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/new" element={<NewTest />} />
          <Route path="/test/:id" element={<ActiveTest />} />
          <Route path="/measurements/:id" element={<Measurements />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
