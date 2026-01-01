// import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/authContext";
import Router from "./routes";

export default function App() {
  return (
    <>
      {/* <Toaster position="top-center" reverseOrder={false} /> */}
      <AuthProvider>
        <Router />
      </AuthProvider>
    </>
  );
}
