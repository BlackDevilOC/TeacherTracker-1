import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Layout from "@/components/layout/Layout";
import Dashboard from "@/pages/Dashboard";
import Attendance from "@/pages/Attendance";
import Absences from "@/pages/Absences";
import SMS from "@/pages/SMS";
import DataImport from "@/pages/DataImport";
import More from "@/pages/More";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/attendance" component={Attendance} />
        <Route path="/absences" component={Absences} />
        <Route path="/sms" component={SMS} />
        <Route path="/data-import" component={DataImport} />
        <Route path="/more" component={More} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
